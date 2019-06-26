// HTTP client for making API calls
const axios = require('axios');

// Handle command line args
var argv = require('yargs')
    .usage('Usage: $0 -k [api key] -t [tenant url] -f [output file]')
    .demandOption(['k','t'])
    .argv;

// For outputting data to file
var fs = require('file-system');

// Store api key, tenant url and file path in constants for later use
const KEY = argv.k;
const TENANT = argv.t[argv.t.length -1] == '/' ? argv.t.slice(0, -1) : argv.t; // strip trailing slash if there is one
const FILE = argv.f ? argv.f : './dt_data.csv';

// Object to store objects to build lines of csv
let data = {};

// Query timeseries API for memory used
let endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.used?includeData=true&relativeTime=day&aggregationType=avg&`;
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
    endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=day&aggregationType=avg&`;
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
            console.log(error);
        }).finally(function () {
            // create the csv
            let contents = ['Dynatrace_ID,Hostname,Memory_Used_GB,Memory_Used_%,Host_Units'];
            for (var x in data){
                contents.push(`${x},${data[x].hostname},${data[x].used_gb},${data[x].used_percent},${data[x].host_units}`);
            }
            // write out the file
            fs.writeFile(FILE, contents.join("\n"), function(err) {
                if (err){
                    console.log(err)
                } else {
                    console.log(`All Set! Open "${FILE}" to view results.`);
                }
            });
        });
    });
});