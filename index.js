const express = require('express');

const bodyParser = require("body-parser"); 

const app = express();

const exphbs = require('express-handlebars')

let port = 3001;

//Sets handlebars confirgurations
app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials',
    helpers: handlebarFunctions
}));

//sets apps to use handlebars engine
app.set('view engine','handlebars');

app.set('views', path.join(__dirname, 'views'));

//Imported helpers
const handlebarFunctions = require('./helpers/handlebarFunctions.js');

app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '/public'))); 


app.get('/',function(req,res){ //home page
    res.render('home',{layout:'main'})
});

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});