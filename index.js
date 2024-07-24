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
const QuizResult = require('./models/quizResult');
const Customer = require('./models/customer');
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

    addWorkshops.findAll({
        where: { Workshop_Status: true }
    }).then(workshops => {
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
    let {registerName, registerEmail, registerDate, workshopID} = req.body;

    register.create({
        Register_Name: registerName,
        Register_Email: registerEmail,
        Register_Date: registerDate,
        Workshop_ID: workshopID
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
        const plans = await SubscriptionPlans.findAll({
            where: {
                isActive: true // Filter for active plans only
            }
        });

        const plansWithParsedDescription = plans.map(plan => {

            const description = JSON.stringify(plan.description).replace(/'/g, '"') || '{}'; // Default to empty JSON if missing

            const parsedDescription = JSON.parse(JSON.stringify(description));
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




app.get('/adminSubscription', async (req, res) => {
    try {
        const plans = await SubscriptionPlans.findAll();

        const plansWithParsedDescription = plans.map(plan => {
            const description = JSON.stringify(plan.description).replace(/'/g, '"') || '{}'; // Default to empty JSON if missing
            const parsedDescription = JSON.parse(description);
            return {
                ...plan.toJSON(),
                description: parsedDescription,
            };
        });

        const activePlans = plansWithParsedDescription.filter(plan => plan.isActive);
        const inactivePlans = plansWithParsedDescription.filter(plan => !plan.isActive);

        res.render('adminSubscription', { layout: 'adminMain', activePlans, inactivePlans });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).send('Server error');
    }
});



app.get('/adminSubscription/edit/:id', async (req, res) => {
    const planId = req.params.id;
    
    try {
        const plan = await SubscriptionPlans.findByPk(planId);
        
        if (!plan) {
            return res.status(404).send('Subscription plan not found');
        }

        const description = JSON.stringify(plan.description).replace(/'/g, '"') || '{}'; 
        const parsedDescription = JSON.parse(description);

        res.render('editSubscription', { layout: 'adminMain', plan: { ...plan.toJSON(), description: parsedDescription } });
    } catch (error) {
        console.error('Error retrieving subscription plan:', error);
        res.status(500).send('Error retrieving subscription plan');
    }
});

app.post('/adminSubscription/edit/:id', async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await SubscriptionPlans.findByPk(planId);
        if (plan) {
            await plan.update({
                plan_name: req.body.plan_name,
                description: JSON.parse(JSON.stringify(req.body.description).replace(/'/g, '"') || '{}'),
                price: req.body.price,
                duration: req.body.duration,
                duration_unit: req.body.duration_unit
            });
            res.redirect('/adminSubscription');
        } else {
            res.status(404).send('Subscription plan not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating subscription plan');
    }
});

app.post('/adminSubscription/delete/:id', async (req, res) => {
    try {
        const plan = await SubscriptionPlans.findByPk(req.params.id);
        if (plan) {
            await plan.destroy();
            res.redirect('/adminSubscription');
        } else {
            res.status(404).send('Subscription plan not found');
        }
    } catch (error) {
        res.status(500).send('Error deleting subscription plan');
    }
});

app.post('/adminSubscription/toggleActive/:id', async (req, res) => {
    try {
        const planId = req.params.id;
        const plan = await SubscriptionPlans.findByPk(planId);

        if (!plan) {
            return res.status(404).send('Subscription plan not found');
        }


        const previousStatus = plan.isActive;


        plan.isActive = !previousStatus; 
        await plan.save();

 
        const activeTab = previousStatus ? 'active-plans' : 'inactive-plans';

 
        res.redirect(`/adminSubscription?tab=${activeTab}`);
    } catch (error) {
        console.error('Error toggling subscription plan:', error);
        res.status(500).send('Server error');
    }
});
app.get('/addSubscription', async (req, res) => {
    res.render('addSubscription', { layout: 'adminMain'});
});
app.post('/addSubscription', async (req, res) => {
    try {
        const { plan_name, description, price, duration, duration_unit } = req.body;

        const newPlan = await SubscriptionPlans.create({
            plan_name,
            description,
            price,
            duration,
            duration_unit,
            isActive: true
        });


        res.redirect('/adminSubscription');
    } catch (error) {
        console.error('Error adding subscription plan:', error);
        res.status(500).send('Server error');
    }
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
app.get('/adminWorkshops/delete/:id', (req, res) => {
    const workshopId = req.params.id;

    addWorkshops.findOne({
        where: {
            Workshop_ID: workshopId
        }
    }).then(workshop => {
        if (workshop) {
            // delete related rows in workshopRegister
            return register.destroy({
                where: {
                    Workshop_ID: workshopId
                }
            }).then(() => {
                // delete the workshop
                return addWorkshops.destroy({
                    where: {
                        Workshop_ID: workshopId
                    }
                });
            });
        } else {
            res.status(404).send('Workshop not found');
        }
    }).then(() => {
        console.log("Workshop and related registrations deleted!");
        res.redirect("/adminWorkshops");
    }).catch(err => {
        console.error("Error deleting workshop and related registrations:", err);
        res.status(500).send("Internal Server Error");
    });
});

//admin workshop edit
app.post('/adminWorkshops/edit/:id', async (req, res) => {
    const workshopId = req.params.id;
    const {
      workshopName,
      workshopStartDate,
      workshopEndDate,
      startTime,
      endTime,
      workshopAddress,
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
        Workshop_Description: description,
        Workshop_Image: workshopImage
      });
  
      res.redirect('/adminWorkshops')
    } catch (error) {
      console.error('Error updating workshop:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/adminWorkshops', function (req, res) {
    let { workshopName, workshopStartDate, workshopEndDate, startTime, endTime, workshopAddress, description, workshopImage } = req.body;
    
    addWorkshops.create({
        Workshop_Name: workshopName,
        Workshop_StartDate: workshopStartDate,
        Workshop_EndDate: workshopEndDate,
        Workshop_StartTime: startTime,
        Workshop_EndTime: endTime,
        Workshop_Address: workshopAddress,
        Workshop_Description: description,
        Workshop_Image: workshopImage
    }).then((workshops) => {
        res.redirect('/adminWorkshops');
    })
        .catch(err => console.log(err))
});

app.post('/adminWorkshops/toggleStatus/:id', async (req, res) => {
    const workshopId = req.params.id;

    try {
        const workshop = await addWorkshops.findByPk(workshopId);

        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        // Toggle the status
        await workshop.update({
            Workshop_Status: !workshop.Workshop_Status
        });

        res.redirect('/adminWorkshops');
    } catch (error) {
        console.error('Error toggling workshop status:', error);
        res.status(500).send('Internal Server Error');
    }
});

// ---------------------------- Quiz Stuff ---------------------------- //

// Function to fetch tests with number of questions and total points
// Temporary [Original]
// async function fetchTestsAndDetails() {
//     try {
//         const tests = await Test.findAll({
//             include: [{
//                 model: Question,
//                 as: 'questions'
//             }]
//         });

//         // Process each test to calculate number of questions and total points
//         const testsWithDetails = tests.map(test => {
//             const numberOfQuestions = test.questions.length;
//             const totalPoints = test.questions.reduce((acc, question) => acc + question.points, 0);

//             return {
//                 testID: test.testID,
//                 module: test.module,
//                 numberOfQuestions,
//                 totalPoints
//             };
//         });

//         return testsWithDetails;
//     } catch (error) {
//         console.error('Error fetching tests and details:', error);
//         throw error;
//     }
// }

async function fetchTestsAndDetails() {
    try {
        const tests = await Test.findAll({
            include: [{
                model: Question,
                as: 'questions'
            }]
        });

        // Process each test to calculate number of questions and total points
        const testsWithDetails = tests.map(test => {
            const numberOfQuestions = test.questions.length;
            const totalPoints = test.questions.reduce((acc, question) => acc + question.points, 0);

            return {
                testID: test.testID,
                module: test.module,
                numberOfQuestions,
                totalPoints
            };
        });

        return testsWithDetails;
    } catch (error) {
        console.error('Error fetching tests and details:', error);
        throw error;
    }
}

app.get('/userQuiz/:testID', async (req, res) => {
    const { testID } = req.params;

    try {
        const quiz = await Test.findOne({ where: { testID } });

        if (!quiz) {
            return res.status(404).send('Quiz not found');
        }

        const questions = await Question.findAll({ where: { testID } });

        res.render('userQuiz', {
            layout: 'main',
            quiz: quiz.get({ plain: true }),
            questions: questions.map(question => question.get({ plain: true }))
        });
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Handle quiz submission
// IT IS WORKING [DO NOT TOUCH]
// app.post('/userQuiz/:testID', async (req, res) => {
//     try {
//         const testID = req.params.testID;
//         const userAnswers = req.body.questions;

//         let totalScore = 0;

//         // Fetch questions for the test
//         const questions = await Question.findAll({ where: { testID } });

//         // Calculate the score
//         questions.forEach(question => {
//             const userAnswer = userAnswers.find(answer => answer.id == question.id);
//             if (userAnswer && parseInt(userAnswer.correctOption) === question.correctOption) {
//                 totalScore += question.points;
//             }
//         });

//         // Render the result page with the score
//         res.render('quizResult', { totalScore });

//     } catch (error) {
//         console.error('Error processing quiz submission:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.post('/userQuiz/:testID', async (req, res) => {
    try {
        const testID = req.params.testID;
        const customerID = req.body.customerID; // Assuming you pass customer ID from the form
        const userAnswers = req.body.questions;

        let totalScore = 0;

        // Fetch questions for the test
        const questions = await Question.findAll({ where: { testID } });

        // Calculate the score
        questions.forEach(question => {
            const userAnswer = userAnswers.find(answer => answer.id == question.id);
            if (userAnswer && parseInt(userAnswer.correctOption) === question.correctOption) {
                totalScore += question.points;
            }
        });

        // Save the result to the database
        await QuizResult.create({
            testID,
            customerID,
            score: totalScore
        });

        // Render the result page with the score
        res.render('quizResult', { totalScore });

    } catch (error) {
        console.error('Error processing quiz submission:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Original 
// app.get('/userQuizList', function (req, res) {
//     Test.findAll()
//         .then(tests => {
//             res.render('userQuizList', {
//                 layout: 'main',
//                 tests: tests.map(test => {
//                     test = test.get({ plain: true });
//                     return test;
//                 })
//             });
//         })
//         .catch(err => {
//             console.error('Error fetching tests:', err);
//             res.status(500).send('Internal Server Error');
//         });
// });

app.get('/userQuizList', async (req, res) => {
    try {
        // Fetch tests with details
        const testsWithDetails = await fetchTestsAndDetails();

        // Render userQuizList template with tests data
        res.render('userQuizList', {
            layout: 'main',
            tests: testsWithDetails
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Admin Quiz
app.get('/adminQuiz', function (req, res) {
    res.render('adminQuiz', { layout: 'adminMain' })
});

app.post('/adminQuiz', function(req, res) {
    let {
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
                res.redirect('/adminViewQuiz');
           
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

app.get('/adminViewQuiz', async (req, res) => {
    try {
        // Fetch tests with details
        const testsWithDetails = await fetchTestsAndDetails();

        // Render adminViewQuiz template with tests data
        res.render('adminViewQuiz', {
            layout: 'adminMain',
            tests: testsWithDetails
        });
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/adminEditQuiz/:testID', async (req, res) => {
    const { testID } = req.params;

    try {
        const quiz = await Test.findOne({ where: { testID } });

        if (!quiz) {
            return res.status(404).send('Quiz not found');
        }

        const questions = await Question.findAll({ where: { testID } });

        res.render('adminEditQuiz', {
            layout: 'adminMain',
            quiz: quiz.get({ plain: true }),
            questions: questions.map(question => question.get({ plain: true }))
        });
    } catch (err) {
        console.error('Error fetching quiz:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/adminEditQuiz/:testID', async (req, res) => {
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

        res.redirect('/adminViewQuiz');
        console.log('Quiz updated successfully');
    } catch (err) {
        console.error('Error updating quiz:', err);
        res.status(500).send({ message: 'Error updating quiz', error: err });
    }
});

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

        console.log('Quiz deleted successfully');
        res.redirect('/adminViewQuiz');
     
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ success: false, message: 'Error deleting quiz', error: error });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        // Query to join Customer, Test, and QuizResult tables and get the required data
        const leaderboardData = await QuizResult.findAll({
            attributes: ['testID', 'score'],
            include: [
                {
                    model: Customer,
                    as: 'Customer',  // Use the alias defined in the association
                    attributes: ['Customer_fName', 'Customer_lName'],
                },
                {
                    model: Test,
                    as: 'Test',  // Use the alias defined in the association
                    attributes: ['module'],
                }
            ],
            order: [['score', 'DESC']] // Order by score in descending order
        });

        // Format the data for the leaderboard
        const leaderboard = leaderboardData.map(result => ({
            customerName: `${result.Customer.Customer_fName} ${result.Customer.Customer_lName}`,
            testID: result.testID,
            score: result.score,
            module: result.Test.module // Add the test module to the leaderboard data
        }));

        // Render the leaderboard view with top three and other scores
        res.render('leaderboardView', {
            topThree: leaderboard.slice(0, 3), // Top three scores
            otherScores: leaderboard.slice(3)  // Remaining scores
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



const adminRoute = require('./routes/admin_routes');
app.use(adminRoute);

app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}`)
});