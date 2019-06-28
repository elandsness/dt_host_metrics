// Object with one off functions for metrics that differ from the norm or require additional processing

module.exports = {
    totalMemory: (data) => {
        callback({'HOST-0A789740F58755B4': {'totalMemory': 1.99}})
    },
    memoryUsed: (data) => {
        console.log(data);
    },
    memoryUsedPercent: (data) => {
        console.log(data);
    }
}