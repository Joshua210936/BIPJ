const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const register = db.define('register', {
    Register_ID:{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Register_Name:{
        type: sequelize.STRING
    },
    Register_Email:{
        type: sequelize.STRING
    },
    Register_Date:{
        type: sequelize.DATE
    },
    // Workshop_ID: {
    //     type: Sequelize.INTEGER,
    //     references: {
    //         model: addWorkshops, // Reference to the Workshop model
    //         key: 'Workshop_ID'
    //     }
    // }
});

// Register.belongsTo(addWorkshops, { foreignKey: 'Workshop_ID' });
module.exports = register;