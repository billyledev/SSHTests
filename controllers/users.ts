import loki from 'lokijs';
import type User from "../models/User";

function getUsers(db: loki): User[] {
  return db.getCollection('users').find();
}

function createUser(db: loki, user: User) {
  db.getCollection('users').insertOne(user);
  db.save();
}

function updateUser(db: loki, user: User) {
  const userData = db.getCollection('users').findOne({ username: user.username });
  db.getCollection('users').remove(userData);
  db.getCollection('users').insertOne(user);
  db.save();
}

function deleteUser(db: loki, user: User) {
  const userData = db.getCollection('user').findOne({ username: user.username });
  db.getCollection('user').remove(userData);
  db.save();
}

export {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
