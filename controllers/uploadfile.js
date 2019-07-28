var csv = require('csvtojson')
var fs = require('fs')
var async = require("async");
const nodemailer = require('nodemailer');
var json = null

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
                        // console.log(jsonObj)
                        json = jsonObj
                        // var values = []
                        // var val = []
                        // jsonObj.forEach(function(item){
                        //     val = [item.usn,item.course,item.block,item.room,item.seat]
                        //     values.push(val)
                        // })
                        // console.log(values)
                        fs.unlink(filename,function(error){if (error) throw error})
                        //res.send("Hey")
                        res.redirect('/mail')

                    })
                }
            })
        }
        
    })


    app.get('/mail',function(req,res){
        fs.readFile('./controllers/studentRec.txt',function (err,data){
            if(err){
              throw err
            }
            content = data.toString()
            lines = content.split(/\r?\n/)
            json.forEach((rec) => {
                lines.forEach((line) => {
                    var student = line.split("|")
                    if(rec.usn==student[0]){
                        rec.name = student[1]
                        rec.email = student[2]
                        return 0
                    }
                });
            }); 
            console.log(json)   
        res.render('students', { data: json })
        })
    })

    app.post('/mail',function(req,res){

        var listOfEmails = [], success_email = [], failure_email = [];
        var a=0, b=0, c=0, d=0, e=0, f=0
            var transporter
            json.forEach(function(item){
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
                        pass: '</Hacker>' //use your account
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
                    console.log("List of successful mails : "+success_email)
                    console.log("List of failed mails : "+failure_email)
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
                            text: 'Hello '+json[a++].name+'! Your assigned block for todays examination is '+json[b++].block+', room name is '+json[c++].room+', and your seat number is '+json[d++].seat+', all the best for your '+json[e++].course+' exam!' // plain text body
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
                            console.log("Has successfully sent message for "+Email+" : "+statusCode);
                            callback();
                    }
                    ],function(){
                        //When everything is done return back to caller.
                        callback();
                });
            }
            new massMailer();
        
    res.send('Refer console!');
    })
}