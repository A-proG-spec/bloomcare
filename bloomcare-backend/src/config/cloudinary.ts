import { v2 as cloudinary } from "cloudinary";
import { environment } from "./enviroment";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: environment.CLOUDINARY_CLOUD_NAME,
  api_key: environment.CLOUDINARY_API_KEY,
  api_secret: environment.CLOUDINARY_API_SECRET,
});

logger.info("Cloudinary configured successfully");

export { cloudinary };