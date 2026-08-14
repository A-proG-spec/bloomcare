import nodemailer from "nodemailer";
import { environment } from "./enviroment";

const emailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: environment.GMAIL_USER,
    pass: environment.GMAIL_APP_PASSWORD,
  },
});

export default emailTransporter;