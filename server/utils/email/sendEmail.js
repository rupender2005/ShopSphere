const { transporter } = require("../../config/nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error in server > utils > email > sendEmail", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
