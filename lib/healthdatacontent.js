"use strict";

var _ = require('underscore');

var schemas = {
    allergies: {
        allergen: {
            name: "string",
            code: "string",
            code_system_name: "string",
            nullFlavor: "string",
            translations: [
                {
                    name: "string",
                    code: "string",
                    code_system_name: "string",
                    nullFlavor: "string"
                }
            ]
        },
        date: [
            {
                date: "datetime",
                precision: "string"
            }
        ],
        identifiers: [
            {
                identifier: "string",
                identifier_type: "string"
            }
        ],
        severity: "string",
        status: "string",
        reaction: [
            {
                reaction: {  
                    code: "string", 
                    name: "string", 
                    code_system_name: "string",
                    nullFlavor: "string",
                    translations: [
                        {
                            name: "string",
                            code: "string",
                            code_system_name: "string",
                            nullFlavor: "string"
                        }
                    ],
                    severity: "string"
                }
            }
        ]
    }
};

var summaryFields = {
    allergies: ['allergen.name', 'status', 'severity']
};

var supportedSections = Object.keys(schemas);

var re = /_\d+$/;

var getSectionNameForIndex = function(sectionIndex) {
    var index = sectionIndex % supportedSections.length;
    return supportedSections[index];
};

exports.getSchema = function(sectionIndex) {
    var sectionName = getSectionNameForIndex(sectionIndex);
    return schemas[sectionName];
};

exports.getSummaryFields = function(sectionName) {
    var index = sectionName.search(re);
    if (index < 0) {
        return summaryFields[sectionName];
    } else {
        var actualName = sectionName.slice(0, index);
        return summaryFields[actualName];
    }
};

exports.getSectionNames = function(numSections) {
    var n = supportedSections.length;
    if (numSections < n) {
        return supportedSections;
    } else {
        var addSuffix = function(inputArray, suffix) {
            return inputArray.map(function(e) {
                return e + '_' + suffix;
            });
        };
        var repeat = Math.floor(numSections / n);
        var result = _.range(repeat).reduce(function(r, c) {
            var suffixed = addSuffix(supportedSections, c);
            return r.concat(suffixed);
        }, []);
        var remainder = numSections % n;
        if (remainder > 0) {
            var piece = supportedSections.slice(0, remainder);
            result.concat(addSuffix(piece, repeat));
        }
        return result;
    }
};