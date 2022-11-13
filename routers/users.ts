import { Router } from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/users";
import loki from 'lokijs';

const router = Router();

function init(db: loki) {
  router.route('/users')
    .get((req, res, next) => {
      const users = getUsers(db);
      res.json(users);
    })
    .post((req, res, next) => {
      createUser(db, req.body);
      res.status(201).send();
    })
    .put((req, res, next) => {
      updateUser(db, req.body);
      res.status(204).send();
    })
    .delete((req, res, next) => {
      deleteUser(db, req.body);
      res.status(204).send();
    });
}

function getRouter() {
  return router;
}

export default {
  init,
  getRouter,
};
