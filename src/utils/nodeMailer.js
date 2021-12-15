import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.NODEMAILER_USER, 
      pass: process.env.NODEMAILER_PASSWORD
  }
});

/**
 * 
 * @param {String} receiverEmail the email of the recipient
 * @param {Object} emailDetails The details included in the email, could be attachments, ical, etc.
 * @param {Function} callback 
 */
const sendEmailWithComplexDetails = (receiverEmail, emailDetails, callback) => {
  let mailDetails = {
    from: process.env.NODEMAILER_USER,
    to: receiverEmail,
    ...emailDetails
  }

  transporter.sendMail(mailDetails, (err) => {
    if (err) return callback(err);

    return callback();
  });
}

/**
 * 
 * @param {String} receiverEmail the email of the recipient
 * @param {Number} textContent the generated random number
 * @param {Function} callback 
 */
const sendEmailWithTextContent = (receiverEmail, textContent, callback) => {
  let mailDetails = {
    from: process.env.NODEMAILER_USER,
    to: receiverEmail,
    text: textContent,
  }

  transporter.sendMail(mailDetails, (err) => {
    if (err) return callback(err);

    return callback();
  });
}

export default {
  sendEmailWithComplexDetails: sendEmailWithComplexDetails,
  sendEmailWithTextContent: sendEmailWithTextContent,
}