const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const moment = require('moment');
router.use(bodyParser.urlencoded({ extended: false }));

// Database import
const AdminQuiz = require('../models/adminQuiz');
const QuizQuestion = require('../models/quizQuestion');
const QuizAnswer = require('../models/quizAnswer');

// Create a new AdminQuiz
router.post('/adminQuiz', async (req, res) => {
    try {
        const { Quiz_Module } = req.body;
        const newAdminQuiz = await AdminQuiz.create({ Quiz_Module });
        res.status(201).json(newAdminQuiz);
    } catch (error) {
        console.error('Error creating AdminQuiz:', error);
        res.status(500).json({ error: 'Failed to create AdminQuiz' });
    }
});

// Create a new QuizQuestion
router.post('/quizQuestion', async (req, res) => {
    try {
        const { Test_ID, Quiz_Question, Points } = req.body;
        const newQuizQuestion = await QuizQuestion.create({ Test_ID, Quiz_Question, Points });
        res.status(201).json(newQuizQuestion);
    } catch (error) {
        console.error('Error creating QuizQuestion:', error);
        res.status(500).json({ error: 'Failed to create QuizQuestion' });
    }
});

// Create a new QuizAnswer
router.post('/quizAnswer', async (req, res) => {
    try {
        const { Question_ID, Answer_Text, Is_Correct } = req.body;
        const newQuizAnswer = await QuizAnswer.create({ Question_ID, Answer_Text, Is_Correct });
        res.status(201).json(newQuizAnswer);
    } catch (error) {
        console.error('Error creating QuizAnswer:', error);
        res.status(500).json({ error: 'Failed to create QuizAnswer' });
    }
});

module.exports = router;