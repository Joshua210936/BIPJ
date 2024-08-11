const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const { min } = require('moment');
const Customer = require('./customer');

const Test = db.define('Test', {
    testID: {
        type: sequelize.INTEGER,
        primaryKey: true,
        allowNull: true
    },
    module: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    testName: {
        type: sequelize.STRING,
        allowNull: false
    },
    
}, {
    tableName: 'tests'
});
// Think of making testID into string
const Question = db.define('Question', {
    testID: {
        type: sequelize.INTEGER,
        references: {
            model: Test,
            key: 'testID'
        },
    },
    questionText: {
        type: sequelize.STRING,
        allowNull: false
    },
    points: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    option1: {
        type: sequelize.STRING,
        allowNull: false,
    },
    option2: {
        type: sequelize.STRING,
        allowNull: false,
    },
    option3: {
        type: sequelize.STRING,
        allowNull: false,
    },
    option4: {
        type: sequelize.STRING,
        allowNull: false,
    },
    correctOption: {
        type: sequelize.INTEGER, // make sure this is only 1-4
        allowNull: false,
        validator: {
            min: 1,
            max: 4
        }
    }
}, {
    tableName: 'questions'
});

// Define relationships
Test.hasMany(Question, { foreignKey: 'testID', as: 'questions' });
Question.belongsTo(Test, {
    foreignKey: 'testID',
    as: 'test'
});



module.exports = { Test, Question };