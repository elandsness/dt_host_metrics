const fetchdata = require('./index.js')

const METRIC_OPTIONS = require('./metrics.js');

let epilog = ['Available Metrics:'];
for (var x in METRIC_OPTIONS){
    epilog.push(`${x}: ${METRIC_OPTIONS[x].metric} = ${METRIC_OPTIONS[x].desc}`);
}

// Handle command line args
var argv = require('yargs')
    .usage('Usage: $0 -k [api key] -t [tenant url] -f [output file] -m [select metrics 0,1,2,3,4,5,6,etc] -c')
    .boolean('c')
    .describe('k','Dynatrace API Key')
    .describe('t', "Dynatrace tenant url: \n" +
        "Managed: https://{your-domain}/e/{your-environment-id}/ \n" +
        "SaaS: https://{your-environment-id}.live.dynatrace.com/")
    .describe('f', 'Path to write data to. Defaults to ./dt_data.csv')
    .describe('m','Desired metrics (see below)')
    .describe('c','Include monitoring candidates?')
    .demandOption(['k','t','m'])
    .epilog(epilog.join("\n"))
    .argv;

// Store api key, tenant url and file path in constants for later use
const KEY = argv.k;
const TENANT = argv.t[argv.t.length -1] == '/' ? argv.t.slice(0, -1) : argv.t; // strip trailing slash if there is one
const FILE = argv.f ? argv.f : 'dt_data.csv';
const METRICS = argv.m.toString().indexOf(',') < 0 ? [argv.m] : argv.m.split(',');
const CANDIDATES = argv.c;

let fail = false;
METRICS.forEach(element => {
    if(parseInt(element) < 1 || parseInt(element) > Object.keys(METRIC_OPTIONS).length){
        fail = true;
    }
  });
if (fail){
    console.log('Invalid metric selection! Please enter numbers between 1 and ' + Object.keys(METRIC_OPTIONS).length);
    console.log('To see a list of available metrics, run this script again with the --help option added.');
} else {
    fetchdata(KEY, TENANT, FILE, METRICS, CANDIDATES);
}
