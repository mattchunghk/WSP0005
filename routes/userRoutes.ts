import express from 'express'
import { Request, Response } from 'express'
// import path from 'path'
// import jsonfile from 'jsonfile'
import { isLoggedIn } from '../isLoggedIn'
import { client, io } from '../app'
import fs from 'fs'
import { checkPassword, hashPassword } from './hash'
import fetch from 'cross-fetch'
import crypto from 'crypto'
import { fileFrom } from 'node-fetch'
import { setDefaultResultOrder } from 'dns'

export const userRoutes = express.Router()
userRoutes.post('/login', login)
userRoutes.get('/login/google', loginGoogle)
userRoutes.get('/logout', logout)

async function login(req: Request, res: Response) {
	const { username, password } = req.body

	const users = (
		await client.query(`SELECT * FROM users WHERE users.username = $1`, [
			username
		])
	).rows
	const user = users[0]
	if (!user) {
		return res.status(401).redirect('/login.html?error=Incorrect+Username')
	}

	const match = await checkPassword(password, user.password)
	if (match) {
		if (req.session) {
			req.session.name = user.username
			req.session.isLoggedIn = true
			req.session.useId = user.id

			// req.session['user'] = {
			// 	id: user.id
			// }
		}
		return res.redirect('/') // To the protected page.
	} else {
		return res.status(401).redirect('/login.html?error=Incorrect+Username')
	}
}

userRoutes.post('/users', async (req, res) => {
	const { username, password } = req.body
	let hashedPassword = await hashPassword(password)
	console.log(hashedPassword)

	await client.query(`INSERT INTO users (username,password) VALUES ($1,$2)`, [
		username,
		hashedPassword
	])
	res.json({ success: true })
})

async function logout(req: Request, res: Response) {
	try {
		req.session.destroy(() => {
			console.log('User logged out')
		})
		req.session.name = ''
		req.session.isLoggedIn = false
		req.session.useId = ''
		res.status(200).json({ message: 'User logged Out Success!' })
	} catch (err) {
		res.status(400).send('logout error')
	}
}

userRoutes.delete(
	'/delete/id/:id',
	isLoggedIn,
	async (req: Request, res: Response) => {
		const id = req.params.id

		try {
			let imgName = await client.query(
				`select image from memos where id = ${id};`
			)
			fs.unlink(`./uploads/${imgName.rows[0].image}`, (err) => {
				if (err) console.log('delete img error')
			})

			// fs.unlinkSync(`./uploads/${imgName.rows[0].image}`)
			await client.query(`DELETE FROM likes WHERE memo_id=${id}`)
			await client.query(`DELETE FROM memos WHERE id=${id}`)
			io.emit('memoUpdated')
			res.status(200).json('deleted')
			return
		} catch (error) {
			res.status(401).json('logged In')
		}
	}
)

userRoutes.put('/like', isLoggedIn, async (req: Request, res: Response) => {
	try {
		const id: any = req.query.id
		// console.log(memosId.rows[0].id)
		let likesUser: any = await client.query(
			`SELECT count(*) FROM likes WHERE memo_id=${id} and user_id = ${req.session.useId};`
		)
		console.log(likesUser)
		if (parseInt(likesUser.rows[0].count) == 0) {
			await client.query(
				`INSERT INTO likes (user_id, memo_id) VALUES (${req.session.useId},${id});`
			)
		} else {
			await client.query(
				`DELETE FROM likes WHERE memo_id=${id} and user_id = ${req.session.useId};`
			)
		}

		let likeNum: any = await client.query(
			`SELECT count(*) FROM likes WHERE memo_id = ${id};`
		)

		console.log(parseInt(likeNum.rows[0].count))
		await client.query(
			`UPDATE memos SET likes_num = '${likeNum.rows[0].count}' WHERE id = ${id};`
		)

		res.json({
			message: 'like INSERTED'
		})
	} catch (error) {
		res.status(401).send('Please Login')
	}
})

userRoutes.put('/update/', isLoggedIn, async (req: Request, res: Response) => {
	try {
		const id: any = req.query.id
		const updatedText: any = req.query.update

		await client.query(
			`UPDATE memos SET content = '${updatedText}' WHERE id = ${id};`
		)

		io.emit('memoUpdated')

		res.status(200).json('deleted')
	} catch (error) {
		res.status(401).send('Please Login')
	}
})

async function loginGoogle(req: express.Request, res: express.Response) {
	try {
		const accessToken = (req.session?.grant as any).response.access_token
		const fetchRes = await fetch(
			'https://www.googleapis.com/oauth2/v2/userinfo',
			{
				method: 'get',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		)

		const result = await fetchRes.json()
		console.log(result)

		const users = (
			await client.query(
				`SELECT * FROM users WHERE users.username = $1`,
				[result.email]
			)
		).rows
		let user = users[0]
		if (!user) {
			//create a 32bit crypto password

			console.log(user)
			let password = await hashPassword(result.email)
			console.log(password)
			user = (
				await client.query(
					`INSERT INTO users (username,password)
	            VALUES ($1,$2) RETURNING *`,
					[result.email, password]
				)
			).rows[0]
		}
		if (req.session) {
			req.session.name = user.username
			req.session.isLoggedIn = true
			req.session.useId = user.id
			req.session['user'] = result
		}
		return res.redirect('/')
	} catch (error) {
		res.status(401).send('Invalid credentials')
	}
}

userRoutes.get('/me', getMe)
async function getMe(req: express.Request, res: express.Response) {
	res.status(200).json(req.session)
}
