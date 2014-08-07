"use strict";

var chai = require('chai');
var async = require('async');

var dg = require('../lib/datagenerator');
var d1 = require('../lib/dbdesign1');
var hdc = require('../lib/healthdatacontent');
var jsutil = require('../lib/jsutil');

var expect = chai.expect;
chai.config.includeStack = true;

describe('design1', function() {
    var options = {
        server: 'localhost',

        num_sections: 3,
        num_entries: 3,

        array_size: 3,
        string_size: 7
    };

    var record = null;

    before(function(done) {
        d1.start(options, done);
    });

    it('saveRecord', function(done) {
        record = dg.generateRecord(options);
        d1.saveRecord('patkey', record, 'active', function(err, result) {
            Object.keys(result).forEach(function(sectionName) {                
                expect(record[sectionName]).to.exist;
                var actual = result[sectionName].map(function(e) {
                    return e.data;
                });
                var expected = record[sectionName];
                expect(actual).to.deep.include.members(expected);
                expect(expected).to.deep.include.members(actual);
            });
            done(err);
        });
    });

    var entries = {};

    it('getDashboard', function(done) {
        d1.getDashboard('patkey', 'active', options, function(err, result) {
            if (err) {
                done(err);
            } else {
                Object.keys(result).forEach(function(sectionName) {
                    var summaryFields = hdc.getSummaryFields(sectionName);
                    expect(record[sectionName]).to.exist;
                    var actual = result[sectionName].map(function(e) {
                        return e.data;
                    });
                    var expectedFull = record[sectionName];
                    var expected = expectedFull.map(function(e) {
                        return jsutil.selectFields(e, summaryFields);
                    });
                    expect(actual).to.deep.include.members(expected);
                    expect(expected).to.deep.include.members(actual);
                    entries[sectionName] = result[sectionName].map(function(e) {
                        return e._id;
                    });                    
                }); 
                done();
            }
        });
    });

    it('getEntry', function(done) {
        Object.keys(entries).forEach(function(sectionName) {
            var f = function(id, cb) {
                d1.getEntry(sectionName, id, cb);
            };
            async.map(entries[sectionName], f, function(err, actual) {
                if (err) {
                    done(err);
                } else {
                    var expected = record[sectionName];
                    expect(actual).to.deep.include.members(expected);
                    expect(expected).to.deep.include.members(actual);
                }
            });
        });
        done();
    });

    after(function(done) {
        d1.close(done);
    });
});
