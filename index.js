// Required libraries
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const exphbs = require('express-handlebars')
const path = require('path');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const paypal = require('@paypal/checkout-server-sdk');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const mysql = require('mysql');


// Database
const bipjDB = require('./config/DBConnection');
bipjDB.setUpDB(false);
const db = require('./config/db');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const Saving = require('./models/savings');
const addWorkshops = require('./models/addWorkshops');
const { Test, Question } = require('./models/test');
const QuizResult = require('./models/quizResult');
const Customer = require('./models/customer');
const SavingsEntry = require('./models/SavingsEntry');
const SubscriptionPlans = require('./models/subscription')
const register = require('./models/workshopRegister')
const contactUs = require('./models/contactUs')
const association = require('./models/association');

// Imported Helpers
const handlebarFunctions = require('./helpers/handlebarFunctions.js');
const { password } = require('./config/db.js');
const { error, clear } = require('console');
const { layouts } = require('chart.js');
const { Session } = require('inspector');
const { formatDate } = require('./helpers/handlebarFunctions.js');

let port = 3001;

//mailer function
const { sendEmail } = require('./public/js/mailer.js');

// PAYPAL

const clientId = "ATPBOA2kFS1GZCsIIWNDjVr6bsDAz58J3GAbYtNA4mlPHpTtas7aroJcZIgw5YlAtPnZ_Q_N0lW9DuQZ";
const clientSecret = "EGExhKQodcXX9D_mYJlWwfJFTVvM0-v3KAjsWPwlZhHlS0xivjn4LpUR_zyQGzG2UtiUw4PeWyGYLOjc";

// Create environment
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

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

const options = {
    host: db.host,
    port: db.port,
    user: db.username,
    password: db.password,
    database: db.database,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000
}
const sessionStore = new MySQLStore(options);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

// For Navbar
app.use((req, res, next) => {
    res.locals.userType = null;

    if (req.session.customerID) {
        res.locals.userType = 'customer';
    } else if (req.session.agentID) {
        res.locals.userType = 'agent';
    } else if (req.session.adminID) {
        res.locals.userType = 'admin';
    }

    next();
});

// Set up Handlebars with custom helpers
const hbs = exphbs.create({
    helpers: handlebarFunctions,
    defaultLayout: 'main',
    partialsDir: ['views/partials/']
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Sending Email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'financial0flare@gmail.com',
        pass: 'qkgi didt tzll bdub'
    }
});

//guest
app.get('/', function (req, res) { //home page
    res.render('home', { layout: 'main' })
});

// Customer Logged In
app.get('/customerHome', function (req, res) {
    console.log("this is the session id:", req.session.id);
    console.log('Session:' + JSON.stringify(req.session));
    console.log('Session:' + req.session.customerID);
    res.render('home', { layout: 'main' })
});

// Admin Logged In
app.get('/adminHome', function(req, res){
    res.render('adminHome', {layout:'adminMain'});
});

// ---------------------- Customer Account Routes --------------------------
app.get('/register', function (req, res) { //home page
    res.render('Customer/customerRegister', { layout: 'main' })
});

// Customer Register [Updated]
app.post('/register', async function (req, res) {
    let errorsList = [];
    let { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

    // Check for missing email
    if (!email) {
        return res.status(400).send("One or more required payloads were not provided.");
    }

    try {
        const data = await Customer.findAll({
            attributes: ["Customer_Email"]
        });

        console.log('Retrieved customer emails:', data);

        // Check if email already exists
        for (var cust of data) {
            if (cust.toJSON().Customer_Email === email) {
                errorsList.push({ text: 'Email already exists' });
                break;
            }
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            errorsList.push({ text: 'Passwords do not match' });
        }

        // If there are errors, render the registration page with error messages
        if (errorsList.length > 0) {
            let msg_error = "";
            for (let i = 0; i < errorsList.length; i++) {
                console.log('Error:', errorsList[i]);
                msg_error += errorsList[i].text + "\n";
            }
            return res.status(400).send({ message: 'Error registering account', error_msg: msg_error });
        }

        // Create new customer
        const newCustomer = await Customer.create({
            Customer_fName: firstName,
            Customer_lName: lastName,
            Customer_Email: email,
            Customer_Phone: phoneNumber,
            Customer_Password: password,
        });

        // Send account registration success email
        const mailOptions = {
            from: 'financial0flare@gmail.com',
            to: email,
            subject: 'Account Successfully Registered',
            text: 'Your account has been successfully registered.'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending registration email:', error);
                return res.status(500).send({ message: 'Error sending registration email' });
            } else {
                console.log('Registration email sent:', info.response);
            }
        });

        // Redirect to login page upon successful registration
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send({ message: 'Error registering user', error: err });
    }
});

// Customer Login
app.get('/login', function (req, res) {
    res.render('Customer/customerLogin', { layout: 'main' })
});

app.post('/login', async function (req, res) {
    errorList = [];
    let { email, password } = req.body;

    // Admin credentials
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin12345';

    if (email === adminEmail && password === adminPassword) {
        // Admin login
        req.session.isAdmin = true;
        req.session.userID = 'admin'; // You can store any identifier for the admin user
        console.log('Admin logged in');
        return res.redirect('/adminHome'); // Redirect to the admin home page
    } else {
        // Find the customer with the given email
        Customer.findOne({ where: { Customer_Email: email } })
            .then(customer => {
                if (!customer) {
                    errorList.push({ text: 'customer not found' });
                    console.log('customer not found');
                    return res.status(404).send({ message: 'customer not found' });
                }

                // Check if the password is correct
                if (customer.Customer_Password !== password) {
                    errorList.push({ text: 'Incorrect password' });
                    return res.status(401).send({ message: 'Incorrect password' });
                }

                // Successful customer login
                req.session.isAdmin = false;
                req.session.customerID = customer.Customer_id; // Store customer information in session
                const customer_id = customer.Customer_id;
                console.log(req.session.customerID);
                console.log('Session Test' + JSON.stringify(req.session));
                console.log("session id in login:", req.session.id);
                req.session.save();
                res.redirect('/customerHome');
            })
            .catch(err => {
                console.log('Error during login: ', err);
                return res.status(500).send({ message: 'Error occurred', error: err });
            });
    }
});

app.get('/userSetProfile', async (req, res) => {
    const customer_id = req.session.customerID; // IMPORTANT
    console.log('Customer ID:' + customer_id);

    try {
        const customer = await Customer.findByPk(customer_id); // IMPORTANT
        console.log(customer);

        if (customer) {
            res.render('Customer/userSetProfile', {
                layout: 'main',
                customer_id: customer_id,
                customer: customer.get({ plain: true })
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer details', error });
    }
});

app.post('/userSetProfile', async (req, res) => {
    console.log("this is the request body:",req.body);
    const { firstName, lastName, phoneNumber, birthday } = req.body;

    const customer_id = req.session.customerID;
    console.log('Session Test' + JSON.stringify(req.session));
    console.log("session id in set profile:", req.session.customerID);
    
    console.log('Received customer ID:', customer_id); // Log customer ID
    console.log('Received update data:', { firstName, lastName, phoneNumber, birthday }); // Log update data
    
    try {
        const customer = await Customer.findByPk(customer_id);
        if (customer) {
            await Customer.update(
                {
                    Customer_fName: firstName,
                    Customer_lName: lastName,
                    Customer_Phone: phoneNumber,
                    Customer_Birthday: birthday,
                },
                {
                    where: {
                        Customer_id: customer_id
                    }
                }
            );
            res.redirect(`/userSetProfile`);
        } else {
            res.status(404).send("Customer not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating customer profile");
    }
});

// ---------------------- Reset Password --------------------------
// Route to render forget password page
app.get('/forgetpassword', (req, res) => {
    res.render('Customer/forgetPassword', { layout: 'main' });
});

// Route to handle OTP request
app.post('/requestOTP', async (req, res) => {
    const { email } = req.body;
    const customer = await Customer.findOne({ where: { Customer_Email: email } });

    if (!customer) {
        return res.status(404).send({ message: 'Customer not found' });
    }

    // Generate OTP and expiration time
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const otpExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await customer.update({
        Customer_OTP: otp,
        OTP_Expiration: otpExpiration
    });

    // Send OTP email
    const mailOptions = {
        from: 'financial0flare@gmail.com',
        to: email,
        subject: 'Your OTP for password reset',
        text: `Your OTP for password reset is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending OTP email:', error);
            return res.status(500).send({ message: 'Error sending OTP email' });
        } else {
            console.log('OTP email sent:', info.response);
            res.redirect('/verifyOTP');
        }
    });
});

// Route to render verify OTP page
app.get('/verifyOTP', (req, res) => {
    res.render('Customer/verifyOTP', { layout: 'main' });
});

// Route to handle OTP verification and password reset
app.post('/verifyOTP', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const customer = await Customer.findOne({ where: { Customer_Email: email } });

    if (!customer) {
        return res.status(404).send({ message: 'Customer not found' });
    }

    if (customer.Customer_OTP !== otp || new Date() > customer.OTP_Expiration) {
        return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    // Update password and clear OTP fields
    await customer.update({
        Customer_Password: newPassword,
        Customer_OTP: null,
        OTP_Expiration: null
    });

    res.redirect('/login');
});
// ---------------------- Reset Password --------------------------

// Customer Logout
app.get('/logout', function (req, res) {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ message: 'Error logging out', error: err });
        }
        res.redirect('/login');
    });
});

// ---------------------- End of Customer Account Routes --------------------------

app.get('/savingplanner', function (req, res) {
    res.render('savingplanner', { layout: 'main' })
});


app.get('/goalsPage', function (req, res) {
    const filter = req.query.filter || 'all';

    // Check if the user is logged in
    if (!req.session.customerID) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const customerID = req.session.customerID;

    // Define the filter conditions
    let filterCondition = { Customer_id: customerID };
    if (filter === 'ongoing') {
        filterCondition.isCompleted = false;
    } else if (filter === 'completed') {
        filterCondition.isCompleted = true;
    }

    Saving.findAll({
        where: filterCondition
    })
        .then(savings => {
            res.render('goalsPage', {
                layout: 'main',
                savings: savings.map(saving => saving.get({ plain: true }))
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
    if (!req.session.customerID) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const customerID = req.session.customerID;
    let { goal_name, target_amount, start_date, end_date, savings_frequency, calculated_savings, add_picture } = req.body;

    Saving.create({
        Saving_goalName: goal_name,
        Saving_amount: target_amount,
        Saving_startDate: start_date,
        Saving_endDate: end_date,
        Saving_frequency: savings_frequency,
        Saving_calculate: calculated_savings,
        Saving_picture: add_picture,
        Customer_id: customerID // Associate with the logged-in customer
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
    if (!req.session.customerID) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const customerID = req.session.customerID;
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
            where: { Saving_id: saving_id, Customer_id: customerID } // Ensure only the customer can edit their own goals
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
    if (!req.session.customerID) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const customerID = req.session.customerID;
    const savingId = req.body.saving_id;

    try {
        // Ensure only the customer's entries are deleted
        await SavingsEntry.destroy({
            where: {
                Saving_id: savingId,
                '$Saving.Customer_id$': customerID
            },
            include: [{
                model: Saving,
                required: true
            }]
        });

        // Ensure only the customer's goal is deleted
        await Saving.destroy({
            where: {
                Saving_id: savingId,
                Customer_id: customerID
            }
        });

        res.status(200).send({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).send({ message: 'Error deleting goal', error });
    }
});


app.post('/completeGoal', async function (req, res) {
    if (!req.session.customerID) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }

    const customerID = req.session.customerID;
    const { saving_id } = req.body;

    try {
        await Saving.update(
            { isCompleted: true },
            { where: { Saving_id: saving_id, Customer_id: customerID } } // Ensure only the customer can complete their own goals
        );
        res.redirect('/goalsPage');
    } catch (err) {
        console.error('Error marking goal as completed:', err);
        res.status(500).send('Internal Server Error');
    }
});




app.get('/contactUs', function (req, res) {
    const customerID = req.session.customerID;

    // Fetch customer details if customerID exists
    if (customerID) {
        Customer.findOne({
            where: { Customer_ID: customerID }
        }).then(customer => {
            res.render('contactUs', {
                layout: 'main',
                customer: customer ? customer.get({ plain: true }) : null, // Convert to plain object
                json: JSON.stringify // Pass JSON.stringify to the template
            });
        }).catch(err => {
            console.error('Error fetching customer data:', err);
            res.status(500).send('Internal Server Error');
        });
    } else {
        // Render without customer details if no customerID
        res.render('contactUs', {
            layout: 'main',
            customer: null,
            json: JSON.stringify // Pass JSON.stringify to the template
        });
    }
});

app.post('/contactUs', function(req, res){
    try {
        let { contactName, contactEmail, messageType, message } = req.body;

        contactUs.create({
            Contact_Name: contactName,
            Contact_Email: contactEmail,
            Contact_Type: messageType,
            Contact_Message: message
        }).then((contactUs) => {
            res.redirect('/contactUs');
        })
    } catch (error) {
        console.error('Error saving contact form data:', error);
        // Handle the error appropriately, such as rendering an error page or showing a message
        res.status(500).send('Internal Server Error');
    }
});

app.get('/workshops', function (req, res) {
    const customerID = req.session.customerID; 

    let customerData = null; // Default to null if no customer data is found

    // Fetch customer details if customerID exists
    const customerPromise = customerID 
        ? Customer.findOne({ where: { Customer_ID: customerID } })
        : Promise.resolve(null);

    customerPromise.then(customer => {
        if (customer) {
            customerData = customer.get({ plain: true }); // Store customer data if found
        }

        return addWorkshops.findAll({
            where: { Workshop_Status: true }
        }).then(workshops => {
            res.render('workshops', {
                layout: 'main',
                customer: customerData, // Pass customer data or null
                workshops: workshops.map(workshop => workshop.get({ plain: true })), // Convert to plain objects 
                json: JSON.stringify // Pass JSON.stringify to the template
            });
        });
    }).catch(err => {
        console.error('Error fetching data:', err);
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
                isActive: true
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

app.post('/subscriptions/select/:plan_ID', async (req, res) => {
    const planID = req.params.plan_ID;

    try {
        const plan = await SubscriptionPlans.findOne({
            where: {
                plan_ID: planID,
                isActive: true
            }
        });

        if (!plan) {
            return res.status(404).send("Plan not found");
        }

        let request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: plan.price.toFixed(2) 
                }
            }],
            application_context: {
                return_url: `http://localhost:3001/payment/success?plan_ID=${planID}`,
                cancel_url: 'http://localhost:3001/payment/cancel'
            }
        });

        const order = await client.execute(request);

        const approvalUrl = order.result.links.find(link => link.rel === 'approve').href;
        res.redirect(approvalUrl);
    } catch (err) {
        console.error('Error creating PayPal order:', err);
        res.status(500).send("Error creating PayPal order");
    }
});


app.get('/payment/success', async (req, res) => {
    const planID = req.query.plan_ID;
    const orderID = req.query.token;

    let request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        console.log('Capture result:', capture.result);
        res.render('payment-success', { planID });
    } catch (err) {
        console.error('Error capturing PayPal payment:', err);
        res.status(500).send("Error capturing PayPal payment");
    }
});

app.get('/payment/cancel', (req, res) => {
    res.send("Payment was cancelled. Please try again.");
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
app.get('/adminWorkshops', async function (req, res) {
    try {
        const registrationData = await register.findAll({
            include: [{
                model: addWorkshops,
                attributes: ['Workshop_Name'] // Select only the workshop name
            }]
        });
        const workshops = await addWorkshops.findAll();

        res.render('adminWorkshops', {
            layout: 'adminMain',
            workshops: workshops.map(workshop => workshop.get({ plain: true })),
            registrationData: registrationData.map(registration => registration.get({ plain: true })),
            json: JSON.stringify
        });
    } catch (err) {
        console.error('Error fetching workshops:', err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

//delete registered user
app.post('/removeRegistration/:id', async function (req, res) {
    const registrationId = req.params.id;

    try {
        await register.destroy({
            where: { Register_ID: registrationId }
        });

        // Redirect back to the adminWorkshops page
        res.redirect('/adminWorkshops');
    } catch (err) {
        console.error('Error removing registration:', err);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

//admin workshop delete
app.get('/adminWorkshops/delete/:id', (req, res) => {
    const workshopId = req.params.id;

    addWorkshops.findOne({
        where: { Workshop_ID: workshopId }
    }).then(workshop => {
        if (!workshop) {
            return res.status(404).send('Workshop not found');
        }

        return register.findAll({
            where: { Workshop_ID: workshopId },
            attributes: ['Register_Email', 'Register_Name'],
        }).then(registrants => {
            if (registrants.length > 0) {
                const emails = registrants.map(registrant => registrant.Register_Email);

                const subject = 'Workshop Cancellation Notification';
                const text = `Dear User,\n\n` +
                    `We regret to inform you that the workshop "${workshop.Workshop_Name}" you have signed up for has been cancelled.\n` +
                    `We apologize for any inconvenience this may cause.\n\n` +
                    `Best regards,\nFinancial Flare`;

                return sendEmail(emails, subject, text) // Passing the array of emails directly
                    .then(() => registrants);
            } else {
                return [];
            }
        }).then(() => {
            // Delete related rows in workshopRegister
            return register.destroy({
                where: { Workshop_ID: workshopId }
            });
        }).then(() => {
            // Delete the workshop
            return addWorkshops.destroy({
                where: { Workshop_ID: workshopId }
            });
        }).then(() => {
            console.log("Workshop and related registrations deleted, and notifications sent!");
            res.redirect("/adminWorkshops");
        });
    }).catch(err => {
        console.error("Error deleting workshop, related registrations, or sending notifications:", err);
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

app.get('/adminContactUs', async function (req, res) {
    try {
        // Fetch all contact messages from the database
        const contacts = await contactUs.findAll({
            raw: true // Convert the data to plain objects
        });

        // Render the template and pass the contacts data
        res.render('adminContactUs', {
            layout: 'adminMain',
            contacts: contacts, // Pass the data to the template
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).send('Internal Server Error');
    }
});

//remove feedback
app.post('/removeContactUs/:Contact_ID', async function (req, res) {
    try {
        const contactId = req.params.Contact_ID;

        // Delete the contact entry from the database
        await contactUs.destroy({
            where: { Contact_ID: contactId }
        });

        // Redirect back to the adminContactUs page after deletion
        res.redirect('/adminContactUs');
    } catch (error) {
        console.error('Error removing contact:', error);
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
                testName: test.testName,
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
        const customerID = req.session.customerID; // Assuming you pass customer ID from the form
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
            Customer_id: customerID,
            score: totalScore
        });

        // Render the result page with the score
        res.render('quizResult', { totalScore });
        console.log('Quiz completed by customer:', customerID);

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
        res.render('userQuizList2', {
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
        testName,
        quizModule,
        questions // Assuming the form data has been updated to send questions as an array
    } = req.body;

    try {
        // Create a new test
        Test.create({ testID: testID, module: quizModule, testName: testName })
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
        // Get the filter from query parameters, default to 'all-time'
        const filter = req.query.filter || 'all-time';

        // Initialize date range for the filter
        let startDate;
        const endDate = new Date(); // current date

        // Set the date range based on the filter
        if (filter === 'today') {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of the day
            endDate.setHours(23, 59, 59, 999); // End of the day
        } else if (filter === 'weekly') {
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7); // Last 7 days
            startDate.setHours(0, 0, 0, 0); // Start of the first day
        } else if (filter === 'monthly') {
            startDate = new Date();
            startDate.setDate(1); // Start of the current month
            startDate.setHours(0, 0, 0, 0); // Start of the first day
        }

        // Fetch all quiz results
        const leaderboardData = await QuizResult.findAll({
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['Customer_fName', 'Customer_lName'],
                },
                {
                    model: Test,
                    as: 'Test',
                    attributes: ['module'],
                }
            ],
            order: [['score', 'DESC']] // Order by score in descending order
        });

        // Filter the results based on the date range
        const filteredData = leaderboardData.filter(result => {
            const createdAt = new Date(result.createdAt);
            if (filter === 'today' || filter === 'weekly' || filter === 'monthly') {
                return createdAt >= startDate && createdAt <= endDate;
            }
            return true; // No filter applied (all-time)
        });

        // Format the data for the leaderboard
        const leaderboard = filteredData.map(result => ({
            customerName: `${result.Customer.Customer_fName} ${result.Customer.Customer_lName}`,
            testID: result.testID,
            score: result.score,
            module: result.Test.module,
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