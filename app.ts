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
import grant from 'grant'

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
		useId?: any
		grant?: any
		user: any
	}
}
dotenv.config()

export const client = new pg.Client({
	database: process.env.DB_NAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD
})

const grantExpress = grant.express({
	defaults: {
		origin: 'http://localhost:8080',
		transport: 'session',
		state: true
	},
	google: {
		key: process.env.GOOGLE_CLIENT_ID || '',
		secret: process.env.GOOGLE_CLIENT_SECRET || '',
		scope: ['profile', 'email'],
		callback: '/admin/login/google'
	}
})

app.use(grantExpress as express.RequestHandler)

app.use('/admin', userRoutes)
app.use('/memo', memoRoutes)

fs.mkdirSync(uploadDir, { recursive: true })

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
