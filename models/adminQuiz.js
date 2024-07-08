const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const adminQuiz = db.define('adminQuiz', {
    Quiz_ID:{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Quiz_Question:{
        type: sequelize.STRING
    },
    Quiz_Option1:{
        type: sequelize.STRING
    },
    Quiz_Option2:{
        type: sequelize.STRING
    },
    Quiz_Option3:{
        type: sequelize.STRING
    },
    Quiz_Option4:{
        type: sequelize.STRING
    },
    Quiz_Answer:{
        type: sequelize.STRING
    }
});

module.exports = adminQuiz;