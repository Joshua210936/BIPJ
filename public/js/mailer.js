const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'financial0flare@gmail.com',
        pass: 'qkgi didt tzll bdub'
    }
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'financial0flare@gmail.com',
        to, // `to` can be a comma-separated string or an array
        subject,
        text
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };