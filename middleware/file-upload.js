const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/images");
  },
  filename: (req, file, callback) => {
    const ext = MIME_TYPE_MAP[file.mimetype]; // get the mimetype
    callback(null, uuidv4() + "." + ext);
  },
});

const fileUpload = multer({
  limits: 5000000,
  storage,
  fileFilter: (req, file, callback) => {
    // error or null
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; // !! converts unfefined to false
    let error = isValid ? null : new Error("Invalid mimetype provided");
    callback(error, isValid);
  },
});

module.exports = fileUpload;
