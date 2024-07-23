const mySQLDB = require('./DBConfig');
// This part would be need to change according to the model name
const user = require('../models/customer');
const saving = require('../models/savings');
const Test = require('../models/test');
const Leaderboard = require('../models/leaderboard');

const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('BIPJ DB database connected');
        })
        .then(() => {
            /*user.hasMany(video);*/
            mySQLDB.sync({
                force: drop
            }).then(() => {
                console.log('Create table if none exists')
            }).catch(err => console.log(err));
        })
        .catch(err => console.log('Error: ' +  err));
};

module.exports = { setUpDB };