// dataCacheDataMemory.js

var serverMemoryCache =  {
    dashboards: null,               // Corresponds to serverVariableName in dataCachingTable, holds DATA
    datasources: null,

    get: function(varName) {
        if (varName == 'dashboards') {
            return serverMemoryCache.dashboards;
        };
        if (varName == 'datasources') {
            return serverMemoryCache.datasources;
        };
        return [];
    },
    set: function(varName, input) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = input;
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = input;
        };
    },
    add: function(varName, input) {
        console.log('xx preAdd len', serverMemoryCache.dashboards.length)
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = serverMemoryCache.dashboards.concat(input);
            console.log('xx postAdd len', serverMemoryCache.dashboards.length)
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = serverMemoryCache.datasources.concat(input);
        };
    },
    remove: function(varName, id) {
        console.log('xx preRemove len', serverMemoryCache.dashboards.length)
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = serverMemoryCache.dashboards.filter(d => d.id != id);
            console.log('xx postRemove len', serverMemoryCache.dashboards.length)
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = serverMemoryCache.datasources.concat(input);
        };
    }
};

module.exports.serverMemoryCache = serverMemoryCache;