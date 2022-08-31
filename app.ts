import express from "express";
import { Request, Response } from "express";
import path from "path";
import expressSession from "express-session";

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    secret: "Tecky Academy teaches typescript",
    resave: true,
    saveUninitialized: true,
  })
);

declare module "express-session" {
  interface SessionData {
    name?: string;
    password?: string;
    counter?: number;
  }
}
app.use((req: Request, res: Response, next) => {
  req.session.name = "admin";
  req.session.name = "admin123";
  next();
});

let counter = 0;

app.use((req: Request, res: Response, next) => {
  counter++;
  req.session.counter = counter;
  console.log(`Counter: ${req.session.counter}`);
  console.log(`[${new Date().toLocaleString()}]Request${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
});

app.post("/", (req, res) => {
  if (req.body.username === "admin" && req.body.password === "admin123") {
    res.send("correct");
  } else {
    res.send("Incorrect");
  }
});

const PORT = 8080;

app.use(express.static("public"));
app.use(express.static("assets"));

app.use((req, res) => {
  res.sendFile(path.resolve("./public/404.html"));
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`);
});
