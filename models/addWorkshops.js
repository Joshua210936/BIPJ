const sequelize = require('sequelize');

const db = require('../config/DBConfig');

const addWorkshops = db.define('addWorkshops', {
    Workshop_ID:{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Workshop_Name:{
        type: sequelize.STRING
    },
    Workshop_StartDate:{
        type: sequelize.DATEONLY
    },
    Workshop_EndDate:{
        type: sequelize.DATEONLY
    },
    Workshop_StartTime:{
        type: sequelize.STRING
    },
    Workshop_EndTime:{
        type: sequelize.STRING
    },
    Workshop_Address:{
        type: sequelize.STRING
    },
    Workshop_Latitude:{
        type: sequelize.STRING
    },
    Workshop_Longitude:{
        type: sequelize.STRING
    },
    Workshop_Description:{
        type: sequelize.STRING
    },
    Workshop_Image:{
        type: sequelize.STRING
    }
});

module.exports = addWorkshops;