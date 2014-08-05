"use strict";

var chai = require('chai');
var async = require('async');

var dg = require('../lib/datagenerator');
var d1 = require('../lib/dbdesign1');
var hdc = require('../lib/healthdatacontent');

var expect = chai.expect;
chai.config.includeStack = true;

describe('design1', function() {
    var options = {
        num_sections: 3,
        num_entries: 3,

        array_size: 3,
        string_size: 7
    };

    var record = null;

    before(function(done) {
        d1.start(done);
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

    it('getDashboard', function(done) {
        d1.getDashboard('patkey', 'active', function(err, result) {
            if (err) {
                done(err);
            } else {
                Object.keys(result).forEach(function(sectionName) {
                    expect(record[sectionName]).to.exist;
                    var actual = result[sectionName].map(function(e) {
                        return e.data;
                    });
                    var expected = record[sectionName];
                    expect(actual).to.deep.include.members(expected);
                    expect(expected).to.deep.include.members(actual);                    
                }); 
                done();
            }
        });
    });

    after(function(done) {
        d1.close(done);
    });
});
