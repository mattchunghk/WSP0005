import formidable, { Files } from "formidable";
export const uploadDir = "uploads";
import express from "express";
let counter: number = 0;

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

export const formParse = (req: express.Request) => {
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
      resolve({
        filename,
        text,
      });
    });
  });
};
