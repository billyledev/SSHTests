const { timingSafeEqual } = require('crypto');
const { readFileSync } = require('fs');
const { inspect } = require('util');
const pty = require('node-pty');

const { utils: { parseKey }, Server } = require('ssh2');

// Meant to be run on Docker using Linux images
const shell = 'bash';
// Force bashrc sourcing
const shellOpts = [
  '--rcfile',
  '.bashrc',
];
const allowedUser = Buffer.from('foo');
const allowedPassword = Buffer.from('bar');
const allowedPubKey = parseKey(readFileSync('foo.pub'));

function checkValue(input, allowed) {
  const autoReject = (input.length !== allowed.length);
  if (autoReject) {
    // Prevent leaking length information by always making a comparison with the
    // same input when lengths don't match what we expect ...
    allowed = input;
  }
  const isMatch = timingSafeEqual(input, allowed);
  return (!autoReject && isMatch);
}

new Server({
  hostKeys: [
    readFileSync('host.key'),
  ],
}, (client) => {
  console.log('Client connected!');

  client.on('authentication', (ctx) => {
    let allowed = true;
    if (!checkValue(Buffer.from(ctx.username), allowedUser)) {
      allowed = false;
    }

    switch (ctx.method) {
      case 'password':
        if (!checkValue(Buffer.from(ctx.password), allowedPassword)) {
          return ctx.reject();
        }
        break;
      case 'publickey':
        if (ctx.key.algo !== allowedPubKey.type
            || !checkValue(ctx.key.data, allowedPubKey.getPublicSSH())
            || (ctx.signature && allowedPubKey.verify(ctx.blob, ctx.signature) !== true)) {
          return ctx.reject();
        }
        break;
      default:
        return ctx.reject();
    }

    if (allowed) {
      ctx.accept();
    } else {
      ctx.reject();
    }
  }).on('ready', () => {
    console.log('Client authenticated!');

    client.on('session', (accept, reject) => {
      const session = accept();
      session.once('exec', (accept, reject, info) => {
        console.log(`Client wants to execute: ${inspect(info.command)}`);
        const stream = accept();
        stream.stderr.write('Oh no, the dreaded errors!\n');
        stream.write('Just kidding about the errors!\n');
        stream.exit(0);
        stream.end();
      });

      session.on('pty', (accept, reject, info) => {
        accept();
      });

      session.on('shell', (accept, reject) => {
        const stream = accept();

        const { env } = process;
        process.env.HOME = './home';

        const ptyProcess = pty.spawn(shell, shellOpts, {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: env.HOME,
          env,
        });

        ptyProcess.onData((data) => {
          stream.write(data);
        });

        ptyProcess.onExit((data) => {
          console.log(`Received exit signal with code: ${data.exitCode}`);
          stream.exit(0);
          stream.end();
        });

        stream.on('data', (data) => {
          ptyProcess.write(data);
        }).stderr.on('data', (data) => {
          console.log(`STDERR: ${data}`);
        }).on('exit', (code, signal) => {
          console.log(`Exited with code ${code} and signal: ${signal}`);
        });
      });
    });
  }).on('close', () => {
    console.log('Client disconnected');
  });
}).listen(8081, '127.0.0.1', function() {
  console.log(`Listening on port ${this.address().port}`);
});
