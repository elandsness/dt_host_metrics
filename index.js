// HTTP client for making API calls
const axios = require('axios');

// For converting JSON to CSV
const { parse } = require('json2csv');

// Handle command line args
var argv = require('yargs')
    .usage('Usage: $0 -k [api key] -t [tenant url]')
    .demandOption(['k','t'])
    .argv;

// Store api key and tenant url in constants for later use
const KEY = argv.k;
const TENANT = argv.t;

// Get the list of hosts and store them into an array of objects











// Create the CSV
const fields = ['field1', 'field2', 'field3'];
const opts = { fields };
 
try {
    const csv = parse(myData, opts);
    console.log(csv);
} catch (err) {
    console.error(err);
}