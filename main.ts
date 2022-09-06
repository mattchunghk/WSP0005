import pg from 'pg'
import dotenv from 'dotenv'

// dotenv.config()
// const client = new pg.Client({
// 	database: process.env.DB_NAME,
// 	user: process.env.DB_USERNAME,
// 	password: process.env.DB_PASSWORD
// })

// async function main() {
// 	await client.connect() // "dial-in" to the postgres server
// 	const user = {
// 		username: 'admin',
// 		password: 'admin'
// 	}
// 	await client.query('INSERT INTO users (username,password) values ($1,$2)', [
// 		user.username,
// 		user.password
// 	])

// 	const result = await client.query(
// 		// 'SELECT * from users where username = $1',
// 		'SELECT * from users'
// 	)
// 	console.log(result.rows) // gordon
// 	await client.end() // close connection with the database
// }
// main()
