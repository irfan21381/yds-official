import nodemailer from "nodemailer";

/* ======================================================
   SMTP TRANSPORT (ZOHO – PRODUCTION SAFE)
====================================================== */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // smtp.zoho.in
  port: Number(process.env.EMAIL_PORT),  // 587
  secure: false,                         // TLS
  auth: {
    user: process.env.EMAIL_USER,        // info.yds@zohomail.in
    pass: process.env.EMAIL_PASS,        // 🔥 app password
  },
  tls: {
    rejectUnauthorized: false,           // 🔥 important for Zoho
  },
});

/* ======================================================
   VERIFY SMTP ON STARTUP
====================================================== */
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email SMTP connection failed:", err);
  } else {
    console.log("✅ Email SMTP connected successfully");
  }
});

/* ======================================================
   GENERIC MAIL SENDER
====================================================== */
export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await transporter.sendMail({
      from: `"Yasin Digital Solutions" <${process.env.EMAIL_USER}>`,
      to, // 🔥 ANY USER EMAIL
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err;
  }
};
