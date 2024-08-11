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