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