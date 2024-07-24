// models/quizResult.js
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Customer = require('./customer'); 
const {Test} = require('../models/test');

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

QuizResult.belongsTo(Customer, { foreignKey: 'Customer_id', as: 'Customer' });
QuizResult.belongsTo(Test, { foreignKey: 'testID', as: 'Test' });

module.exports = QuizResult;