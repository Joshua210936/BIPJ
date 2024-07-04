const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Savings = db.define('savings', {
    Saving_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Saving_goalName: {
        type : sequelize.STRING
    },
    Saving_amount: {
        type: sequelize.INTEGER
    },
    Saving_startDate: {
        type: sequelize.DATE
    },
    Saving_endDate: {
        type: sequelize.DATE
    },
    Saving_picture: {
        type: sequelize.STRING
    }
});

module.exports = Savings;