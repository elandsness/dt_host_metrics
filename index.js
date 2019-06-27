module.exports = function(KEY, TENANT, FILE, METRICS){
    // HTTP client for making API calls
    const axios = require('axios');

    // Metric definitions
    const METRIC_OPTIONS = require('./metrics.js');

    // For outputting data to file
    const process_csv = require('./process_csv.js');

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
        process_csv(data, METRICS, FILE);
    });



    /*// Query timeseries API for memory used
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
                let contents = ['Dynatrace_ID,Hostname,Memory_Used_GB,Memory_Used_%,Host_Units'];
                for (var x in data){
                    contents.push(`${x},${data[x].hostname},${data[x].used_gb},${data[x].used_percent},${data[x].host_units}`);
                }
                // write out the file
                if (contents.length < 2){
                    console.log('Your query returned no data! Nothing to export.');
                } else {
                    fs.writeFile(FILE, contents.join("\n"), function(err) {
                        if (err){
                            console.log(err)
                        } else {
                            console.log(`All Set! Open "${FILE}" to view results.`);
                        }
                    });
                }
            });
        });
    });*/
}