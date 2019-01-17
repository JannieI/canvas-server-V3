// dataCacheTableMemory.js
module.exports = function () {
    var cache = {};
    return {
        get: () => { 
            return cache; 
        },
        set:  (input) => { 
            cache = input;
        }
    };
}();