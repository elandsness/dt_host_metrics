module.exports = function(KEY, TENANT, FILE, METRICS, time_m, data) {
    // HTTP client for making API calls
    const axios = require('axios');

    // Metric definitions
    const METRIC_OPTIONS = require('./metrics.js');

    // For outputting data to file
    const process_csv = require('./process_csv.js');

    // For all of the one off functions
    const functions = require('./functions.js');
    
    // For updating the data object after special function processing
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

    // keep checking on  the data until everything is there before spitting out the file
    const check_complete = async () => {
        let k = Object.keys(data).slice(-1)[0];
        let complete = false;
        let checkit  = setInterval(()=>{
            let num_metrics = Object.keys(data[k]).length - 1;
            let expected_metrics = METRICS.length;
            if (num_metrics < expected_metrics || complete == false){
                for (let x  in data[k]){
                    complete = data[k][x] == undefined ? false : true;
                }
            } else {
                clearInterval(checkit);
                process_csv(data, METRICS, FILE)
            }
        }, 250);
    }

    // prep  all of the api calls
    let urls = [];
    for (var x = 0; x < time_m.length; x++){
        if (METRIC_OPTIONS[time_m[x]].hasOwnProperty('function')){
            let tmp_m = METRIC_OPTIONS[time_m[x]].metric;
            functions[METRIC_OPTIONS[time_m[x]]['function']](TENANT, KEY,
                (result) => updateData(result,tmp_m));
        } else {
            let m = METRIC_OPTIONS[time_m[x]].api_metric;
            let agr = METRIC_OPTIONS[time_m[x]].method ? METRIC_OPTIONS[time_m[x]].method : 'avg';
            let endpoint = `${TENANT}/api/v1/timeseries/${m}?includeData=true&relativeTime=day&aggregationType=${agr}`;
            urls.push(endpoint);
        }
    }

    // perform all the api calls and update the csv
    axios.defaults.headers.common['Authorization'] = `Api-Token ${KEY}`;
    let promiseArray = urls.map(url => axios.get(url));
    axios.all(promiseArray)
    .then(async function(results) {
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
        check_complete();
    });
}