const sequelize = require('sequelize');
const db = require('../config/DBConfig');




const SavingsEntry = db.define('saving_entry', {
    Entry_id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Saving_id: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'savings',
            key: 'Saving_id'
        }
    },
    Entry_date: {
        type: sequelize.DATEONLY,
        allowNull: false
    },
    Amount_saved: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    Amount_left: {
        type: sequelize.INTEGER,
        allowNull: false
    }
});





module.exports = SavingsEntry;
