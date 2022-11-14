import fs from 'fs';
import path from 'path';
import loki from 'lokijs';
import type Command from "../models/Command";

function getCommandName(filename: string) {
  return filename.slice(0, filename.lastIndexOf('.'));
}

function getCommands(): Command[] {
  const cmdList: Command[] = [];
  const files = fs.readdirSync('commands');
  files.forEach(file => {
    if (file.includes('js')) {
      cmdList.push({
        name: getCommandName(file),
        content: fs.readFileSync(path.join('commands', file), 'utf-8'),
      });
    }
  });
  return cmdList;
}

function createCommand(db: loki, command: Command) {
  db.getCollection('commands').insertOne(command);
  db.save();
}

function updateCommand(db: loki, command: Command) {
  const commandData = db.getCollection('commands').findOne({ name: command.name });
  db.getCollection('commands').remove(commandData);
  db.getCollection('commands').insertOne(command);
  db.save();
}

function deleteCommand(commandName: string) {
  const cmd = commandName.toLowerCase();
  fs.rmSync(path.join('commands', `${cmd}.js`));
}

export {
  getCommands,
  createCommand,
  updateCommand,
  deleteCommand,
};
