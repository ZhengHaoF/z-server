const fs = require('fs');
const child_process = require('child_process');



var workerProcess = child_process.spawn('node', ['app.js', 1]);

workerProcess.stdout.on('data', function(data) {
	console.log('stdout: ' + data);
});

workerProcess.stderr.on('data', function(data) {
	console.log('stderr: ' + data);
});

workerProcess.on('close', function(code) {

});

workerProcess.on('exit', function (code) {
    worker_process = child_process.fork("app.js", [1]);
});
