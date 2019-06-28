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