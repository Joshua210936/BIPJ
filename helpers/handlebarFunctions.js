const moment = require('moment');

module.exports = {
    ifEquals: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },

    concat: function(value1, value2) {
        return value1 + value2;
    },

    formatDate: function(date, targetFormat){
        return moment(date).utc(true).format(targetFormat)
    },

    renderNavbar: function(userType, options) {
        switch (userType) {
            case 'customer':
                return options.fn({partial: '_userNavbar'});
            case 'admin':
                return options.fn({partial: '_adminNavbar'});
            default:
                return options.fn({partial: '_guestNavbar'});
        }
    }

};