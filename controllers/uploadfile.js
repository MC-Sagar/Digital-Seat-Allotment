var csv = require('csvtojson')
var fs = require('fs')
var connection = require('./connection.js')
var async = require("async");
const nodemailer = require('nodemailer');


module.exports = function (app) {

    app.get('/', function(req, res){
        res.render('login.ejs')
    })
    

    app.get('/upload', function (req, res) {
        res.render('index')
    })


    app.post('/upload', function (req, res) {
        if (req.files) {
            //console.log(req.files)
            var file = req.files.filename
            var filename = file.name
            file.mv("./" + filename, function (err) {
                if (err) {
                    console.log(err)
                    res.send("error occured")
                }
                else {
                    var csvFilePath = filename
                    csv().fromFile(csvFilePath).then((jsonObj) => {
                        //console.log(jsonObj)
                        var values = []
                        var val = []
                        jsonObj.forEach(function(item){
                            val = [item.usn,item.course_id,item.block_id,item.room,item.seat,'0']
                            values.push(val)
                        })
                        console.log(values)
                        fs.unlink(filename,function(error){if (error) throw error})
                        
                        var query = 'Insert into exam values ?'
                        connection.query(query, [values], function (error, result, rows, fields) { if (error) throw err; 
                            res.redirect('/mail')
                            })
                    })
                }
            })
        }
        
    })


    app.get('/mail',function(req,res){
        var query = 'select s.usn, s.name, s.email, c.course_name, b.block_name, e.room_name, e.seat from exam e, student s, block b, course c where e.usn = s.usn and e.block_id = b.block_id and e.course_id = c.course_id'
                        connection.query(query, function (err, result, field) {
                            if (err) throw err
                            //console.log(result)   
                            res.render('students', { data: result })
                        })
    })

    app.post('/mail',function(req,res){

        var listOfEmails = [], success_email = [], failure_email = [];
        var a=0, b=0, c=0, d=0, e=0, f=0
        var query = 'select e.usn, s.name, s.email, c.course_name, b.block_name, e.room_name, e.seat from exam e, student s, block b, course c where s.usn = e.usn and e.block_id = b.block_id and e.course_id = c.course_id'
        connection.query(query, function (err, result, field) {
            if (err) throw err
            var transporter
            result.forEach(function(item){
                listOfEmails.push(item.email)
            })
            function massMailer() {
                var self = this
                 transporter = nodemailer.createTransport({
                    service: 'gmail',
                    port: 25,
                    secure: false,
                    auth: {
                        user: 'mc.sagar2@gmail.com',
                        pass: '' //use your account
                    },
                    tls: {
                        rejectUnauthorized: false,
                        debug: true
                    }
                });
                self.invokeOperation();
            }
            massMailer.prototype.invokeOperation = function() {
                var self = this;
                async.each(listOfEmails,self.SendEmail,function(){
                    console.log(success_email)
                    console.log(failure_email)
                    res.redirect('/delete')
                })
            }
            massMailer.prototype.SendEmail = function(Email,callback) {
                console.log("Sending email to " + Email)
                var self = this
                self.status = false
                async.waterfall([
                    function(callback) {                
                        let mailOptions = {
                            from: '"MC-Sagar" <mc.sagar2@gmail.com>', // sender address
                            to: Email, // list of receivers
                            subject: 'Hello!', // Subject line
                            text: 'Hello '+result[a++].name+'! Your assigned block for todays examination is '+result[b++].block_name+', room name is '+result[c++].room_name+', and your seat number is '+result[d++].seat+', all the best for your '+result[e++].course_name+' exam!' // plain text body
                            //html: '<b>Hello world?</b>' // html body    
                        };
                        transporter.sendMail(mailOptions, function(error, info) {               
                            if(error) {
                                console.log(error)
                                failure_email.push(Email);
                            } else {
                                self.status = true;
                                success_email.push(Email);
                            }
                            callback(null,self.status,Email);
                        });
                    },
                    function(statusCode,Email,callback) {
                            console.log("Will update DB for " + Email + " With " + statusCode);
                            if(statusCode){
                                var  update = 'UPDATE exam set sent=1 where usn=?'
                                connection.query(update, [result[f++].usn], function (error, result, rows, fields) { if (error) throw err; 
                                    var  del = 'CALL `deletee`()'
                                    connection.query(del, function (error, result, rows, fields) { if (error) throw err;})
                                })
                            }
                            
                            callback();
                    }
                    ],function(){
                        //When everything is done return back to caller.
                        callback();
                });
            }
            new massMailer();
        })
    res.send('done!');
    })
}