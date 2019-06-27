module.exports = function(KEY, TENANT, FILE, METRICS, CANDIDATES){
    // HTTP client for making API calls
    const axios = require('axios');

    // Metric definitions
    const METRIC_OPTIONS = require('./metrics.js');

    // For outputting data to file
    const process_timeseries = require('./timeseries.js');

    // Object to store objects to build lines of csv
    let data = {};

    // Arrays to split out the host vs timeseries vs custom metrics
    let host_m = [], time_m = [], func_m = [];

    // Split the desired metrics into host and time, as they're handled differently
    METRICS.forEach(element => {
        if (METRIC_OPTIONS[element].hasOwnProperty('function')) {
            func_m.push(element);
        } else if (METRIC_OPTIONS[element].type == 'host'){
            host_m.push(element);
        } else {
            time_m.push(element);
        }
    });

    // Query the host API to get the hostname and all the host metrics
    let endpoint = `${TENANT}/api/v1/entity/infrastructure/hosts?relativeTime=day`;
    endpoint = CANDIDATES ? endpoint + '&showMonitoringCandidates=true' : endpoint;
    axios.get(endpoint, {
        headers: {
            'Authorization': `Api-Token ${KEY}`,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        // handle success
        for (var x in response.data){
            data[response.data[x].entityId] = {};
            data[response.data[x].entityId].hostname = response.data[x].displayName
            host_m.forEach(element => {
                data[response.data[x].entityId][METRIC_OPTIONS[element].metric] = response.data[x][METRIC_OPTIONS[element].metric];
            })
        }
    }).catch(function (error) {
        // handle error
        console.log(error.message);
    }).finally(function () {
        // process timeseries metrics
        process_timeseries(KEY, TENANT, FILE, time_m, data);
    });
}