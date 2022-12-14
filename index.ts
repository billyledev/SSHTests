import { timingSafeEqual } from 'crypto';
import { readFileSync } from 'fs';
import { inspect } from 'util';
import { spawn } from 'node-pty';

import {
  utils,
  Server,
  ParsedKey,
} from 'ssh2';
import { AddressInfo } from 'net';

// Meant to be run on Docker using Linux images
const shell = 'bash';
// Force bashrc sourcing
const shellOpts = [
  '--rcfile',
  '.bashrc',
];
const allowedPassword = Buffer.from('bar');

interface ExitData {
  exitCode: number;
  signal?: number;
};

function loadAllowedUsers(): Buffer[] {
  const allowedUsers: Buffer[] = [];
  const usersList = JSON.parse(readFileSync('authorized/users.json', 'ascii'));
  usersList.forEach((user: string) => {
    allowedUsers.push(Buffer.from(user));
  });
  return allowedUsers;
}

function loadKey(path: string): ParsedKey {
  const key = utils.parseKey(readFileSync(path));
  if (key instanceof Error) {
    throw Error;
  }
  return key;
}

const allowedUsers = loadAllowedUsers();
const allowedPubKey = loadKey('authorized/keys/foo.pub');

function checkValue(input: Buffer, allowed: Buffer) {
  const autoReject = (input.length !== allowed.length);

  // Prevent leaking length information by always making a comparison with the
  // same input when lengths don't match what we expect ...
  const isMatch = autoReject ? timingSafeEqual(input, input) : timingSafeEqual(input, allowed);
  return (!autoReject && isMatch);
}

function checkUserAllowed(username: Buffer) {
  let match = false;

  allowedUsers.forEach((allowed) => {
    if (checkValue(username, allowed)) {
      match = true;
    }
  });

  return match;
}

new Server({
  hostKeys: [
    readFileSync('host.key'),
  ],
}, (client) => {
  console.log('Client connected!');

  client.on('authentication', (ctx) => {
    let allowed = true;
    if (!checkUserAllowed(Buffer.from(ctx.username))) {
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
            || (ctx.blob && ctx.signature && allowedPubKey.verify(ctx.blob, ctx.signature) !== true)) {
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

      // Executed when a command string is sent
      session.once('exec', (accept, reject, info) => {
        console.log(`Client wants to execute: ${inspect(info.command)}`);
        const stream = accept();
        stream.exit(0);
        stream.end();
      });

      // Executed when an allocation of a  pseudo-TTY is requested
      session.on('pty', (accept, reject, info) => {
        accept();
      });

      // Executed when an interactive shell is requested
      session.on('shell', (accept, reject) => {
        const stream = accept();

        const { env } = process;
        process.env.HOME = './home';

        const ptyProcess = spawn(shell, shellOpts, {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: env.HOME,
          env: (env as { [key: string]: string }),
        });

        ptyProcess.onData((data: string) => {
          stream.write(data);
        });

        ptyProcess.onExit((data) => {
          console.log(`Received exit signal with code: ${data.exitCode}`);
          stream.exit(0);
          stream.end();
        });

        stream.on('data', (data: string) => {
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
}).listen(8081, '127.0.0.1', function callback(this: Server) {
  console.log(`Listening on port ${(this.address() as AddressInfo).port}`);
});
