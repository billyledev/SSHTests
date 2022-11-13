import loki from 'lokijs';
import type Settings from "../models/Settings";

function getSettings(db: loki): Settings {
  return db.getCollection('settings').findOne({});
}

function updateSettings(db: loki, settings: Settings): void {
  const settingsObj = db.getCollection('settings').findOne({});
  db.getCollection('settings').remove(settingsObj);
  db.getCollection('settings').insertOne(settings);
  db.save();
}

export {
  getSettings,
  updateSettings,
};
