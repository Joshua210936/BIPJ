const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// AdminQuiz Model
const AdminQuiz = db.define('adminQuiz', {
    Test_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Quiz_Module: {
        type: Sequelize.STRING
    }
});

// QuizQuestion Model
const QuizQuestion = db.define('quizQuestion', {
    Question_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    Test_ID: {
        type: Sequelize.INTEGER,
        references: {
            model: AdminQuiz,
            key: 'Test_ID'
        }
    },
    Quiz_Question: {
        type: Sequelize.STRING
    },
    Points: {
        type: Sequelize.INTEGER
    }
});

// QuizAnswer Model
const QuizAnswer = db.define('quizAnswer', {
    Answer_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Question_ID: {
        type: Sequelize.INTEGER,
        references: {
            model: QuizQuestion,
            key: 'Question_ID'
        }
    },
    Answer_Text: {
        type: Sequelize.STRING
    },
    Is_Correct: {
        type: Sequelize.BOOLEAN
    }
});

// Define Relationships
AdminQuiz.hasMany(QuizQuestion, { foreignKey: 'Test_ID' });
QuizQuestion.belongsTo(AdminQuiz, { foreignKey: 'Test_ID' });

QuizQuestion.hasMany(QuizAnswer, { foreignKey: 'Question_ID' });
QuizAnswer.belongsTo(QuizQuestion, { foreignKey: 'Question_ID' });

module.exports = { AdminQuiz, QuizQuestion, QuizAnswer };
