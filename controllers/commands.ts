import loki from 'lokijs';
import type Command from "../models/Command";

function getCommands(db: loki): Command[] {
  return db.getCollection('commands').find();
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

function deleteCommand(db: loki, command: Command) {
  const commandData = db.getCollection('commands').findOne({ name: command.name });
  db.getCollection('commands').remove(commandData);
  db.save();
}

export {
  getCommands,
  createCommand,
  updateCommand,
  deleteCommand,
};
