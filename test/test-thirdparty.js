"use strict";

var chai = require('chai');

var expect = chai.expect;
chai.config.includeStack = true;

describe('regexp', function() {
    it('section name', function(done) {
        var re = /_\d+$/;

        expect('allergies'.search(re)).to.equal(-1);
        expect('allergies_0'.search(re)).to.equal(9);
        expect('allergies_1'.search(re)).to.equal(9);

        var index = 'allergies_1'.search(re);
        expect('allergies_1'.slice(0, index)).to.equal('allergies');

        done();
    });
});
