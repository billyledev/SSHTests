import express from 'express';

import loki from 'lokijs';
import { startDB } from './utils';

import settingsRouter from './routers/settings';
import usersRouter from './routers/users';
import commandsRouter from './routers/commands';

const APP_PORT = 8080;

startDB().then((db: loki) => {
  const app = express();
  app.use(express.json());
  settingsRouter.init(db);
  usersRouter.init(db);
  commandsRouter.init(db);
  app.use(
    settingsRouter.getRouter(),
    usersRouter.getRouter(),
    commandsRouter.getRouter(),
  );

  app.listen(APP_PORT, () => {
    console.log(`App listening on ${APP_PORT}!`);
  });  
});
