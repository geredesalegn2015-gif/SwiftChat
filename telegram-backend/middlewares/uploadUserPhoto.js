import multer from "multer";
import sharp from "sharp";
import AppError from "../utils/AppError.js";

// Store file in memory for sharp processing
const multerStorage = multer.memoryStorage();

// Only allow image uploads
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an image! Upload only images.", 400), false);
};

// Create multer upload object
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Middleware: upload single 'photo' field
export const uploadUserPhoto = upload.single("photo");

// Middleware: resize and save image
export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  // Generate custom filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Process image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};
