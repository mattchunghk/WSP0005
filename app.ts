import express from "express";
import { Request, Response } from "express";
import path from "path";
import expressSession from "express-session";
import jsonfile from "jsonfile";
import formidable from "formidable";
import fs from "fs";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  expressSession({
    secret: "Tecky Academy teaches typescript",
    resave: true,
    saveUninitialized: true,
  })
);

declare module "express-session" {
  interface SessionData {
    counter?: number;
    name?: string;
    isLoggedIn?: Boolean;
  }
}

const uploadDir = "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 2000 * 1024 ** 2, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
  filename: (originalName, originalExt, part, form) => {
    counter++;
    let fieldName = part.name;
    let timestamp = Date.now();
    let ext = part.mimetype?.split("/").pop();
    return `${fieldName}-${timestamp}-${counter}.${ext}`;
  },
});

const formParse = (req: express.Request) => {
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      const text = fields.memoText;
      let filename: string = "";

      let file = Array.isArray(files.memoFile)
        ? files.memoFile[0]
        : files.memoFile;
      if (file) {
        filename = file.newFilename;
      } else {
        filename = "None";
      }
      console.log(files);
      resolve({
        filename,
        text,
      });
    });
  });
};

app.post("/memo-formidable", async (req, res) => {
  try {
    console.log("formidable start");

    const obj: any = await formParse(req);
    const memos = await jsonfile.readFile(path.join(__dirname, "memo.json"));
    console.log({ obj });
    counter++;
    memos.push({
      id: `${Date.now()}${counter}`,
      content: obj["text"],
      image: obj["filename"],
      like: [],
    });
    await jsonfile.writeFile(path.join(__dirname, "memo.json"), memos, {
      spaces: 3,
    });
    res.end("success");
    return;
  } catch (e) {
    res.status(400).send("Upload Fail");
    return;
  }
});

app.get("/memo", async (req, res) => {
  try {
    const memos: any[] = await jsonfile.readFile(
      path.join(__dirname, "memo.json")
    );
    res.status(200).json(memos.reverse());
    return;
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

app.put("/admin/like", async (req: Request, res: Response) => {
  const id: any = req.query.id;
  try {
    let likeItems = await jsonfile.readFileSync(
      path.join(__dirname, "memo.json")
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

    await jsonfile.writeFile(path.join(__dirname, "memo.json"), likeItems, {
      spaces: 4,
    });
    res.json(likeItems);
  } catch (error) {
    res.status(401).send("Please Login");
  }
});

//ex001

let counter: number = 0;

app.use((req: Request, res: Response, next) => {
  counter++;
  req.session.counter = counter;
  console.log(`Counter: ${req.session.counter}`);
  console.log(`[${new Date().toLocaleString()}]Request${req.path}`);
  next();
});

const isLoggedInAPI = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.session.isLoggedIn) {
    next();
    return;
  }
  res.status(401).send("Please Login");
  //   res.status(401).redirect("/index.html");
  return;
};

app.put("/memo/update/", isLoggedInAPI, async (req: Request, res: Response) => {
  try {
    const id: any = req.query.id;
    const updatedText: any = req.query.update;

    let updateItems = await jsonfile.readFileSync(
      path.join(__dirname, "memo.json")
    );
    // console.log(parseInt(id));
    // updateItems[id].content = updatedText;
    for (let i = 0; i < updateItems.length; i++) {
      if (updateItems[i].id == parseInt(id)) {
        updateItems[i].content = updatedText;
        break;
      }
    }

    await jsonfile.writeFile(path.join(__dirname, "memo.json"), updateItems, {
      spaces: 2,
    });
    res.json(updateItems);
  } catch (error) {
    res.status(401).send("Please Login");
  }
});

app.delete(
  "/memo/delete/id/:id",
  isLoggedInAPI,
  async (req: Request, res: Response) => {
    const id = req.params.id;

    let deletedItems = await jsonfile.readFileSync(
      path.join(__dirname, "memo.json")
    );
    //   deletedItems.filter((item: any) => item.id != parseInt(id));
    for (let i = 0; i < deletedItems.length; i++) {
      if (deletedItems[i].id == parseInt(id)) {
        deletedItems.splice(i, 1);
        break;
      }
    }
    await jsonfile.writeFile(path.join(__dirname, "memo.json"), deletedItems, {
      spaces: 3,
    });
    res.json(deletedItems);
  }
);

//ex002
app.get("/admin", async (req, res) => {
  try {
    const memos: any[] = await jsonfile.readFile(
      path.join(__dirname, "users.json")
    );
    res.status(200).json(memos);
    return;
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

app.post("/admin", async (req: Request, res: Response) => {
  let admins = await jsonfile.readFileSync(path.join(__dirname, "users.json"));
  for (let admin of admins) {
    if (
      req.body.username === admin.username &&
      req.body.password === admin.password
    ) {
      req.session.name = req.body.username;
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

// app.get("/admin", (req: Request, res: Response) => {
//   res.sendFile(path.resolve("public", "index.html"));
// });

const PORT = 8080;

app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.static("uploads"));

const isLoggedIn = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.session.isLoggedIn) {
    next();
    return;
  }
  res.status(401).end("Please Login");
  //   res.status(401).redirect("/index.html");
  return;
};
app.use(isLoggedIn, express.static("protected"));

app.use((req, res) => {
  res.sendFile(path.resolve("./public/404.html"));
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`);
});
