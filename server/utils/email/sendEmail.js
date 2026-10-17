const { transporter } = require("../../config/nodemailer");

const sendEmail = async (to, subject, html, text) => {
  try {
    const message = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };
    if (text) message.text = text;

    await transporter.sendMail(message);
  } catch (error) {
    console.error("Error in server > utils > email > sendEmail", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
