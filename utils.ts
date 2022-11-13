import loki from 'lokijs';
import { defaultSettings } from './models/Settings';

function startDB() {
  return new Promise<loki>((resolve, reject) => {
    const initDB = () => {
      let settings = db.getCollection('settings');
      if (settings === null) {
        console.log('Creating settings collection...');
        settings = db.addCollection('settings');
        settings.insert(defaultSettings);
      }
    
      if (!db.getCollection('users')) {
        console.log('Creating users collection...');
        db.addCollection('users');
      }
    
      db.save();
      resolve(db);
    }

    const db = new loki('app.db', {
      autoload: true,
      autoloadCallback: initDB,
    });
  });
}

export {
  startDB,
};
