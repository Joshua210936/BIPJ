// Required libraries
const express = require('express');
const bodyParser = require("body-parser"); 
const app = express();
const exphbs = require('express-handlebars')
const path = require('path');
const Handlebars = require('handlebars');

// Database
const bipjDB = require('./config/DBConnection');
bipjDB.setUpDB(false);
const Saving = require('./models/savings');
const addWorkshops = require('./models/addWorkshops');
const { Test, Question } = require('./models/test');
const Customer = require('./models/custUser');
const SavingsEntry = require('./models/SavingsEntry');


let port = 3001;

//Sets handlebars confirgurations
app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir:__dirname+'/views/layouts',
    partialsDir:__dirname+'/views/partials'
}));

//JSON for handlebars (idk i need it for my modal)
Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});


//sets apps to use handlebars engine
app.set('view engine','handlebars');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended:true})); 
app.use(express.static(path.join(__dirname, '/public'))); 

//guest
app.get('/',function(req,res){ //home page
    res.render('home',{layout:'main'})
});
app.get('/register',function(req,res){ //home page
    res.render('register',{layout:'main'})
});

app.post('/register',function(req,res){
    let {fName, lName, email, phone,password, cPassword} = req.body;

    Customer.create({
        Customer_fName: fName,
        Customer_lName: lName,
        Customer_Email: email,
        Customer_Phone: phone,
        Customer_Password: password,
        Customer_cPassword: cPassword
    })
    .then(() => {
        res.redirect('/'); 
    })
    .catch(err => {
        console.error('Error creating account:', err);
        res.status(400).send({ message: 'Error registering account', error: err });
    });
});

app.get('/savingplanner',function(req,res){
    res.render('savingplanner',{layout:'main'})
});


app.get('/goalsPage', function(req, res) {
    Saving.findAll()
        .then(savings => {
            res.render('goalsPage', { 
                layout: 'main',
                savings: savings.map(saving => {
                    saving = saving.get({ plain: true });
                    
                    return saving;
                })
            });
        })
        .catch(err => {
            console.error('Error fetching savings:', err);
            res.status(500).send('Internal Server Error');
        });
});

app.get('/addgoal',function(req,res){
    res.render('addgoal',{layout:'main'})
});

app.post('/addgoal', function(req, res){
    let { goal_name, target_amount, start_date, end_date, savings_frequency, calculated_savings, add_picture } = req.body;
    
    Saving.create({
        Saving_goalName: goal_name,
        Saving_amount: target_amount,
        Saving_startDate: start_date,
        Saving_endDate: end_date,
        Saving_frequency: savings_frequency,
        Saving_calculate: calculated_savings,
        Saving_picture: add_picture,     
    })
    .then(() => {
        res.redirect('/goalsPage'); 
    })
    .catch(err => {
        console.error('Error creating saving:', err);
        res.status(400).send({ message: 'Error registering saving', error: err });
    });
});

// In your Express route handler
app.get('/goalsPage/data', async (req, res) => {
    try {
        const savings = await Saving.findAll({
            include: {
                model: SavingsEntry,
                attributes: ['Amount_saved', 'Amount_left', 'Entry_date'],
                order: [['Entry_date', 'ASC']]
            }
        });

        res.json(savings);
    } catch (err) {
        console.error('Error fetching savings data:', err);
        res.status(400).send('Internal Server Error');
    }
});




app.post('/goalsPage', async function(req, res) {
    let { saving_id, saving_date, saving_amount } = req.body;

    try {
        // Fetch the total Saving_amount from the savings table
        const savingsRecord = await Saving.findByPk(saving_id);
        if (!savingsRecord) {
            throw new Error('Savings record not found');
        }

        const Saving_amount = savingsRecord.Saving_amount;

        // Calculate the sum of Amount_saved in saving_entries for the given saving_id
        const entries = await SavingsEntry.findAll({
            where: { Saving_id: saving_id }
        });

        let sumAmountSaved = 0;
        entries.forEach(entry => {
            sumAmountSaved += entry.Amount_saved;
        });

        // Calculate Amount_left including the new entry
        const Amount_left = Saving_amount - (sumAmountSaved + parseInt(saving_amount));

        // Create new entry in saving_entries
        await SavingsEntry.create({
            Saving_id: saving_id,
            Entry_date: saving_date,
            Amount_saved: saving_amount,
            Amount_left: Amount_left
        });

        res.redirect('/goalsPage');
    } catch (err) {
        console.error('Error adding saving entry:', err);
        res.status(400).send({ message: 'Error adding saving entry', error: err });
    }
});




app.post('/editGoal', function(req, res) {
    let { saving_id, goal_name, target_amount, start_date, end_date, savings_frequency, calculated_savings, add_picture } = req.body;

    Saving.update(
        {
            Saving_goalName: goal_name,
            Saving_amount: target_amount,
            Saving_startDate: start_date,
            Saving_endDate: end_date,
            Saving_frequency: savings_frequency,
            Saving_calculate: calculated_savings,
            Saving_picture: add_picture
        },
        {
            where: { Saving_id: saving_id }
        }
    )
    .then(() => {
        res.redirect('/goalsPage');
    })
    .catch(err => {
        console.error('Error updating saving goal:', err);
        res.status(400).send({ message: 'Error updating saving goal', error: err });
    });
});


app.post('/goalsPage/delete', async function(req, res) {
    const savingId = req.body.saving_id;

    try {
        // Delete from SavingsEntry first
        await SavingsEntry.destroy({
            where: {
                Saving_id: savingId
            }
        });

        // Then delete from Saving
        await Saving.destroy({
            where: {
                Saving_id: savingId
            }
        });

        res.status(200).send({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).send({ message: 'Error deleting goal', error });
    }
});;





app.get('/workshops', function(req, res) {
    addWorkshops.findAll()
        .then(workshops => {
            res.render('workshops', { 
                layout: 'main',
                workshops: workshops.map(workshop => workshop.get({ plain: true })), // Convert to plain objects 
                json: JSON.stringify // Pass JSON.stringify to the template
            });
        })
        .catch(err => {
            console.error('Error fetching workshops:', err);
            if (!res.headersSent) {
                res.status(500).send('Internal Server Error');
            }
        });
});
// Subscriptions //
app.get('/subscription',function(req,res){
    res.render('subscription',{layout:'main'})
});

app.get('/adminSubscription',function(req,res){
    res.render('adminSubscription',{layout:'adminMain'})
});

app.get('/aboutUs',function(req,res){
    res.render('aboutUs',{layout:'main'})
});

//admin
app.get('/adminWorkshops', function(req, res){
    addWorkshops.findAll()
        .then(workshops => {
            res.render('adminWorkshops', { 
                layout: 'adminMain',
                workshops: workshops.map(workshop => workshop.get({ plain: true })), // Convert to plain objects 
                json: JSON.stringify // Pass JSON.stringify to the template
            });
        })
        .catch(err => {
            console.error('Error fetching workshops:', err);
            if (!res.headersSent) {
                res.status(500).send('Internal Server Error');
            }
        });
});

app.get('/adminWorkshops/delete/:id', (req,res) => {
    const workshopId = req.params.id;

    addWorkshops.findOne({
        where: {
            Workshop_ID: workshopId
        }
    }).then(workshop => {
        if (workshop) {
            return addWorkshops.destroy({
                where: {
                    Workshop_ID: workshopId
                }
            });
        } else {
            res.status(404).send('Workshop not found');
        }
    }).then(() => {
        console.log("Workshop Deleted!");
        res.redirect("/adminWorkshops");
    }).catch(err => {
        console.error("Error deleting workshop:", err);
        res.status(500).send("Internal Server Error");
    });
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

app.get('/adminQuiz',function(req,res){
    res.render('adminQuiz',{layout:'adminMain'})
});

app.post('/adminQuiz', async (req, res) => {
    const {
        testID,
        quizModule,
        questions // Assuming the form data has been updated to send questions as an array
    } = req.body;

    try {
        // Create a new test
        const newTest = await Test.create({ testID: testID, module: quizModule });

        // Iterate over each question and create them along with their options
        for (let i = 0; i < questions.length; i++) {
            const { questionText, points, option1, option2, option3, option4, correctOption } = questions[i];

            // Create the question
            const newQuestion = await Question.create({
                questionText,
                points,
                testID: newTest.testID,
                option1,
                option2,
                option3,
                option4,
                correctOption
            });
        }

        res.status(201).send({ message: 'Quiz created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating quiz', error });
    }
});

app.get('/adminViewQuiz', function(req, res) {
    Test.findAll()
        .then(tests => {
            res.render('adminViewQuiz', {
                layout: 'adminMain',
                tests: tests.map(test => {
                    test = test.get({ plain: true });
                    return test;
                })
            });
        })
        .catch(err => {
            console.error('Error fetching tests:', err);
            res.status(500).send('Internal Server Error');
        });
});



// app.get('/adminQuiz2',function(req,res){
//     const context = {
//         question: Array(5).fill({})
//     };
//     res.render('adminQuiz2',{layout:'adminMain'})
// });

// app.post('/adminQuiz2', async function(req, res){
//     let { testID, quizModule, quizName1, quizPoints1, quizOption1, quizOption2, quizOption3, quizOption4, quizCorrectOption1,
//         quizName2, quizPoints2, quizOption2_1, quizOption2_2, quizOption2_3, quizOption2_4, quizCorrectOption2,
//         quizName3, quizPoints3, quizOption3_1, quizOption3_2, quizOption3_3, quizOption3_4, quizCorrectOption3,
//         quizName4, quizPoints4, quizOption4_1, quizOption4_2, quizOption4_3, quizOption4_4, quizCorrectOption4,
//         quizName5, quizPoints5, quizOption5_1, quizOption5_2, quizOption5_3, quizOption5_4, quizCorrectOption5 } = req.body;

//     try {
//         // Create a new test
//         const newTest = await Test.create({ testName: testID, module: quizModule });

//         // Array to store question data
//         const questions = [
//             { quizName: quizName1, quizPoints: quizPoints1, options: [quizOption1, quizOption2, quizOption3, quizOption4], correctOption: quizCorrectOption1 },
//             { quizName: quizName2, quizPoints: quizPoints2, options: [quizOption2_1, quizOption2_2, quizOption2_3, quizOption2_4], correctOption: quizCorrectOption2 },
//             { quizName: quizName3, quizPoints: quizPoints3, options: [quizOption3_1, quizOption3_2, quizOption3_3, quizOption3_4], correctOption: quizCorrectOption3 },
//             { quizName: quizName4, quizPoints: quizPoints4, options: [quizOption4_1, quizOption4_2, quizOption4_3, quizOption4_4], correctOption: quizCorrectOption4 },
//             { quizName: quizName5, quizPoints: quizPoints5, options: [quizOption5_1, quizOption5_2, quizOption5_3, quizOption5_4], correctOption: quizCorrectOption5 }
//         ];

//         // Iterate over each question and create them along with their options

//         for (const questionData of questions) {
//             const { quizName, quizPoints, options, correctOption } = questionData;

//             // Create the question
//             const newQuestion = await Question.create({
//                 questionText: quizName,
//                 points: quizPoints,
//                 testId: newTest.id
//             });

//             // Create the options for the question
//             for (let i = 0; i < options.length; i++) {
//                 const optionText = options[i];
//                 const isCorrect = correctOption == i + 1;

//                 await Option.create({
//                     optionText,
//                     isCorrect,
//                     questionId: newQuestion.id
//                 });
//             }
//         }

//         res.status(201).send({ message: 'Quiz created successfully!' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: 'Error creating quiz', error });
//     }
// });


const adminRoute = require('./routes/admin_routes');
app.use(adminRoute);

app.listen(port, ()=>{
    console.log(`Server running on  http://localhost:${port}`)
});