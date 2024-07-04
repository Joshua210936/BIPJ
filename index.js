const express = require('express');

const bodyParser = require("body-parser"); 

const app = express();
const exphbs = require('express-handlebars')
const path = require('path');

let port = 3001;

//Sets handlebars confirgurations
app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials'
}));

//sets apps to use handlebars engine
app.set('view engine','handlebars');

app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '/public'))); 


app.get('/',function(req,res){ //home page
    res.render('home',{layout:'main'})
});
app.get('/login',function(req,res){ //home page
    res.render('login',{layout:'main'})
});
app.get('/savingplanner',function(req,res){
    res.render('savingplanner',{layout:'main'})
});
app.get('/addgoal',function(req,res){
    res.render('addgoal',{layout:'main'})
});
app.get('/workshops',function(req,res){
    res.render('workshops',{layout:'main'})
});
app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});