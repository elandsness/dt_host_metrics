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
                        console.log(results[y].data.dataResult.dataPoints[x].slice(-1)[0][1]);
                        mem_used[x].per_mem = results[y].data.dataResult.dataPoints[x].slice(-1)[0][1].toFixed(2);
                    } catch(e) {
                        await setTimeout(async () => {mem_used[x].per_mem = results[y].data.dataResult.dataPoints[x].slice(-1)[0][1].toFixed(2);}, 500);
                        console.log(results[y].data.dataResult.dataPoints[x].slice(-1)[0][1].toFixed(2));
                    }
                }
                console.log('totalMemory', mem_used);
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
                console.log('process_data enter:', ret_data);
                for (let x in mem_used){
                    if (!ret_data.hasOwnProperty(x)){
                        ret_data[x] = {};
                    }
                    try{
                        ret_data[x]['totalMemory'] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);
                    } catch(e) {
                        setTimeout(async () => {ret_data[x]['totalMemory'] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);}, 500);
                    }
                    console.log('process_data in:', ret_data);
                }
                await console.log('process_data exit:', ret_data);
                await callback(ret_data);
            });
        });







        /*
            for (var x in response.data.dataResult.dataPoints){
                let tmp_total = 0, tmp_count = 0;
                for (var y in response.data.dataResult.dataPoints[x]){
                    tmp_count++;
                    tmp_total += response.data.dataResult.dataPoints[x][y][1];
                }
                mem_used[x] = {}
                mem_used[x] = {
                        'used_gb': (tmp_total / tmp_count / 1024 / 1024 / 1024).toFixed(2)
                    };
            }
            // get % memory used
            endpoint = `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=day&aggregationType=avg`
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
                    mem_used[x] = {
                            'per_mem': (tmp_total / tmp_count).toFixed(2)
                        };
                }
                // loop throough and do the calculations
                for (let x in mem_used){
                    ret_data[x] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);
                }
                callback(ret_data);
            }).catch(function (error) {
                // handle error
                console.log(error.message);
            })
        }).catch(function (error) {
            // handle error
            console.log(error.message);
        })*/
    },
    memoryUsed: (data) => {
        console.log(data);
    },
    memoryUsedPercent: (data) => {
        console.log(data);
    }
}