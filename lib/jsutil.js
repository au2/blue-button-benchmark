"use strict";

exports.selectFields = function(obj, paths) {
    return paths.reduce(function(r, path) {
        var fields = path.split('.');
        var value = fields.reduce(function(v, field) {
            return v[field];
        }, obj);
        var m = r;
        for (var i=0; i<fields.length-1; ++i) {
            var v = m[fields[i]];
            if (! v) {
                v = m[fields[i]] = {};
            }
            m = v;
        }
        m[fields[fields.length-1]] = value;
        return r;
    }, {});
};
