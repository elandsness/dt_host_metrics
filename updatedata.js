// For updating the data object after special function processing
module.exports = (result, metric, data) => {
    if (Object.keys(result).length == 1){
        data[Object.keys(result)[0]][metric] = result[Object.keys(result)[0]][metric];
    } else {
        for (let x in result){
            data[x][metric] = result[x][metric];
        }
    }
}