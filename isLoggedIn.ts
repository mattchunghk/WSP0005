import express from 'express'

export const isLoggedIn = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	if (req.session.isLoggedIn) {
		next()
		return
	}
	res.status(401).end('Please Login')
	//   res.status(401).redirect("/index.html");
	return
}

// import { Request, Response, NextFunction } from 'express'

// export function isLoggedIn(req: Request, res: Response, next: NextFunction) {
// 	if (req.session?.['user']) {
// 		next()
// 	} else {
// 		res.redirect('/login.html')
// 	}
// }
