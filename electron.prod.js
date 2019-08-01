const { spawn } = require('child_process');

process.env.ELECTRON_IS_DEV = 'false';
const proc = spawn('electron', ['.'], { shell: true });
proc.stdout.pipe(process.stdout);
proc.stderr.pipe(process.stderr);
