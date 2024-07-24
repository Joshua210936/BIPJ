const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const Test = require('./test');

const Leaderboard = db.define('leaderboard', {
    Leaderboard_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Customer_id: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Test,
            key: 'Customer_id'
        }
    },

    gained_Points: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Test,
            key: 'gained_Points'
        }
    },
    
        
});


module.exports = Leaderboard;