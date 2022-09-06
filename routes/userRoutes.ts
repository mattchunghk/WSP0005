import express from 'express'
import { Request, Response } from 'express'
import path from 'path'
import jsonfile from 'jsonfile'
import { isLoggedIn } from '../isLoggedIn'
import { client, io } from '../app'
import fs from 'fs'

export const userRoutes = express.Router()

userRoutes.post('/login', async (req: Request, res: Response) => {
	const admins = await client.query('SELECT * from users')

	for (let admin of admins.rows) {
		if (
			req.body.username === admin.username &&
			req.body.password === admin.password
		) {
			req.session.name = admin.username
			req.session.isLoggedIn = true
			req.session.useId = admin.id
			//   res.status(200).redirect("/admin.html");
			res.send('success')

			return
		}
	}
	req.session.name = ''
	req.session.isLoggedIn = false
	res.status(401).send('Please Login')

	//   res.status(401).redirect("/index.html?msg=Login%20failed");
})

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

// userRoutes.put('/like', isLoggedIn, async (req: Request, res: Response) => {
// 	const id: any = req.query.id
// 	try {
// 		let likeItems = await jsonfile.readFileSync(
// 			path.join(__dirname, '../memo.json')
// 		)

// 		likeItems
// 			.filter((likeItem: { id: number }) => likeItem.id == parseInt(id))
// 			.map((likeItem: { like: Array<any> }) =>
// 				!likeItem.like.includes(req.session.name)
// 					? likeItem.like.push(req.session.name)
// 					: likeItem.like.splice(
// 							likeItem.like.indexOf(req.session.name),
// 							1
// 					  )
// 			)

// 		await jsonfile.writeFile(
// 			path.join(__dirname, '../memo.json'),
// 			likeItems,
// 			{
// 				spaces: 4
// 			}
// 		)
// 		res.json(likeItems)
// 	} catch (error) {
// 		res.status(401).send('Please Login')
// 	}
// })
