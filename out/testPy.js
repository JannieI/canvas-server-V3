//start.js - see https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/
var spawn = require('child_process').spawn,
    py    = spawn('python', ['testCompute_input.py']),
    data = [1,2,3,4,5,6,7,8,9],
    dataString = '';

py.stdout.on('data', function(data){
  dataString += data.toString();
});
py.stdout.on('end', function(){
  console.log('Sum 1 of numbers=', dataString);
});
py.stdin.write(JSON.stringify(data));
py.stdin.end();


var spawn = require('child_process').spawn,
    py    = spawn('python', ['testCompute_input.py']),
    data = [1,2,3,4,5,6,7,8,9,10],
    dataString2 = '';

py.stdout.on('data', function(data){
  dataString2 += data.toString();
});
py.stdout.on('end', function(){
  console.log('Sum 2 of numbers=', dataString2);
});
py.stdin.write(JSON.stringify(data));
py.stdin.end();

