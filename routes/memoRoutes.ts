import express from "express";
import { Request, Response } from "express";
import { formParse } from "../upload";
import path from "path";
import jsonfile from "jsonfile";
let counter: number = 0;

export const memoRoutes = express.Router();

memoRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const memos: any[] = await jsonfile.readFile(
      path.join(__dirname, "../memo.json")
    );
    res.status(200).json(memos.reverse());
    return;
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

memoRoutes.post("/memo-formidable", async (req, res) => {
  try {
    console.log("formidable start");

    const obj: any = await formParse(req);
    const memos = await jsonfile.readFile(path.join(__dirname, "../memo.json"));
    console.log({ obj });
    counter++;
    memos.push({
      id: `${Date.now()}${counter}`,
      content: obj["text"],
      image: obj["filename"],
      like: [],
    });
    await jsonfile.writeFile(path.join(__dirname, "../memo.json"), memos, {
      spaces: 3,
    });
    res.end("success");
    return;
  } catch (e) {
    res.status(400).send("Upload Fail");
    return;
  }
});
