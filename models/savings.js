const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const SavingsEntry = require('./SavingsEntry');
const Customer = require('./customer'); 

const Savings = db.define('savings', {
    Saving_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Customer_id: {
        type: sequelize.INTEGER,
        references: {
            model: Customer,
            key: 'Customer_id'
        },
        allowNull: true
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
    },
    isCompleted: {
        type: sequelize.BOOLEAN
    }
});

Savings.hasMany(SavingsEntry, { foreignKey: 'Saving_id' });
Savings.belongsTo(Customer, { foreignKey: 'Customer_id', as: 'Customer' });


module.exports = Savings;