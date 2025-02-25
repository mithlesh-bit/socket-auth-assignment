const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: "euod qkjn otuh zjeg", 
  },
});

const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  console.log("Attempting to send email...");
  console.log("Mail Options:", mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("SMTP Response:", error.response);
    }
  }
};

module.exports = sendMail;
