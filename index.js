// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const exphbs = require('express-handlebars');
const app = express();
const path = require('path');
let port = 3001;

//Sets handlebars confirgurations
app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials',
}));

//sets apps to use handlebars engine
app.set('view engine','handlebars');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '/public'))); 


//pages

app.get('/',function(req,res){ //home page
    res.render('home',{layout:'main'})
});

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});