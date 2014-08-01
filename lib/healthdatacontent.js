"use strict";

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

exports.getSchema = function(sectionName) {
    return schemas[sectionName];
};

exports.getSummaryFields = function(sectionName) {
    return summaryFields[sectionName];
};

exports.getSectionNames = function() {
    return supportedSections;
};