// models/quizResult.js
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Customer = require('./customer'); // Assuming you have a customer model

const QuizResult = db.define('QuizResult', {
    resultID: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    testID: {
        type: sequelize.INTEGER,
        references: {
            model: 'tests',
            key: 'testID'
        },
        allowNull: false
    },
    Customer_id: {
        type: sequelize.INTEGER,
        references: {
            model: Customer,
            key: 'Customer_id'
        },
        allowNull: true
    },
    score: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: sequelize.DATE,
        defaultValue: sequelize.NOW
    }
}, {
    tableName: 'quizResults'
});

module.exports = QuizResult;