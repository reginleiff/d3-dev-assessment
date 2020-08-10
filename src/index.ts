import express, { Router } from 'express';
import bodyParser from 'body-parser';

import Database from './db';
import loadRoutes from './routes';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER, PORT } from '../config';

async function main() {
  try {
    const app = express();
    const router: Router = express.Router();
    const db: Database = new Database(DB_HOST, DB_USER, DB_NAME, DB_PASS);
    await db.verifyConnection();
    const routes = loadRoutes(router, db);

    // Support parsing of application/json type post data
    app.use(bodyParser.json());
    app.use('/api', routes);
    app.listen(PORT, () => console.log(`Started listening on port ${PORT}`));
  } catch (err) {
    throw err;
  }
}

(async () => {
  try {
    await main();
  } catch (err) {
    throw err;
  }
})().catch((err) => {
  console.error(err);
});
