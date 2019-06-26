# dt_host_metrics
Simple cmd line tool that uses the Dynatrace API to gather memory utlization metrics for all hosts monitored in a tenant. The metrics fetched are AVG memory used in GB over the last day, AVG memory used in percent over the last day, and number of Dynatrace host units (licensing unit of measure) consumed by the host.

## Installation
The code can be compiled using [pkg](https://www.npmjs.com/package/pkg) or run using NodeJS.

### compiled
- Download the repo
- Install dependencies using `npm i`
- Install pkg globally using `npm i -g pkg`
- Compile using `pkg .`
Platform specific executables will be placed in the root of the project directory

### non-compiled
- Download the repo
- Install dependencies using `npm i`

## Usage
Regardless of the installation method, the script takes in 2 required and one optional parameter
```
Required: -k (the API key for your Dynatrace environment that is used to fetch data)
Required: -t (the full url of your Dynatrace tenant)
Optional: -f (path to the file you wish to export data to)
```

### compiled
- MacOS: `hostmetrics-macos -k <key> -t <tenant> [-f <./path/to/file.csv>]`
- Linux: `hostmetrics-linux -k <key> -t <tenant> [-f <./path/to/file.csv>]`
- Windows: `hostmetrics-win.exe -k <key> -t <tenant> [-f <c:\path\to\file.csv>]`

### non-compiled
`node bin.js -k <key> -t <tenant> [-f <./path/to/file.csv>]`
