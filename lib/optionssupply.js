"use strict";

var path = require('path');
var _ = require('underscore');

var optionsBase = {
    getDetailReviewCount: function() {
        return 4;
    },

    getNewPatientFrequency: function() {
        return 2000;
    },

    getReviewFrequency: function() {
        return 1000;
    }
};

var localbasic = Object.create(optionsBase);
_.extend(localbasic, {
    server: 'localhost',

    new_patient_frequency: 1000,
    
    num_patients: 1000,
    num_entries: 3,
    num_sections: 3,

    num_review_per_year: 24,

    array_size: 3,
    string_size: 7,

    step_delay: 5000,

    duration: 10000
});

var localbasicindexed = Object.create(localbasic);
_.extend(localbasicindexed, {
    indexpatnstat: true
});

var serverbusy = Object.create(optionsBase);
_.extend(serverbusy, {
    server: '192.168.11.139',

    new_patient_frequency: 1000,
    
    num_patients: 50000,
    num_entries: 3,
    num_sections: 3,

    num_review_per_year: 24,

    array_size: 3,
    string_size: 7,

    step_delay: 5000,

    duration: 300000
});

var serverbusyindexed = Object.create(serverbusy);
_.extend(serverbusyindexed, {
    indexpatnstat: true
});

var optionsMap = {
    localbasic: localbasic,
    localbasicindexed: localbasicindexed,    
    serverbusy: serverbusy,
    serverbusyindexed: serverbusyindexed
};

var scriptModifier = {
    app: function(options) {
        options.silent = false;
    },
    preparedb: function(options) {
        options.silent = true;
    } 
};

exports.getFromArgv = function(argv) {
    if (argv.length > 3) {
        var options = optionsMap[argv[3]];
        if (options) {
            var script = path.basename(argv[1], '.js');
            var m = scriptModifier[script];
            if (m) {
                m(options);
            }
            options.design = argv[2];
            return options;
        } else {
            console.log('"' + argv[3] + '" is not a valid options key.');
        }
    } else {
        console.log('Options key and design key must be specified as command line options.');
    }
    return null;
};

module.exports = exports; 