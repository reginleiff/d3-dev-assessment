import express, { Router } from 'express';
import bodyParser from 'body-parser';

import Database from './db';
import loadRoutes from './routes';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER, PORT } from '../config';

function main() {
  const app = express();
  const router: Router = express.Router();
  const db: Database = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);

  // Support parsing of application/json type post data
  app.use(bodyParser.json());
  app.use('/api', loadRoutes(router, db));
  app.listen(PORT, () => console.log(`Started listening on port ${PORT}`));
}

try {
  main();
} catch (err) {
  console.error(err);
}
