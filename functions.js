// Object with one off functions for metrics that differ from the norm or require additional processing

// HTTP client for making API calls
const axios = require('axios');

module.exports = {
    totalMemory: (TENANT, KEY, callback) => {
        let ret_data = {}, mem_used = {}, r = {};

        const process_data = (callback) => {
            for (let x in mem_used){
                if (!ret_data.hasOwnProperty(x)){
                    ret_data[x] = {};
                }
                ret_data[x]['totalMemory'] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);
            }
            callback(ret_data);
        }

        const fetch_data = (callback) => {
            for (let y in r){
                let keys = Object.keys(r[y].data.dataResult.entities);
                for (let x in keys){
                    if (!mem_used.hasOwnProperty(keys[x])){
                        mem_used[keys[x]] = {};
                    }
                    if (r[y].data.dataResult.timeseriesId == 'com.dynatrace.builtin:host.mem.used') {
                        mem_used[keys[x]].used_gb = (r[y].data.dataResult.dataPoints[keys[x]].slice(-1)[0][1].toFixed(2) / 1024 / 1024 / 1024).toFixed(2);
                    } else {
                        mem_used[keys[x]].per_mem = r[y].data.dataResult.dataPoints[keys[x]].slice(-1)[0][1].toFixed(2);
                    }
                }
            }
            callback(null);
        }

        let urls = [`${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.used?includeData=true&relativeTime=day&aggregationType=avg`,
                        `${TENANT}/api/v1/timeseries/com.dynatrace.builtin:host.mem.availablepercentage?includeData=true&relativeTime=day&aggregationType=avg`];
        // get memory used and percent free to calculate total memory
        axios.defaults.headers.common['Authorization'] = `Api-Token ${KEY}`;
        let promiseArray = urls.map(url => axios.get(url));
        axios.all(promiseArray)
        .then(async (results) => {
            r = results;
            for (let y in r){
                let keys = Object.keys(r[y].data.dataResult.entities);
                for (let x in keys){
                    if (!mem_used.hasOwnProperty(keys[x])){
                        mem_used[keys[x]] = {};
                    }
                    if (r[y].data.dataResult.timeseriesId == 'com.dynatrace.builtin:host.mem.used') {
                        try {
                            mem_used[keys[x]].used_gb = (r[y].data.dataResult.dataPoints[keys[x]].slice(-1)[0][1].toFixed(2) / 1024 / 1024 / 1024).toFixed(2);
                        } catch(e) {
                            if (r[y].data.dataResult.dataPoints[keys[x]].slice(-1)[0][1] == null){
                                console.log(`Couldn't fetch mem_used of ${keys[x]}`)
                            }
                        }
                    } else {
                        try {
                            mem_used[keys[x]].per_mem = r[y].data.dataResult.dataPoints[keys[x]].slice(-1)[0][1].toFixed(2);
                        } catch(e) {
                            if (r[y].data.dataResult.dataPoints[keys[x]].slice(-1)[0][1] == null){
                                console.log(`Couldn't fetch percent_mem_used of ${keys[x]}`)
                            }
                        }
                    }
                }
            }
            for (let x in mem_used){
                if (!ret_data.hasOwnProperty(x)){
                    ret_data[x] = {};
                }
                ret_data[x]['totalMemory'] = Math.ceil(mem_used[x].used_gb * 100 / mem_used[x].per_mem);
            }
            callback(ret_data);
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
    },
    softwareTechnologies: (TENANT, KEY, HOST, callback) =>  {
        endpoint = `${TENANT}/api/v1/entity/infrastructure/processes?host=${HOST}`;
        axios.get(endpoint, {
            headers: {
                'Authorization': `Api-Token ${KEY}`,
                'Content-Type': 'application/json'
            }
        }).then(async function (response) {
            // handle success
            let ret_data = {};
            ret_data[HOST] = {};
            ret_data[HOST].softwareTechnologies = {};
            for (var x in response.data){
                if (response.data[x].hasOwnProperty('softwareTechnologies')){
                    for (var y in response.data[x].softwareTechnologies){
                        if (ret_data[HOST].softwareTechnologies.hasOwnProperty(response.data[x].softwareTechnologies[y].type)){
                            ret_data[HOST].softwareTechnologies[response.data[x].softwareTechnologies[y].type] += 1;
                        }  else {
                            ret_data[HOST].softwareTechnologies[response.data[x].softwareTechnologies[y].type] = 1;
                        }
                    }
                }
            }
            ret_data[HOST].softwareTechnologies = JSON.stringify(ret_data[HOST].softwareTechnologies).replace('{','').replace('}','');
            await callback(ret_data);
        }).catch(function (error) {
            // handle error
            console.log(error);
        })
    }
}