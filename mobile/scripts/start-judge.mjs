import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const mobileDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const npmCli = process.env.npm_execpath;

function npmInvocation(args) {
  if (npmCli) {
    return {
      command: process.execPath,
      args: [npmCli, ...args],
      options: { cwd: mobileDirectory, stdio: 'inherit' },
    };
  }

  return {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args,
    options: {
      cwd: mobileDirectory,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  };
}

if (!existsSync(path.join(mobileDirectory, 'node_modules', 'expo', 'package.json'))) {
  console.log('Installing the locked PorsiPas dependencies...');
  const install = npmInvocation(['ci']);
  const result = spawnSync(install.command, install.args, install.options);

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('Starting the PorsiPas Expo tunnel...');
const start = npmInvocation(['run', 'start:tunnel', '--', '--clear']);
const child = spawn(start.command, start.args, start.options);

child.on('error', (error) => {
  console.error(`Unable to start Expo: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
