"use strict";

var designMap = {
    design1: require('./dbdesign1')
};

module.exports = exports = function(designKey) {
    var r = designMap[designKey];
    if (! r) {
        console.log('"' + designKey + '" is not a valid design key.');
    }
    return r;
};