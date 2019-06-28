module.exports = function(data, METRICS, FILE){
    // For outputting data to file
    var fs = require('file-system');

    // Metric definitions
    const METRIC_OPTIONS = require('./metrics.js');
console.log(data);
    // create the csv
    let metric_titles = ['dt_host_id','hostname']
    METRICS.forEach(element => {
        metric_titles.push(METRIC_OPTIONS[element].metric);
    });
    let contents = [metric_titles.join(',')];
    for (var x in data){
        let line = [];
        metric_titles.forEach(element => {
            if (element == 'dt_host_id'){
                line.push(x);
            } else {
                line.push(data[x][element]);
            }
        })
        contents.push(line.join(','));
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
}