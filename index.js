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
const addWorkshops = require('./models/addWorkshops');

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
    let{ goal_name, target_amount, start_date, end_date, savings_frequency, calculated_savings,add_picture } = req.body;
    
    Saving.create({
        Saving_goalName: goal_name,
        Saving_amount: target_amount,
        Saving_startDate: start_date,
        Saving_endDate: end_date,
        Saving_frequency: savings_frequency,
        Saving_calculate: calculated_savings,
        Saving_picture: add_picture,     
    })
    .then(agent => {
        res.status(201).send({ message: 'Agent registered successfully!', agent });
      })
    .catch(err => {
    res.status(400).send({ message: 'Error registering agent', error: err });
    });
});

app.get('/workshops', function(req, res) {
    addWorkshops.findAll()
        .then(workshops => {
            res.render('workshops', { 
                layout: 'main',
                workshops: workshops.map(workshop => workshop.get({ plain: true })) // Convert to plain objects 
            });
        })
        .catch(err => {
            console.error('Error fetching workshops:', err);
            if (!res.headersSent) {
                res.status(500).send('Internal Server Error');
            }
        });
});

app.get('/subscription',function(req,res){
    res.render('subscription',{layout:'main'})
});


//admin
app.get('/adminWorkshops', function(req, res){
    res.render('adminWorkshops', {layout:'adminMain'});
});

app.post('/adminWorkshops', function(req,res){
    let{workshopName, workshopStartDate, workshopEndDate,startTime, endTime, workshopAddress, workshopLatitude, workshopLongitude, description, workshopImage } = req.body;
    
    addWorkshops.create({
        Workshop_Name: workshopName,
        Workshop_StartDate: workshopStartDate,
        Workshop_EndDate: workshopEndDate,
        Workshop_StartTime: startTime,
        Workshop_EndTime: endTime,
        Workshop_Address: workshopAddress,
        Workshop_Latitude: workshopLatitude,
        Workshop_Longitude: workshopLongitude,
        Workshop_Description: description,
        Workshop_Image: workshopImage
    }) .then((workshops) =>{
        res.redirect('/workshops');
    })
    .catch(err=> console.log(err))
});



app.get('/userCourse',function(req,res){
    res.render('userCourse2',{layout:'main'})
});

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});