// Required libraries
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const exphbs = require('express-handlebars')
const path = require('path');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');

// Database
const bipjDB = require('./config/DBConnection');
bipjDB.setUpDB(false);
const Saving = require('./models/savings');
const addWorkshops = require('./models/addWorkshops');
const { Test, Question } = require('./models/test');
const Customer = require('./models/custUser');
const SavingsEntry = require('./models/SavingsEntry');
const SubscriptionPlans = require('./models/subscription')
const register = require('./models/workshopRegister')

let port = 3001;

//Sets handlebars confirgurations
app.engine('handlebars', exphbs.engine({ //part of handlebars setup
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}));

//JSON for handlebars (idk i need it for my modal)
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});
Handlebars.registerHelper('parseJson', function (context) {
    return JSON.parse(context);
});

// For comparison in handlebars [Quiz Module]
Handlebars.registerHelper('eq', function(a, b) {
    return a == b;
});

Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});

//sets apps to use handlebars engine
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(methodOverride('_method'));

//guest
app.get('/', function (req, res) { //home page
    res.render('home', { layout: 'main' })
});
app.get('/register', function (req, res) { //home page
    res.render('register', { layout: 'main' })
});

app.post('/register', function (req, res) {
    let { fName, lName, email, phone, password, cPassword } = req.body;

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

app.get('/savingplanner', function (req, res) {
    res.render('savingplanner', { layout: 'main' })
});


app.get('/goalsPage', function (req, res) {
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

app.get('/addgoal', function (req, res) {
    res.render('addgoal', { layout: 'main' })
});

app.post('/addgoal', function (req, res) {
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




app.post('/goalsPage', async function (req, res) {
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




app.post('/editGoal', function (req, res) {
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


app.post('/goalsPage/delete', async function (req, res) {
    const savingId = req.body.saving_id;

    try {
       
        await SavingsEntry.destroy({
            where: {
                Saving_id: savingId
            }
        });

       
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
});


app.get('/workshops', function (req, res) {
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

app.post('/workshops', function (req, res) {
    let {registerName, registerEmail, registerDate} = req.body;

    register.create({
        Register_Name: registerName,
        Register_Email: registerEmail,
        Register_Date: registerDate
    }).then((registers) => {
        res.redirect('/workshops');
    })
        .catch(err => console.log(err))
});

function isValidJSON(str) {
    if (typeof str !== 'string') {
        return false; // Not a string
    }
    try {
        JSON.parse(str);
        return true; // Valid JSON
    } catch (e) {
        return false; // Invalid JSON
    }
}

// Subscriptions //
app.get('/subscription', async (req, res) => {
    try {
        const plans = await SubscriptionPlans.findAll();

        const plansWithParsedDescription = plans.map(plan => {

            const description = JSON.stringify(plan.description).replace(/'/g, '"') || '{}'; // Default to empty JSON if missing
            console.log(plan.description, JSON.stringify(plan.description));

            const parsedDescription = JSON.parse(JSON.stringify(description));
            console.log(`Plan ID ${plan.plan_ID} Description:`, parsedDescription); // Print the parsed description
            return {
                ...plan.toJSON(),
                description: parsedDescription,
            };

        });


        res.render('subscription', { layout: 'main', plans: plansWithParsedDescription });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).send('Server error');
    }
});




app.get('/adminSubscription', function (req, res) {
    res.render('adminSubscription', { layout: 'adminMain' })
});

app.get('/aboutUs', function (req, res) {
    res.render('aboutUs', { layout: 'main' })
});

//admin
app.get('/adminWorkshops', function (req, res) {
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


//admin workshop delete
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

//admin workshop edit
app.put('/adminWorkshops/edit/:id', async (req, res) => {
    const workshopId = req.params.id;
    const {
      workshopName,
      workshopStartDate,
      workshopEndDate,
      startTime,
      endTime,
      workshopAddress,
      workshopLatitude,
      workshopLongitude,
      description,
      workshopImage
    } = req.body;
  
    try {
      // Find the workshop by ID
      const workshop = await addWorkshops.findByPk(workshopId);
  
      if (!workshop) {
        return res.status(404).json({ error: 'Workshop not found' });
      }
  
      // Update the workshop
      await workshop.update({
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
      });
  
      res.status(200).json({ message: 'Workshop updated successfully' });
    } catch (error) {
      console.error('Error updating workshop:', error);
    }
  });

app.post('/adminWorkshops', function (req, res) {
    let { workshopName, workshopStartDate, workshopEndDate, startTime, endTime, workshopAddress, workshopLatitude, workshopLongitude, description, workshopImage } = req.body;

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
    }).then((workshops) => {
        res.redirect('/workshops');
    })
        .catch(err => console.log(err))
});



app.get('/userCourse', function (req, res) {
    res.render('userCourse2', { layout: 'main' })
});

app.get('/adminQuiz', function (req, res) {
    res.render('adminQuiz', { layout: 'adminMain' })
});

app.post('/adminQuiz', function(req, res) {
    const {
        testID,
        quizModule,
        questions // Assuming the form data has been updated to send questions as an array
    } = req.body;

    try {
        // Create a new test
        Test.create({ testID: testID, module: quizModule })
            .then(newTest => {
                // Iterate over each question and create them along with their options
                const questionPromises = questions.map(question => {
                    const { questionText, points, option1, option2, option3, option4, correctOption } = question;

                    // Create the question
                    return Question.create({
                        questionText,
                        points,
                        testID: newTest.testID,
                        option1,
                        option2,
                        option3,
                        option4,
                        correctOption
                    });
                });

                // Wait for all question creation promises to resolve
                return Promise.all(questionPromises);
            })
            .then(() => {
                redirect('/adminViewQuiz');
                res.status(201).send({ message: 'Quiz created successfully!' });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({ message: 'Error creating quiz', error });
            });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating quiz', error });
    }
});

app.get('/adminViewQuiz', function (req, res) {
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


// Copilot suggestion
// app.get('/adminEditQuiz/:testID', async (req, res) => {
//     const testID = req.params.testID;

//     try {
//         const test = await Test.findByPk(testID, {
//             include: Question
//         });

//         if (!test) {
//             return res.status(404).send({ message: 'Test not found' });
//         }

//         res.render('adminEditQuiz', {
//             layout: 'adminMain',
//             test: test.get({ plain: true })
//         });
//     } catch (error) {
//         console.error('Error fetching test:', error);
//         res.status(500).send({ message: 'Internal Server Error' });
//     }
// });

// GPT suggestion
// app.get('/adminEditQuiz/:testID', async (req, res) => {
//     const { testID } = req.params;

//     try {
//         const quiz = await Test.findOne({ where: { testID: testID } });
//         const questions = await Question.findAll({ where: { testID: testID } });

//         res.render('adminEditQuiz', { layout: 'adminMain', quiz, questions });
//     } catch (err) {
//         console.error('Error fetching quiz:', err);
//         res.status(500).send({ message: 'Error fetching quiz', error: err });
//     }
// });

app.get('/adminEditQuiz/:testID', async (req, res) => {
    const { testID } = req.params;

    try {
        const quiz = await Test.findOne({ where: { testID: testID } });
        const questions = await Question.findAll({ where: { testID: testID } });

        res.render('adminEditQuiz', { layout: 'adminMain', quiz, questions });
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).send({ message: 'Error fetching quiz', error: err });
    }
});

app.put('/adminEditQuiz/:testID', async (req, res) => {
    const { testID } = req.params;
    const { quizModule, questions } = req.body;

    try {
        // Update the quiz details
        await Test.update({ module: quizModule }, { where: { testID: testID } });

        // Update existing questions and add new ones if necessary
        for (const question of questions) {
            if (question.id) {
                // Update existing question
                await Question.update({
                    questionText: question.questionText,
                    points: question.points,
                    option1: question.option1,
                    option2: question.option2,
                    option3: question.option3,
                    option4: question.option4,
                    correctOption: question.correctOption
                }, {
                    where: { id: question.id }
                });
            } else {
                // Add new question
                await Question.create({
                    testID: testID,
                    questionText: question.questionText,
                    points: question.points,
                    option1: question.option1,
                    option2: question.option2,
                    option3: question.option3,
                    option4: question.option4,
                    correctOption: question.correctOption
                });
            }
        }

        res.status(200).send({ message: 'Quiz updated successfully' });
        console.log('Quiz updated successfully');
    } catch (err) {
        console.error('Error updating quiz:', err);
        res.status(500).send({ message: 'Error updating quiz', error: err });
    }
});



// GPT suggestion for delete quiz
app.post('/adminViewQuiz/delete/:testID', async function (req, res) {
    const testID = req.params.testID;

    try {
        // Delete all questions associated with the test
        await Question.destroy({
            where: {
                testID: testID
            }
        });

        // Delete the test itself
        await Test.destroy({
            where: {
                testID: testID
            }
        });

        res.status(200).json({ success: true, message: 'Test deleted successfully' });
        console.log('Test deleted successfully');
        res.redirect('/adminViewQuiz');
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ success: false, message: 'Error deleting test', error: error });
    }
});

const adminRoute = require('./routes/admin_routes');
app.use(adminRoute);

app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}`)
});