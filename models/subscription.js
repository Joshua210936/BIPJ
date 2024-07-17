const sequelize = require('sequelize');
const db = require('../config/DBConfig');


const SubscriptionPlans = db.define('subscriptionPlans', {
    plan_ID: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    plan_name: {
        type: sequelize.STRING,
        allowNull: false
    },
    description: {
        type: sequelize.JSON,
        allowNull: false
    },
    price: {
        type: sequelize.FLOAT,
        allowNull: false
    },
    duration: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    duration_unit: {
        type: sequelize.STRING,
        allowNull: false
    },
    isActive: {
        type: sequelize.BOOLEAN,
        allowNull: false
    }
});

module.exports = SubscriptionPlans;