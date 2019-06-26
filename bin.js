const fetchdata = require('.')

// Handle command line args
var argv = require('yargs')
    .usage('Usage: $0 -k [api key] -t [tenant url] -f [output file]')
    .demandOption(['k','t'])
    .argv;

// Store api key, tenant url and file path in constants for later use
const KEY = argv.k;
const TENANT = argv.t[argv.t.length -1] == '/' ? argv.t.slice(0, -1) : argv.t; // strip trailing slash if there is one
const FILE = argv.f ? argv.f : './dt_data.csv';

fetchdata(KEY, TENANT, FILE);