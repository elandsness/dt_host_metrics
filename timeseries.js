module.exports = function(KEY, TENANT, FILE, METRICS, data) {
    // HTTP client for making API calls
    const axios = require('axios');

    // Metric definitions
    const METRIC_OPTIONS = require('./metrics.js');

    // For outputting data to file
    const process_csv = require('./process_csv.js');

    // For all of the one off functions
    const functions = require('./functions.js');

    // Function to handle standard metric calls
    const get_metric = (n,m,callback,agr) => {
        // Set default aggregation
        agr = agr ? agr : 'avg';
        // Endpoint for Dynatrace api to grab metric entries
        let endpoint = `${TENANT}/api/v1/timeseries/${m}?includeData=true&relativeTime=day&aggregationType=${agr}`;
        // To store data returned from function
        let result = {};
        // Make the api call
        axios.get(endpoint, {
            headers: {
                'Authorization': `Api-Token ${KEY}`,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            // handle success
            for (var x in response.data.dataResult.dataPoints){
                if (agr == 'avg'){
                    let tmp_total = 0, tmp_count = 0;
                    // get the avg value for the available datapoints
                    for (var y in response.data.dataResult.dataPoints[x]){
                        tmp_count++;
                        tmp_total += response.data.dataResult.dataPoints[x][y][1];
                    }
                    result[response.data.dataResult.entities[x]] = {};
                    result[response.data.dataResult.entities[x]][n] = tmp_total / tmp_count;
                } else {
                    result[response.data.dataResult.entities[x]] = {};
                    result[response.data.dataResult.entities[x]][n] = response.data.dataResult.dataPoints[x].slice(-1)[0][1];
                }
            }
        }).catch(function (error) {
            // handle error
            console.log(error.message);
            return null;
        }).finally(function () {
            callback(result);
        });
    }

    METRICS.forEach(element => {
        if (METRIC_OPTIONS[element].hasOwnProperty('function')){
            functions[METRIC_OPTIONS[element]['function']](data);
        } else {
            get_metric(METRIC_OPTIONS[element].metric,
                    METRIC_OPTIONS[element].api_metric,
                    (result) => console.log(result),
                    METRIC_OPTIONS[element].method ? METRIC_OPTIONS[element].method : 'avg'
                );
        }
    });

 /*   // Query timeseries API for memory used
    let endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.used?includeData=true&relativeTime=day&aggregationType=avg`;
    axios.get(endpoint, {
        headers: {
            'Authorization': `Api-Token ${KEY}`,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        // handle success
        for (var x in response.data.dataResult.dataPoints){
            let tmp_total = 0, tmp_count = 0;
            for (var y in response.data.dataResult.dataPoints[x]){
                tmp_count++;
                tmp_total += response.data.dataResult.dataPoints[x][y][1];
            }
            data[x] = {
                    'hostname': response.data.dataResult.entities[x],
                    'used_gb': (tmp_total / tmp_count / 1024 / 1024 / 1024).toFixed(2)
                };
        }
    }).catch(function (error) {
        // handle error
        console.log(error.message);
    }).finally(function () {
        // Query timeseries API for % memory used
        endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=day&aggregationType=avg`;
        axios.get(endpoint, {
            headers: {
                'Authorization': `Api-Token ${KEY}`,
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            // handle success
            for (var x in response.data.dataResult.dataPoints){
                let tmp_total = 0, tmp_count = 0;
                for (var y in response.data.dataResult.dataPoints[x]){
                    tmp_count++;
                    tmp_total += response.data.dataResult.dataPoints[x][y][1];
                }
                data[x].used_percent = (100 - (tmp_total / tmp_count)).toFixed(2) + '%';
            }
        }).catch(function (error) {
            // handle error
            console.log(error.message);
        }).finally(function () {
            // Query the hosts API to get the consumed host units
            endpoint = `${TENANT}/api/v1/entity/infrastructure/hosts?relativeTime=day`;
            axios.get(endpoint, {
                headers: {
                    'Authorization': `Api-Token ${KEY}`,
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                // handle success
                for (var x in response.data){
                    if (data.hasOwnProperty(response.data[x].entityId)){
                        data[response.data[x].entityId].host_units = response.data[x].consumedHostUnits;
                    }
                }
            }).catch(function (error) {
                // handle error
                console.log(error.message);
            }).finally(function () {
                // create the csv
                process_csv(data, METRICS, FILE);
            });
        });
    });*/
}