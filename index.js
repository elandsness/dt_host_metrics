// HTTP client for making API calls
const axios = require('axios');

// For converting JSON to CSV
const { parse } = require('json2csv');

// Handle command line args
var argv = require('yargs')
    .usage('Usage: $0 -k [api key] -t [tenant url]')
    .demandOption(['k','t'])
    .argv;

// Store api key and tenant url in constants for later use
const KEY = argv.k;
const TENANT = argv.t[argv.t.length -1] == '/' ? argv.t.slice(0, -1) : argv.t; // strip trailing slash if there is one

// Object to store objects to build lines of csv
let data = {};

// Query timeseries API for memory used
let endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.used?includeData=true&relativeTime=week&aggregationType=avg&`;
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
    console.log(error);
}).finally(function () {
    // Query timeseries API for % memory used
    endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=week&aggregationType=avg&`;
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
        console.log(error);
    }).finally(function () {
        console.log(data);
    });
});









/*// Create the CSV
const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
 
try {
    const csv = parse(myData, opts);
    console.log(csv);
} catch (err) {
    console.error(err);
}*/