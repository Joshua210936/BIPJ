const { DataTypes } = require('sequelize');
const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Test = db.define('Test', {
    testID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    module: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'tests'
});

const Question = db.define('Question', {
    questionText: {
        type: DataTypes.STRING,
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    option1: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    option2: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    option3: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    option4: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    correctOption: {
        type: DataTypes.INTEGER, // make sure this is only 1-4
        allowNull: false
    }
}, {
    tableName: 'questions'
});

// Define relationships
Test.hasMany(Question, { foreignKey: 'testId', as: 'questions' });
Question.belongsTo(Test, {
    foreignKey: 'testId',
    as: 'test'
});



module.exports = { Test, Question };
