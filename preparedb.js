"use strict";

var async = require('async');
var redis = require('redis');

var dg = require('./lib/datagenerator');
var sn = require('./lib/scenarios');
var ds = require('./lib/designsupply');
var optsup = require('./lib/optionssupply');

var run = function(design, options) {
    var patientKeys = [];
    
    var needMorePatient = function() {
        return patientKeys.length < options.num_patients;
    };
    
    var addPatient = function(callback) {
        var index = patientKeys.length;
        var patkey = dg.generateString(options) + '_' + index;
        patientKeys.push(patkey);
        sn.new_patient_scenario(patkey, design, options, callback);
    };
    
    console.log('adding ' + options.num_patients + ' patients...');
    
    design.start(options, function(err) {
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
                    var client = redis.createClient();
                    client.del('patkeys', function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            var savePatKey = function(patKey, cb) {
                                client.rpush('patkeys', patKey, function(err) {
                                    cb(err);
                                });
                            }
                            async.map(patientKeys, savePatKey, function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    client.quit();
                                    design.close();
                                }
                            });                   
                        }   
                    });
                }
            });        
        }
    });
};

var opt = optsup.getFromArgv(process.argv);
if (opt) {
    var design = ds(opt.design);
    if (design) {
        run(design, opt);
    }
}