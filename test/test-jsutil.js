"use strict";

var chai = require('chai');

var expect = chai.expect;
chai.config.includeStack = true;

var jsutil = require('../lib/jsutil');

describe('jsutil', function() {
    it('selectFields', function(done) {
        var obj = {
            a: {
                aa: 1,
                ab: 2
            },
            b: 'b',
            c: 'c',
            d: 'd',
            e: {
                ea: 1,
                eb: 2
            }
        };

        var selected = jsutil.selectFields(obj, ['a.ab', 'b', 'd']);        
        var expected = {
            a: {
                ab: 2
            },
            b: 'b',
            d: 'd'
        }
        expect(selected).to.deep.equal(expected);

        done();
    });
});
