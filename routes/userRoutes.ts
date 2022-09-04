import express from "express";
import { Request, Response } from "express";
import path from "path";
import jsonfile from "jsonfile";
import { isLoggedIn } from "../isLoggedIn";
import fs from "fs";

export const userRoutes = express.Router();

userRoutes.post("/login", async (req: Request, res: Response) => {
  let admins = await jsonfile.readFileSync(
    path.join(__dirname, "../users.json")
  );
  for (let admin of admins) {
    if (
      req.body.username === admin.username &&
      req.body.password === admin.password
    ) {
      req.session.name = admin.username;
      req.session.isLoggedIn = true;
      //   res.status(200).redirect("/admin.html");
      res.send("success");
      return;
    }
  }
  req.session.name = "";
  req.session.isLoggedIn = false;
  res.status(401).send("Please Login");
  //   res.status(401).redirect("/index.html?msg=Login%20failed");
});

userRoutes.delete(
  "/delete/id/:id",
  isLoggedIn,
  async (req: Request, res: Response) => {
    const id = req.params.id;

    let deletedItems = await jsonfile.readFileSync(
      path.join(__dirname, "../memo.json")
    );
    //   deletedItems.filter((item: any) => item.id != parseInt(id));
    for (let i = 0; i < deletedItems.length; i++) {
      if (deletedItems[i].id == parseInt(id)) {
        fs.unlink(`./uploads/${deletedItems[i].image}`, function (err) {
          if (err) throw err;
          console.log("File deleted!");
        });
        deletedItems.splice(i, 1);
        break;
      }
    }
    await jsonfile.writeFile(
      path.join(__dirname, "../memo.json"),
      deletedItems,
      {
        spaces: 3,
      }
    );
    res.json(deletedItems);
  }
);

userRoutes.put("/like", isLoggedIn, async (req: Request, res: Response) => {
  const id: any = req.query.id;
  try {
    let likeItems = await jsonfile.readFileSync(
      path.join(__dirname, "../memo.json")
    );

    for (let i = 0; i < likeItems.length; i++) {
      if (likeItems[i].id == parseInt(id)) {
        if (!likeItems[i].like.includes(req.session.name)) {
          likeItems[i].like.push(req.session.name);
        } else {
          let likeIndex = likeItems[i].like.indexOf(req.session.name);
          likeItems[i].like.splice(likeIndex, 1);
        }
        break;
      }
    }

    await jsonfile.writeFile(path.join(__dirname, "../memo.json"), likeItems, {
      spaces: 4,
    });
    res.json(likeItems);
  } catch (error) {
    res.status(401).send("Please Login");
  }
});

userRoutes.put("/update/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const id: any = req.query.id;
    const updatedText: any = req.query.update;

    let updateItems = await jsonfile.readFileSync(
      path.join(__dirname, "../memo.json")
    );
    // console.log(parseInt(id));
    // updateItems[id].content = updatedText;
    for (let i = 0; i < updateItems.length; i++) {
      if (updateItems[i].id == parseInt(id)) {
        updateItems[i].content = updatedText;
        break;
      }
    }

    await jsonfile.writeFile(
      path.join(__dirname, "../memo.json"),
      updateItems,
      {
        spaces: 2,
      }
    );
    res.json(updateItems);
  } catch (error) {
    res.status(401).send("Please Login");
  }
});
