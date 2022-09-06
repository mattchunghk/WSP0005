import express from 'express'
import { Request, Response } from 'express'
import path from 'path'
import expressSession from 'express-session'
import fs from 'fs'
import { isLoggedIn } from './isLoggedIn'
import { uploadDir } from './upload'
import pg from 'pg'
import dotenv from 'dotenv'
import http from 'http'
import { Server as SocketIO } from 'socket.io'

import { userRoutes } from './routes/userRoutes'
import { memoRoutes } from './routes/memoRoutes'

const app = express()
const server = new http.Server(app)
export const io = new SocketIO(server)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

io.on('connection', function (socket) {
	io.emit('new-user', 'Congratulations! New User Created!')
})

app.use(
	expressSession({
		secret: 'Tecky Academy teaches typescript',
		resave: true,
		saveUninitialized: true
	})
)

declare module 'express-session' {
	interface SessionData {
		counter?: number
		name?: string
		isLoggedIn?: Boolean
		useId?: number
	}
}
dotenv.config()
export const client = new pg.Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
})

app.use('/admin', userRoutes)
app.use('/memo', memoRoutes)

fs.mkdirSync(uploadDir, { recursive: true })

app.post('/logout', function (req, res) {
	try {
		req.session.name = ''
		req.session.isLoggedIn = false
		res.send('log Out Success!')
	} catch (err) {
		res.status(400).send('logout error')
	}
})

//ex001
let counter: number = 0
app.use((req: Request, res: Response, next) => {
	counter++
	req.session.counter = counter
	console.log(`Counter: ${req.session.counter}`)
	console.log(`[${new Date().toLocaleString()}]Request${req.path}`)
	next()
})

const PORT = 8080

app.use(express.static('public'))
app.use(express.static('assets'))
app.use(express.static('uploads'))
app.use(isLoggedIn, express.static('protected'))

app.use((req, res) => {
	res.sendFile(path.resolve('./public/404.html'))
})

async function start() {
	await client.connect()
	server.listen(PORT, () => {
		console.log(`Listening at http://localhost:${PORT}/`)
	})
}

start()
