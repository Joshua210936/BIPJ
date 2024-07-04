// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const app = express();
const exphbs = require('express-handlebars')
const path = require('path');

// Database
const bipjDB = require('./config/DBConnection');
bipjDB.setUpDB(false);
const Saving = require('./models/savings');

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

//guest
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

app.post('/addgoal', function(req,res){
    let{ goal_name, target_amount, start_date, end_date, add_picture } = req.body;
    
    Saving.create({
        Saving_goalName: goal_name,
        Saving_amount: target_amount,
        Saving_startDate: start_date,
        Saving_endDate: end_date,
        Saving_picture: add_picture,     
    })
    .then(agent => {
        res.status(201).send({ message: 'Agent registered successfully!', agent });
      })
    .catch(err => {
    res.status(400).send({ message: 'Error registering agent', error: err });
    });
});

app.get('/workshops',function(req,res){
    res.render('workshops',{layout:'main'})
});


//admin
app.get('/adminWorkshops', function(req, res){
    res.render('adminWorkshops', {layout:'adminMain'});
});



app.get('/userCourse',function(req,res){
    res.render('userCourse2',{layout:'main'})
});

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});