# dt_host_metrics
Simple cmd line tool that uses the Dynatrace API to gather host level metrics for all hosts monitored in a tenant. The metrics fetched are configurable when running the script and include the following:
1. consumedHostUnits = Number of host units consumed by host
2. osType = The type of OS running on the host
3. hostGroup = The host group a host is assigned to in Dynatrace
4. monitoringMode = The monitoring mode the host is set to in Dynatrace
5. cpuCores = Number of CPU cores
6. isMonitoringCandidate = Is the host a monitoring candidate (use with -c)
7. totalMemory = Total memory capacity of the host
8. memoryUsed = Average memory consumed over the last 24 hours
9. memoryUsedPercent = Average percentage of memory used over the last 24 hours
10. availability = Current state of the host
11. availabilityPercent = Host availability percent over last 24 hours
12. freeCPU = Average free available CPU over last 24 hours

## Requirements
- NPM
- NodeJS
- All dependencies in [package.json](package.json)

## Installation
The code can be compiled using [pkg](https://www.npmjs.com/package/pkg) or run using NodeJS.

### compiled
- Download the repo
- Install dependencies using `npm i`
- Install pkg globally using `npm i -g pkg`
- Compile using `pkg .` or `npm run build`
Platform specific executables will be placed in the root of the project directory

### non-compiled
- Download the repo
- Install dependencies using `npm i`

## Usage
Regardless of the installation method, the script takes in 3 required and 2 optional parameters
```
Required: -k (the API key for your Dynatrace environment that is used to fetch data)
Required: -t (the full url of your Dynatrace tenant)
Required: -m (comma separated list of metrics by number to include)
Optional: -f (path to the file you wish to export data to)
Optional: -c (flag to include monitoring candidates. leave off option to exclude)
```

### compiled
- MacOS: `hostmetrics-macos -k <key> -t <tenant> [-f <./path/to/file.csv>] -m 1,2,3,4,5,6,7,8,9,10,11,12 [-c]`
- Linux: `hostmetrics-linux -k <key> -t <tenant> [-f <./path/to/file.csv>] -m 1,2,3,4,5,6,7,8,9,10,11,12 [-c]`
- Windows: `hostmetrics-win.exe -k <key> -t <tenant> [-f <c:\path\to\file.csv>] -m 1,2,3,4,5,6,7,8,9,10,11,12 [-c]`

### non-compiled
`node bin.js -k <key> -t <tenant> [-f <./path/to/file.csv>] -m 1,2,3,4,5,6,7,8,9,10,11,12 [-c]`
