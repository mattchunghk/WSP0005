import express from "express";
import path from "path";
import jsonfile from "jsonfile";

export const userRoutes = express.Router();
userRoutes.use(express.urlencoded({ extended: true }));
userRoutes.use(express.json());

userRoutes.post("/admin", async (req: Request, res: Response) => {
  let admins = await jsonfile.readFileSync(path.join(__dirname, "users.json"));
  for (let admin of admins) {
    if (
      req.body.username === admin.username &&
      req.body.password === admin.password
    ) {
      req.session.name = req.body.username;
      req.session.isLoggedIn = true;
      //   res.status(200).redirect("/admin.html");
      res.status(200).redirect("/admin.html");
      //   res.send("success");
      return;
    }
  }
  req.session.name = "";
  req.session.isLoggedIn = false;

  res.status(401).redirect("/index.html?msg=Login%20failed");
});

userRoutes.get("/admin", (req: Request, res: Response) => {
  res.sendFile(path.resolve("public", "index.html"));
});
