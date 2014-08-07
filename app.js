"use strict";

var async = require('async');
var _ = require('underscore');
var redis = require('redis');

var sn = require('./lib/scenarios');
var optsup = require('./lib/optionssupply')
var d1 = require('./lib/dbdesign1');
var dg = require('./lib/datagenerator');

var run = function(options) {
    var client = redis.createClient();
    
    client.llen('patkeys', function(err, n) {
        if (err || n === 0) {
            console.log('error');
        } else {
            d1.open(options, function(err) {
                var newPatientCounter = {};
                var reviewCounter = {};
    
                if (err) {
                    console.log(err);
                } else {
                    var patIndex = n;
            
                    var reviewIndex = 0;
            
                    var newPatient = setInterval(function() {
                        var patkey = dg.generateString(options) + '_' + patIndex;
                        ++patIndex;
                        newPatientCounter[patkey] = true;
                        sn.new_patient_scenario(patkey, options, function(err) {
                            delete newPatientCounter[patkey];
                            if (err) {
                                console.log(err);
                            }
                        });
                    }, options.getNewPatientFrequency());
            
                    var review = setInterval(function() {
                        ++reviewIndex;
                        client.lindex('patkeys', reviewIndex, function(err, value) {
                            if (err) {
                                console.log(err);
                            } else {
                                reviewCounter[value]=true;
                                sn.reviewMasterHealthRecord(value, options, function(err) {
                                    delete reviewCounter[value];
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }
                        });
                    }, options.getReviewFrequency());
            
                    setTimeout(function() {
                        clearInterval(newPatient);
                        clearInterval(review);
                        client.quit();
                        var cleanup = setInterval(function() {
                            var r = Object.keys(newPatientCounter).length + Object.keys(reviewCounter).length;
                            if (r === 0) {
                                clearInterval(cleanup);
                                d1.close(function(){});                          
                            }
                        }, 1000);
    
                    }, options.duration);
                }
            });
        }
    });
};

var opt = optsup.getFromArgv(process.argv);
if (opt) {
    run(opt);
}
