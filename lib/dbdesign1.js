"use strict";

var mongodb = require('mongodb');
var async = require('async');
var _ = require('underscore');

var db = null;

exports.open = function(callback) {
    if (db) {
        callback(new Error('database has already been opened'))
    } else {
        var server = new mongodb.Server('localhost', 27017);
        db = new mongodb.Db('design1', server, {w:1});
        db.open(function(err) {
            callback(err); // do not expose err;
        });
    }; 
};

exports.close = function(callback) {
    if (db) {
        db.close(callback);
    } else {
        callback(new Error('database has not been opened'))
    }
};

exports.clear = function(names, callback) {
    if (db) {
        db.collections(function(err, collections) {
            if (err) {
                callback(err);
            } else {
                var namesDict = names.reduce(function(r, v) {
                    r[v] = true;
                    return r;
                }, {});
                var fcs = collections.filter(function(c) {
                    return namesDict[c.collectionName];
                });
                async.each(fcs, function(collection, cb) {
                    collection.drop();
                }, callback);
            }
        });
    } else {
        callback(new Error('database has not been opened'))
    }
}

var saveEntry = exports.saveEntry = function(patKey, sectionName, entry, status, callback) {
    var collection = db.collection(sectionName);
    var input = {
        data: entry,
        pat_key: patKey,
        status: status
    };
    collection.insert(input, function(err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result[0]);
        }
    });
};

var saveSection = exports.saveSection = function(patKey, sectionName, section, status, callback) {
    var f = function(entry, cb) {
        saveEntry(patKey, sectionName, entry, status, cb);
    };
    async.map(section, f, function(err, result) {
        if (err) {
            callback(err);
        } else {
            var sectionizedResult = {};
            sectionizedResult[sectionName] = result;
            callback(null, sectionizedResult);
        }
    });
};

exports.saveRecord = function(patKey, record, status, callback) {
    var f = function(sectionName, cb) {
        saveSection(patKey, sectionName, record[sectionName], status, cb);
    };
    async.map(Object.keys(record), f, function(err, result) {
        if (err) {
            callback(err);
        } else {
            result.pre
            var resultAsObject = _.extend.apply(null, result);
            callback(null, resultAsObject);
        }
    });
};
