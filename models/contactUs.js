const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const contactUs = db.define('contactUs', {
    Contact_ID:{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Contact_Name:{
        type: sequelize.STRING
    },
    Contact_Email:{
        type: sequelize.STRING
    },
    Contact_Type:{
        type: sequelize.STRING
    },
    Contact_Message:{
        type: sequelize.TEXT
    },
});

module.exports = contactUs;