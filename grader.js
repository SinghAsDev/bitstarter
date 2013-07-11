#!/usr/bin/env node

var program = require('commander');
var cheerio = require('cheerio');
var fs = require('fs');
var CHECKSFILE_DEFAULT = "checks.json";
var HTMLFILE_DEFAULT = "index.html";

var clone = function(fn){
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var assertFileExists = function(file){
    var fileStr = file.toString();
    if(!fs.existsSync(fileStr)){
        console.log('%s does not exists.\nExiting.');
        process.exit(1);
    }

    return fileStr;
};

var loadChecks = function(checksFile){
   return JSON.parse(fs.readFileSync(checksFile)); 
};

var cheerioHtmlFile = function(htmlFile){
    return cheerio.load(fs.readFileSync(htmlFile));
};

var checkHtmlFile = function(htmlFile, checksFile){
    $ = cheerioHtmlFile(htmlFile);
    var checks = loadChecks(checksFile).sort();
    var out = {};

    for(var ii in checks){
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) //Called from bash
{
    program
        .option('-c, --checks <check_file>', 'Path to checks.json',                 clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html',
                clone(assertFileExists), HTMLFILE_DEFAULT)
        .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);

    console.log(outJson);
}
else //Called as a module
{
    exports.checkHtmlFile = checkHtmlFile;
}
