"use strict";

var _ = require('underscore');

var generateEntry = exports.generateEntry = (function() {
    var generateChar = (function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';
        return function() {
            var index = Math.floor(Math.random() * chars.length);
            return chars.charAt(index);
        };
    })();

    var generateString = function(options) {
        var length = options.string_size;
        var result = "";
        for (var i=0; i<length; ++i) {
            result += generateChar();
        }
        return result;
    };

    var generateDate = function(options) {
        return new Date();
    };

    var generateNumber = function(options) {
       return Math.floor(Math.random() * 50);
    };

    var generateBoolean = function() {
        return (Math.random() < 0.5) ? true : false;
    };

    var generateTypedData = {
        string: generateString,
        datetime: generateDate,
        number: generateNumber,
        boolean: generateBoolean,
        any: generateString,
    };

    var generateObject = function(description, options) {
        var result = Object.keys(description).reduce(function(r, key) {
            var elem = generateGeneric(description[key], options);
            r[key] = elem;
            return r;
        }, {});
        return result;
    };

    var generateArray = function(description, options) {
        return _.range(options.array_size).map(function() {
            return generateGeneric(description, options);
        });
    };

    var generateGeneric = function(description, options) {
        if (Array.isArray(description)) {
            return generateArray(description[0], options);
        } else if (typeof description === "object") {
            return generateObject(description, options);
        } else {
            return generateTypedData[description](options);
        }
    };

    return function(schema, options) {
        return generateGeneric(schema, options);
    };
})();

var generateSection = exports.generateSection = function(schema, options) {
    return _.range(options.num_sections).map(function() {
        return generateEntry(schema, options);
    });
};
