import multer, { FileFilterCallback } from "multer";
import { cloudinary } from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";


type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bloomcare/users",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  } as any, // CloudinaryStorage params type is not fully typed
});


const fileFilter = (
  req: Request,
  file: any,
  cb: FileFilterCallback
): void => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
    ));
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Maximum number of files
  },
  fileFilter: fileFilter,
});

export { upload };