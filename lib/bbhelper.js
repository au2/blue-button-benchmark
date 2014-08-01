"use strict";

var generateEntry = exports.generateEntry = (function() {
    var generateChar = (function() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';
        return function() {
            var index = Math.floor(Math.random() * chars.length);
            return chars.charAt(index);
        };
    })();

    var generateString = function(options) {
        var length = (options && options.length) || 7;
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

    var generateObject = function(description) {
        var result = Object.keys(description).reduce(function(r, key) {
            var elem = generateGeneric(description[key]);
            r[key] = elem;
            return r;
        }, {});
        return result;
    };

    var generateArray = function(description) {
        var result = [];
        for (var i=0; i<3; ++i) {
            var elem = generateGeneric(description);
            result.push(elem);
        }
        return result;
    };

    var generateGeneric = function(description) {
        if (Array.isArray(description)) {
            return generateArray(description[0]);
        } else if (typeof description === "object") {
            return generateObject(description);
        } else {
            console.log(description);
            return generateTypedData[description]();
        }
    };

    return function(schema) {
        return generateGeneric(schema);
    };
})();

var generateSection = exports.generateSection = function(schema, options) {
    var result = [];
    for (var i=0; i<options.num_sections; ++i) {
        var entry = generateEntry(schema);
        result.push(entry);
    }
    return result;
};



