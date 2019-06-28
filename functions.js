// Object with one off functions for metrics that differ from the norm or require additional processing

// HTTP client for making API calls
const axios = require('axios');

module.exports = {
    totalMemory: (TENANT, KEY, callback) => {
        let mem_used = {};
        let process_data =  async (results) => {
            let x = Object.keys(results[0].data.dataResult.entities)[0];
            mem_used[x] = {};
            for (let y in results){
                if (results[y].data.dataResult.timeseriesId == 'com.dynatrace.builtin:host.mem.used') {
                    mem_used[x].used_gb = (results[y].data.dataResult.dataPoints[x].slice(-1)[0][1] / 1024 / 1024 / 1024).toFixed(2);
                } else {
                    try {
                        mem_used[x].per_mem = results[y].data.dataResult.dataPoints[x].slice(-1)[0][1].toFixed(2);
                    } catch(e) {
                        await setTimeout(async () => {mem_used[x].per_mem = results[y].data.dataResult.dataPoints[x].slice(-1)[0][1].toFixed(2);}, 500);
                    }
                }
            }
        }
        let urls = [`${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.used?includeData=true&relativeTime=day&aggregationType=avg`,
                        `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=day&aggregationType=avg`],
            ret_data = {};
        // get memory used and percent free to calculate total memory
        axios.defaults.headers.common['Authorization'] = `Api-Token ${KEY}`;
        let promiseArray = urls.map(url => axios.get(url));
        axios.all(promiseArray)
        .then(async function(results) {
            process_data(results).then(async () => {
                for (let x in mem_used){
                    if (!ret_data.hasOwnProperty(x)){
                        ret_data[x] = {};
                    }
                    try{
                        ret_data[x]['totalMemory'] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);
                    } catch(e) {
                        setTimeout(async () => {ret_data[x]['totalMemory'] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);}, 500);
                    }
                }
                await callback(ret_data);
            });
        });
    },
    memoryUsed: (TENANT, KEY, callback) => {
        let endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.used?includeData=true&relativeTime=day&aggregationType=avg`;
        axios.get(endpoint, {
            headers: {
                'Authorization': `Api-Token ${KEY}`,
                'Content-Type': 'application/json'
            }
        }).then(async function (response) {
            // handle success
            let ret_data = {};
            for (var x in response.data.dataResult.dataPoints){
                ret_data[x] = {};
                let tmp_total = 0, tmp_count = 0;
                for (var y in response.data.dataResult.dataPoints[x]){
                    tmp_count++;
                    tmp_total += response.data.dataResult.dataPoints[x][y][1];
                }
                ret_data[x].memoryUsed =  (tmp_total / tmp_count / 1024 / 1024 / 1024).toFixed(2);
            }
            await callback(ret_data);
        }).catch(function (error) {
            // handle error
            console.log(error.message);
        })
    },
    memoryUsedPercent: (TENANT, KEY, callback) => {
        endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=day&aggregationType=avg`;
        axios.get(endpoint, {
            headers: {
                'Authorization': `Api-Token ${KEY}`,
                'Content-Type': 'application/json'
            }
        }).then(async function (response) {
            // handle success
            let ret_data = {};
            for (var x in response.data.dataResult.dataPoints){
                ret_data[x] = {};
                let tmp_total = 0, tmp_count = 0;
                for (var y in response.data.dataResult.dataPoints[x]){
                    tmp_count++;
                    tmp_total += response.data.dataResult.dataPoints[x][y][1];
                }
                ret_data[x].memoryUsedPercent = (100 - (tmp_total / tmp_count)).toFixed(2) + '%';
            }
            await callback(ret_data);
        }).catch(function (error) {
            // handle error
            console.log(error.message);
        })
    }
}