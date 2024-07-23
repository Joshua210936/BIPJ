const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Customer = require('./customer');
const { Test } = require('./Test'); // Adjust the path as necessary

const Leaderboard = db.define('Leaderboard', {
    leaderboardID: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    customerID: {
        type: sequelize.INTEGER,
        references: {
            model: Customer,
            key: 'Customer_id'
        },
        allowNull: false
    },
    testID: {
        type: sequelize.INTEGER,
        references: {
            model: Test,
            key: 'testID'
        },
        allowNull: false
    },
    points: {
        type: sequelize.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'leaderboards'
});

// Define relationships
Customer.hasMany(Leaderboard, { foreignKey: 'customerID', as: 'leaderboards' });
Leaderboard.belongsTo(Customer, { foreignKey: 'customerID', as: 'customer' });

Test.hasMany(Leaderboard, { foreignKey: 'testID', as: 'leaderboards' });
Leaderboard.belongsTo(Test, { foreignKey: 'testID', as: 'test' });

module.exports = Leaderboard;
