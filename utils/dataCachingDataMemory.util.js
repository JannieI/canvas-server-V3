// dataCacheDataMemory.util.js stores the Server Cached Data in a global variable called
// serverMemoryCache

// TODO - Document steps to add var to Cache:  1. add here  2. add var(s) in WS
var serverMemoryCache =  {
    dashboards: [],               // Corresponds to serverVariableName in dataCachingTable, holds DATA
    datasources: [],
    canvasGroups: [],
    dashboardTags: [],
    widgetGraphs: [],
    transformations: [],
    canvasBackgroundcolors: [],
    dashboardPermissions: [],
    get: function(varName) {
        if (varName == 'dashboards') {
            return serverMemoryCache.dashboards;
        };
        if (varName == 'datasources') {
            return serverMemoryCache.datasources;
        };
        if (varName == 'canvasGroups') {
            return serverMemoryCache.canvasGroups;
        };
        if (varName == 'dashboardTags') {
            return serverMemoryCache.dashboardTags;
        };
        if (varName == 'widgetGraphs') {
            return serverMemoryCache.widgetGraphs;
        };
        if (varName == 'transformations') {
            return serverMemoryCache.transformations;
        };
        if (varName == 'canvasBackgroundcolors') {
            return serverMemoryCache.canvasBackgroundcolors;
        };
        if (varName == 'dashboardPermissions') {
            return serverMemoryCache.dashboardPermissions;
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
        if (varName == 'canvasGroups') {
            serverMemoryCache.canvasGroups = inputArray;
        };
        if (varName == 'dashboardTags') {
            serverMemoryCache.dashboardTags = inputArray;
        };
        if (varName == 'widgetGraphs') {
            serverMemoryCache.widgetGraphs = inputArray;
        };
        if (varName == 'transformations') {
            serverMemoryCache.transformations = inputArray;
        };
        if (varName == 'canvasBackgroundcolors') {
            serverMemoryCache.canvasBackgroundcolors = inputArray;
        };
        if (varName == 'dashboardPermissions') {
            serverMemoryCache.dashboardPermissions = inputArray;
        };
    },

    add: function(varName, input) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = serverMemoryCache.dashboards.concat(input);
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = serverMemoryCache.datasources.concat(input);
        };
        if (varName == 'canvasGroups') {
            serverMemoryCache.canvasGroups = serverMemoryCache.canvasGroups.concat(input);
        };
        if (varName == 'dashboardTags') {
            serverMemoryCache.dashboardTags = serverMemoryCache.dashboardTags.concat(input);
        };
        if (varName == 'widgetGraphs') {
            serverMemoryCache.widgetGraphs = serverMemoryCache.widgetGraphs.concat(input);
        };
        if (varName == 'transformations') {
            serverMemoryCache.transformations = serverMemoryCache.transformations.concat(input);
        };
        if (varName == 'canvasBackgroundcolors') {
            serverMemoryCache.canvasBackgroundcolors = serverMemoryCache.canvasBackgroundcolors.concat(input);
        };
        if (varName == 'dashboardPermissions') {
            serverMemoryCache.dashboardPermissions = serverMemoryCache.dashboardPermissions.concat(input);
        };
    },

    remove: function(varName, id) {
        if (varName == 'dashboards') {
            serverMemoryCache.dashboards = serverMemoryCache.dashboards.filter(d => d.id != id);
        };
        if (varName == 'datasources') {
            serverMemoryCache.datasources = serverMemoryCache.datasources.filter(ds => ds.id != id);
        };
        if (varName == 'canvasGroups') {
            serverMemoryCache.canvasGroups = serverMemoryCache.canvasGroups.filter(ds => ds.id != id);
        };
        if (varName == 'dashboardTags') {
            serverMemoryCache.dashboardTags = serverMemoryCache.dashboardTags.filter(ds => ds.id != id);
        };
        if (varName == 'widgetGraphs') {
            serverMemoryCache.widgetGraphs = serverMemoryCache.widgetGraphs.filter(ds => ds.id != id);
        };
        if (varName == 'transformations') {
            serverMemoryCache.transformations = serverMemoryCache.transformations.filter(ds => ds.id != id);
        };
        if (varName == 'canvasBackgroundcolors') {
            serverMemoryCache.canvasBackgroundcolors = serverMemoryCache.canvasBackgroundcolors.filter(ds => ds.id != id);
        };
        if (varName == 'dashboardPermissions') {
            serverMemoryCache.dashboardPermissions = serverMemoryCache.dashboardPermissions.filter(ds => ds.id != id);
        };
    },

    update: function(varName, id, inputObject) {
        if (varName == 'dashboards') {
            let serverMemoryCacheIndex = serverMemoryCache.dashboards.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.dashboards[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'datasources') {
            let serverMemoryCacheIndex = serverMemoryCache.datasources.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.datasources[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'canvasGroups') {
            let serverMemoryCacheIndex = serverMemoryCache.canvasGroups.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.canvasGroups[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'dashboardTags') {
            let serverMemoryCacheIndex = serverMemoryCache.dashboardTags.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.dashboardTags[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'widgetGraphs') {
            let serverMemoryCacheIndex = serverMemoryCache.widgetGraphs.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.widgetGraphs[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'transformations') {
            let serverMemoryCacheIndex = serverMemoryCache.transformations.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.transformations[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'canvasBackgroundcolors') {
            let serverMemoryCacheIndex = serverMemoryCache.canvasBackgroundcolors.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.canvasBackgroundcolors[serverMemoryCacheIndex] = inputObject;
            };
        };
        if (varName == 'dashboardPermissions') {
            let serverMemoryCacheIndex = serverMemoryCache.dashboardPermissions.findIndex(d => d.id == id);
            if (serverMemoryCacheIndex >= 0) {
                serverMemoryCache.dashboardPermissions[serverMemoryCacheIndex] = inputObject;
            };
        };
    }
};

module.exports.serverMemoryCache = serverMemoryCache;