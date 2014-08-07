"use strict";

var dg = require('./datagenerator');
var d1 = require('./dbdesign1');

exports.new_patient_scenario = function(patkey, options, callback) {
    var record = dg.generateRecord(options);
    if (! options.silent) {
        console.log('adding patient ' + patkey + '...');
    }
    var start = Date.now();
    d1.saveRecord(patkey, record, 'active', function(err, result) {
        if (err) {
            callback(err);
        } else {
            var end = Date.now();
            if (! options.silent) {
                console.log('added patient ' + patkey + '(' + (end-start) + 'ms)...');           
            }
            callback(null);
        }  
    });
};

exports.reviewMasterHealthRecord = function(patientKey, options, callback) {
    var getEntry = function(result, sections, sectionIndex, entryIndex) {
        var sectionName = sections[sectionIndex];
        var id = result[sectionName][entryIndex]._id;
        console.log('getting detail for ' + id + ' (' + patientKey + ')...');
        var start = Date.now();
        d1.getEntry(sectionName, id, function(err) {
            if (err) {
                callback(err);
            } else {
                var end = Date.now();
                console.log('got detail for ' + id + ' (' + patientKey + ') (' + (end-start) + 'ms)...');           
                ++sectionIndex;
                if (sectionIndex === sections.length) {
                    sectionIndex = 0;
                    ++entryIndex;
                }
                scheduleEntry(result, sections, sectionIndex, entryIndex);
            }
        });
    };

    var scheduleEntry = function(result, sections, sectionIndex, entryIndex) {
        var n = sections.length;
        var total = n * sectionIndex + entryIndex;
        if (total < options.getDetailReviewCount()) {
            setTimeout(function() {
                getEntry(result, sections, sectionIndex, entryIndex);
            }, options.step_delay);

        } else {
            callback(null);
        }
    };   

    console.log('getting dashboard for ' + patientKey + '...');
    var start = Date.now();
    d1.getDashboard(patientKey, 'active', options, function(err, result) {
        if (err) {
            callback(err);
        } else {
            var end = Date.now();
            console.log('got dashboard for ' + patientKey + '(' + (end-start) + 'ms)...');           
            var sections = Object.keys(result);
            scheduleEntry(result, sections, 0, 0);
        }
    });  
};