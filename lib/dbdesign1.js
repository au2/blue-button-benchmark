"use strict";

var mongodb = require('mongodb');
var async = require('async');
var _ = require('underscore');

var hdc = require('./healthdatacontent');
var ObjectId = mongodb.FObjectID;

var db = null;

var openn = exports.open = function(options, callback) {
    if (db) {
        callback(new Error('database has already been opened'));
    } else {
        var server = new mongodb.Server(options.server, 27017);
        db = new mongodb.Db('design1', server, {w:1});
        db.open(function(err) {
            callback(err); // do not expose err;
        });
    }
};

exports.close = function(callback) {
    if (db) {
        db.close(callback);
    } else {
        callback(new Error('database has not been opened'));
    }
};

var clear = exports.clear = function(names, callback) {
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
                if (fcs.length < 1) {
                    callback(null);
                } else {
                    async.each(fcs, function(collection, cb) {
                        collection.drop(cb);
                    }, function(err) {
                        callback(err);
                    });
                }
            }
        });
    } else {
        callback(new Error('database has not been opened'));
    }
};

exports.start = function(options, callback) {
    var n = options.num_sections;
    var names = hdc.getSectionNames(n);
    openn(options, function(err) {
        if (err) {
            callback(err);
        } else {
            clear(names, callback);
        }
    });
};

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
            var sr = {};
            sr[sectionName] = result;
            callback(null, sr);
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
            var resultAsObject = _.extend.apply(null, result);
            callback(null, resultAsObject);
        }
    });
};

exports.getDashboard = function(patKey, status, options, callback) {
    if (db) {
        var f = function(sectionName, cb) {
            var c = db.collection(sectionName);
            var q = {pat_key: patKey, status: status};
            var summaryFields = hdc.getSummaryFields(sectionName);
            var fields = summaryFields.reduce(function(r, e) {
                r['data.' + e] = true;
                return r;
            }, {});
            c.find(q, fields).toArray(function(err, entries) {
                if (err) {
                    cb(err);
                } else {
                    var sr = {};
                    sr[sectionName] = entries;
                    cb(null, sr);
                }
            });
        };
        var names = hdc.getSectionNames(options.num_sections);
        async.map(names, f, function(err, result) {
            if (err) {
                callback(err);
            } else {
                var resultAsObject = _.extend.apply(null, result);
                callback(null, resultAsObject);
            }
        });
    } else {
        callback(new Error('database has not been opened'));
    }
};

exports.getEntry = function(sectionName, id, callback) {
    if (db) {
        var c = db.collection(sectionName);
        c.findOne({_id: id}, function(err, entry) {
            if (err) {
                callback(err);
            } else {
                callback(null, entry.data);
            }
        });
    } else {
        callback(new Error('database has not been opened'));        
    }
};
