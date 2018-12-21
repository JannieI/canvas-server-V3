// serverVariablesMemory stores key-value pairs of global (server-wide) variables
module.exports = function () {
    var cache = {
        companyName: 'Clarity Analytics Pty Ltd'
    };
    return {
        get: function (key) { return cache[key]; },
        set: function (key, val) { cache[key] = val; }
    }
}();