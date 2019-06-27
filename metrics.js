module.exports = {
    0: {
        'type': 'host',
        'metric': 'consumedHostUnits',
        'desc': 'Number of host units consumed by host'
    },
    1: {
        'type': 'host',
        'metric': 'osType',
        'desc': 'The type of OS running on the host'
    },
    2: {
        'type': 'host',
        'metric': 'hostGroup',
        'desc': 'The host group a host is assigned to in Dynatrace'
    },
    3: {
        'type': 'host',
        'metric': 'monitoringMode',
        'desc': 'The monitoring mode the host is set to in Dynatrace'
    },
    4: {
        'type': 'host',
        'metric': 'cpuCores',
        'desc': 'Number of CPU cores'
    },
    5: {
        'type': 'time',
        'metric': 'totalMemory',
        'function': 'totalMemory',
        'method': 'avg',
        'desc': 'Total memory capacity of the host'
    },
    6: {
        'type': 'time',
        'metric': 'memoryUsed',
        'function': 'memoryUsed',
        'desc': 'Average memory consumed over the last 24 hours'
    },
    7: {
        'type': 'time',
        'metric': 'memoryUsedPercent',
        'function': 'memoryUsedPercent',
        'desc': 'Average percentage of memory used over the last 24 hours'
    },
    8: {
        'type': 'time',
        'metric': 'availability',
        'api_metric': 'com.dynatrace.builtin:host.availability',
        'method': 'last',
        'desc': 'Current state of the host'
    },
    9: {
        'type': 'time',
        'metric': 'availabilityPercent',
        'api_metric': 'com.dynatrace.builtin:host.availability.percent',
        'method': 'avg',
        'desc': 'Host availability percent over last 24 hours'
    },
    10: {
        'type': 'time',
        'metric': 'freeCPU',
        'api_metric': 'com.dynatrace.builtin:host.cpu.idle',
        'method': 'avg',
        'desc': 'Average free available CPU over last 24 hours'
    }
}