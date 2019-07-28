const express = require('express')
const router = express.Router()
const fs = require('fs')


router.post('/login', function(req,res,next){
    var user= req.body.username
    var password = req.body.pass
    let line
    var flag = false
    fs.readFile('./controllers/accounts.txt',function (err,data){
      if(err){
        throw err
      }
      content = data.toString()
      lines = content.split(/\r?\n/)
      lines.forEach((line) => {
        var auth = line.split(":")
        if(user == auth[0] && password == auth[1]){
          flag = true
        }
      })
      if(flag){
        res.redirect('/upload')
      }
      else{
        res.send("Invalid Credentials, Try again!")
      }
    })
  })
  module.exports = router