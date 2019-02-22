// dataCacheDataMemory.util.js stores the Server Cached Data in a global variable called
// serverMemoryCache

var serverMemoryCache =  {
    dashboards: [],               // Corresponds to serverVariableName in dataCachingTable, holds DATA
    datasources: [],

    get: function(varName) {
        if (varName == 'dashboards') {
            return serverMemoryCache.dashboards;
        };
        if (varName == 'datasources') {
            return serverMemoryCache.datasources;
        };
        return [];
    },
    set: function(varName, inputArray) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = inputArray;
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = inputArray;
        };
    },
    add: function(varName, input) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = serverMemoryCache.dashboards.concat(input);
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = serverMemoryCache.datasources.concat(input);
        };
    },
    remove: function(varName, id) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = serverMemoryCache.dashboards.filter(d => d.id != id);
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = serverMemoryCache.datasources.filter(ds => ds.id != id);
        };
    }
};

module.exports.serverMemoryCache = serverMemoryCache;