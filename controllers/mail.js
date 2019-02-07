var path = require('path');
var async = require("async");
const nodemailer = require('nodemailer');
module.exports = function massMailer() {
    var self = this
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 25,
        secure: false,
        auth: {
            user: 'mc.sagar2@gmail.com',
            pass: '</Hacker>' //use your account
        },
        tls: {
            rejectUnauthorized: false,
            debug: true
        }
    });
    self.invokeOperation();
}



