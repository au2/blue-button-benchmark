"use strict";

var dg = require('./datagenerator');
var d1 = require('./dbdesign1');

var options = require('./options');

exports.new_patient_scenario = function(patkey, callback) {
    var record = dg.generateRecord(options);
    d1.saveRecord(patkey, record, 'active', function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }  
    });
};

