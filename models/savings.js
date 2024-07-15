const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const SavingsEntry = require('./SavingsEntry');

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
        type: sequelize.DATEONLY
    },
    Saving_endDate: {
        type: sequelize.DATEONLY
    },
    Saving_frequency: {
        type: sequelize.STRING
    },
    Saving_calculate: {
        type: sequelize.INTEGER
    },
    Saving_picture: {
        type: sequelize.STRING
    }
});

Savings.hasMany(SavingsEntry, { foreignKey: 'Saving_id' });


module.exports = Savings;