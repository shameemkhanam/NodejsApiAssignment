const nodemailer = require('nodemailer');

const sendEmail = async(option) => {
    //CREATE A TRANSPORTER : responsible for sending email
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    //DEFINE EMAIL OPTIONS
    const emailOptions = {
        from: 'e-comm support<support@test.com>',
        to: option.email,
        subject: option.subject,
        text : option.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;