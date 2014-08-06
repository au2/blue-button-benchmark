"use strict";

var async = require('async');
var _ = require('underscore');
var redis = require('redis');

var client = redis.createClient();
client.llen('patkeys', function(err, n) {
    console.log(n + ' elements');
    var f = function(i, cb) {
        client.lindex('patkeys', i, function(err, value) {
            if (err) {
                cb(err);
            } else {
                cb(null, value);
            }
        });
    };

    async.map(_.range(n), f, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
        redis.quit(); 
        process.exit(0);
    });
});
