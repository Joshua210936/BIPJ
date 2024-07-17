const express = require('express');
const router = express.Router();
const { Test, Question, Option } = require('../models/test');

router.post('/createQuiz', async (req, res) => {
    const { quizID, quizModule, quizName1, quizPoints1, quizOption1, quizOption2, quizOption3, quizOption4, quizCorrectOption1,
            quizName2, quizPoints2, quizOption2_1, quizOption2_2, quizOption2_3, quizOption2_4, quizCorrectOption2,
            quizName3, quizPoints3, quizOption3_1, quizOption3_2, quizOption3_3, quizOption3_4, quizCorrectOption3,
            quizName4, quizPoints4, quizOption4_1, quizOption4_2, quizOption4_3, quizOption4_4, quizCorrectOption4,
            quizName5, quizPoints5, quizOption5_1, quizOption5_2, quizOption5_3, quizOption5_4, quizCorrectOption5 } = req.body;

    try {
        // Create a new test
        const newTest = await Test.create({ TestID: quizID, module: quizModule });

        // Array to store question data
        const questions = [
            { quizName: quizName1, quizPoints: quizPoints1, options: [quizOption1, quizOption2, quizOption3, quizOption4], correctOption: quizCorrectOption1 },
            { quizName: quizName2, quizPoints: quizPoints2, options: [quizOption2_1, quizOption2_2, quizOption2_3, quizOption2_4], correctOption: quizCorrectOption2 },
            { quizName: quizName3, quizPoints: quizPoints3, options: [quizOption3_1, quizOption3_2, quizOption3_3, quizOption3_4], correctOption: quizCorrectOption3 },
            { quizName: quizName4, quizPoints: quizPoints4, options: [quizOption4_1, quizOption4_2, quizOption4_3, quizOption4_4], correctOption: quizCorrectOption4 },
            { quizName: quizName5, quizPoints: quizPoints5, options: [quizOption5_1, quizOption5_2, quizOption5_3, quizOption5_4], correctOption: quizCorrectOption5 }
        ];

        // Iterate over each question and create them along with their options
        for (const questionData of questions) {
            const { quizName, quizPoints, options, correctOption } = questionData;

            // Create the question
            const newQuestion = await Question.create({
                questionText: quizName,
                points: quizPoints,
                testId: newTest.id
            });

            // Create the options for the question
            for (let i = 0; i < options.length; i++) {
                const optionText = options[i];
                const isCorrect = correctOption == i + 1;

                await Option.create({
                    optionText,
                    isCorrect,
                    questionId: newQuestion.id
                });
            }
        }

        res.status(201).send({ message: 'Quiz created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating quiz', error });
    }
});

module.exports = router;

// Path: routes/index.js

// app.get('/adminEditQuiz/:testID', function(req, res) {
//     const { testID } = req.params;

//     try {
//         Test.findOne({ where: { testID: testID } })
//             .then(quiz => {
//                 Question.findAll({ where: { testID: testID } })
//                     .then(questions => {
//                         res.render('adminEditQuiz', { quiz, questions });
//                     })
//                     .catch(err => {
//                         console.error('Error fetching questions:', err);
//                         res.status(500).send({ message: 'Error fetching questions', error: err });
//                     });
//             })
//             .catch(err => {
//                 console.error('Error fetching quiz:', err);
//                 res.status(500).send({ message: 'Error fetching quiz', error: err });
//             });
//     } catch (err) {
//         console.error('Error fetching quiz:', err);
//         res.status(500).send({ message: 'Error fetching quiz', error: err });
//     }
// });

// app.post('/adminEditQuiz', async (req, res) => {
//     const { testID, quizModule, questions } = req.body;

//     try {
//         // Update quiz details
//         await Test.update(
//             {
//                 module: quizModule
//             },
//             {
//                 where: { testID: testID }
//             }
//         );

//         // Update existing questions or create new ones
//         for (let question of questions) {
//             const { id, questionText, points, option1, option2, option3, option4, correctOption } = question;

//             if (id) {
//                 // Update existing question
//                 await Question.update(
//                     {
//                         questionText: questionText,
//                         points: points,
//                         option1: option1,
//                         option2: option2,
//                         option3: option3,
//                         option4: option4,
//                         correctOption: correctOption
//                     },
//                     {
//                         where: { id: id }
//                     }
//                 );
//             } else {
//                 // Create new question
//                 await Question.create({
//                     testID: testID,
//                     questionText: questionText,
//                     points: points,
//                     option1: option1,
//                     option2: option2,
//                     option3: option3,
//                     option4: option4,
//                     correctOption: correctOption
//                 });
//             }
//         }

//         res.redirect('/adminEditQuiz');
//     } catch (err) {
//         console.error('Error updating quiz:', err);
//         res.status(400).send({ message: 'Error updating quiz', error: err });
//     }
// });


// // Delete quiz
// app.post('/adminViewQuiz/delete', function(req, res) {
//     const testID = req.body.test_id;

//     try {
//         // Delete questions first
//         Question.destroy({
//             where: {
//                 testID: testID
//             }
//         })
//         .then(() => {
//             // Then delete test
//             Test.destroy({
//                 where: {
//                     testID: testID
//                 }
//             })
//             .then(() => {
//                 res.status(200).send({ message: 'Quiz deleted successfully' });
//             })
//             .catch(error => {
//                 console.error('Error deleting test:', error);
//                 res.status(500).send({ message: 'Error deleting test', error });
//             });
//         })
//         .catch(error => {
//             console.error('Error deleting questions:', error);
//             res.status(500).send({ message: 'Error deleting questions', error });
//         });
//     } catch (error) {
//         console.error('Error deleting quiz:', error);
//         res.status(500).send({ message: 'Error deleting quiz', error });
//     }
// });