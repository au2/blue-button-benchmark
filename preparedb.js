"use strict";

var async = require('async');

var dg = require('./lib/datagenerator');
var d1 = require('./lib/dbdesign1');
var sn = require('./lib/scenarios');
var options = require('./lib/options');

var patientKeys = [];

var needMorePatient = function() {
    return patientKeys.length < options.num_patients;
};

var addPatient = function(callback) {
    var index = patientKeys.length;
    var patkey = dg.generateString(options) + '_' + index;
    patientKeys.push(patkey);
    sn.new_patient_scenario(patkey, callback);
};

console.log('adding ' + options.num_patients + ' patients...');

d1.start(function(err) {
    if (err) {
        console.log('error adding patients...');
        console.log(err);
    } else {
        async.whilst(needMorePatient, addPatient, function(err) {
            if (err) {
                console.log('error adding patients...');
                console.log(err);
            } else {
                console.log('added ' + patientKeys.length + ' patients...');
                process.exit(0);
            }
        });        
    }
});
