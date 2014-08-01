"use strict"

var dg = require('../lib/datagenerator');
var hdc = require('../lib/healthdatacontent');

describe('generate data', function() {
    it('generate section', function(done) {
        var options = {
            num_sections: 3,
            num_entries: 3,

            array_size: 3,
            string_size: 7
        };
        var result = dg.generateRecord(options);
        console.log(JSON.stringify(result, undefined, 2));
        done();
    });
});
