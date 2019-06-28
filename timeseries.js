module.exports = function(KEY, TENANT, FILE, METRICS, time_m, data) {
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
                    result[x] = {};
                    result[x][n] = tmp_total / tmp_count;
                } else {
                    result[x] = {};
                    result[x][n] = response.data.dataResult.dataPoints[x].slice(-1)[0][1];
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
    
    // For updating the data object after an api call
    const updateData = (result, metric) => {
        if (Object.keys(result).length == 0){
            // Metric not available, so remove it from the result
            let index = METRICS.indexOf(metric);
            if (index !== -1) METRICS.splice(index, 1);
        } else if (Object.keys(result).length == 1){
            data[Object.keys(result)[0]][metric] = result[Object.keys(result)[0]][metric];
        } else {
            result.forEach(element => {
                data[element][metric] = result[element][metric];
            });
        }
    }

    // Function to process each metric
    const process_timeseries = (element) => {
        if (METRIC_OPTIONS[element].hasOwnProperty('function')){
            functions[METRIC_OPTIONS[element]['function']](data,
                async (result) => await updateData(result,METRIC_OPTIONS[element].metric));
        } else {
            get_metric(METRIC_OPTIONS[element].metric,
                    METRIC_OPTIONS[element].api_metric,
                    async (result) => await updateData(result,METRIC_OPTIONS[element].metric),
                    METRIC_OPTIONS[element].method ? METRIC_OPTIONS[element].method : 'avg'
                );
        }
    }

    // perform  all of the api calls
    let urls = [];
    for (var x = 0; x < time_m.length; x++){
        if (METRIC_OPTIONS[time_m[x]].hasOwnProperty('function')){
            functions[METRIC_OPTIONS[time_m[x]]['function']](data,
                (result) => updateData(result,METRIC_OPTIONS[element].metric));
        } else {
            let m = METRIC_OPTIONS[time_m[x]].api_metric;
            let agr = METRIC_OPTIONS[time_m[x]].method ? METRIC_OPTIONS[time_m[x]].method : 'avg';
            let endpoint = `${TENANT}/api/v1/timeseries/${m}?includeData=true&relativeTime=day&aggregationType=${agr}`;
            urls.push(endpoint);
        }
    }

    axios.defaults.headers.common['Authorization'] = `Api-Token ${KEY}`;
    let promiseArray = urls.map(url => axios.get(url));
    axios.all(promiseArray)
    .then(async function(results) {
        console.log(results.length)
        for (let y in results){
            // handle success
            for (let x in results[y].data.dataResult.dataPoints){
                let n = '';
                for (let a in Object.keys(METRIC_OPTIONS)) {
                    let b = Object.keys(METRIC_OPTIONS)[a];
                    if (METRIC_OPTIONS[b].hasOwnProperty('api_metric')){
                        if (METRIC_OPTIONS[b].api_metric == results[y].data.timeseriesId){
                            n = METRIC_OPTIONS[b].metric;
                        }
                    }
                }
                let agr = results[y].data.dataResult.aggregationType ? results[y].data.dataResult.aggregationType.toLowerCase() : null;
                if (agr == 'avg'){
                    let tmp_total = 0, tmp_count = 0;
                    // get the avg value for the available datapoints
                    for (let z in results[y].data.dataResult.dataPoints[x]){
                        tmp_count++;
                        tmp_total += results[y].data.dataResult.dataPoints[x][z][1];
                    }
                    if (!data.hasOwnProperty(x)){
                        data[x] = {};
                    }
                    data[x][n] = tmp_total / tmp_count;
                } else {
                    if (!data.hasOwnProperty(x)){
                        data[x] = {};
                    }
                    data[x][n] = results[y].data.dataResult.dataPoints[x].slice(-1)[0][1];
                }
            }
        }
        process_csv(data, METRICS, FILE);
    });
}