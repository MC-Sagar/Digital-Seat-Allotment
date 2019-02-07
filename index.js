var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var uploadfile = require('./controllers/uploadfile')
var fileupload = require('express-fileupload')



app.use(fileupload())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('view engine', 'ejs')

app.use('/assets',express.static('assets'))


app.use('/api', require('./controllers/login'))

uploadfile(app)

/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});*/



//

app.listen(3000, function(){
    console.log('Listening to port 3000....')
});