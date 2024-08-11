// models/quizResult.js
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Customer = require('./customer');
const { Test } = require('./test');

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

// Relations
QuizResult.belongsTo(Customer, { foreignKey: 'Customer_id' , as: 'Customer'});
QuizResult.belongsTo(Test, { foreignKey: 'testID', as: 'Test' });

// Static method to count attempts
QuizResult.countAttempts = async function(customerId, testId) {
    return await this.count({
        where: {
            Customer_id: customerId,
            testID: testId
        }
    });
};

// Static method to get the highest score
QuizResult.highestScore = async function(customerId, testId) {
    return await this.max('score', {
        where: {
            Customer_id: customerId,
            testID: testId
        }
    });
};

module.exports = QuizResult;