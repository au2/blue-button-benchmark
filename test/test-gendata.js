"use strict"

var bbhelper = require('../lib/bbhelper');
var hdc = require('../lib/healthdatacontent');

describe('generate data', function() {
    it('generate section', function(done) {
        var options = {
            num_sections: 3
        };
        var schema = hdc.getEntrySchema('allergies');
        var result = bbhelper.generateSection(schema, options);
        console.log(JSON.stringify(result, undefined, 2));
        done();
    });
});
