import emailTransporter from "./config/email";
import { environment } from "./config/enviroment";

async function testEmail() {
  try {
    console.log("Gmail:", environment.GMAIL_USER);
console.log(
  "App password length:",
  environment.GMAIL_APP_PASSWORD.length
);
    await emailTransporter.verify();
console.log("Gmail:", environment.GMAIL_USER);
console.log(
  "App password length:",
  environment.GMAIL_APP_PASSWORD.length
);
    console.log("✅ Gmail SMTP connection successful");
    console.log("Sending from:", environment.GMAIL_USER);

    await emailTransporter.sendMail({
      from: `"BloomCare" <${environment.GMAIL_USER}>`,
      to: environment.GMAIL_USER,
      subject: "BloomCare SMTP Test",
      text: "Gmail SMTP is working!",
      html: `
        <h2>BloomCare SMTP Test</h2>
        <p>Gmail SMTP is working correctly.</p>
      `,
    });

    console.log("✅ Test email sent successfully");
  } catch (error) {
    console.error("❌ Gmail SMTP test failed:", error);
  }
}

testEmail();