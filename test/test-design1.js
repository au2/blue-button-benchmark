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

    before(function(done) {
        var n = options.num_sections;
        var names = hdc.getSectionNames(n);
        d1.open(function(err) {
            if (err) {
                done(err);
            } else {
                d1.clear(names, done);
            }
        });
    });

    it('saveRecord', function(done) {
        var record = dg.generateRecord(options);
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

    after(function(done) {
        d1.close(done);
    });
});