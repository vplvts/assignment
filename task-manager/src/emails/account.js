const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function sendWelcomeEmail(email, name) {
  sgMail.send({
    from: "vipul.16bcs2014@abes.ac.in",
    to: email,
    subject: "Welcome to Task Manager App",
    text: `Welcome to the app, ${name}. Hope you are enjoying the app :)`
  })
}

function sendGoodByeEmail(email, name) {
  sgMail.send({
    from: "vipul.16bcs2014@abes.ac.in",
    to: email,
    subject: `Good Bye ${name}`,
    text: `Hi ${name}, Please share your feedback so that we can improve the App.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodByeEmail
}
