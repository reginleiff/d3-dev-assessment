import _ from 'lodash';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import Database from './db';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
} from './parser';
import { handleRequest, registerStudent, getCommonStudents, suspendStudent, retrieveForNotifications } from './handler';

const app = express();

// support parsing of application/json type post data
app.use(bodyParser.json());

const router = express.Router();
const db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);

router.post('/register', (req: Request, res: Response) =>
  handleRequest(req, res, db, registerStudent, parseRegisterParams),
);
router.get('/commonstudents', (req: Request, res: Response) =>
  handleRequest(req, res, db, getCommonStudents, parseCommonStudentsParams),
);
router.post('/suspend', (req: Request, res: Response) =>
  handleRequest(req, res, db, suspendStudent, parseSuspendStudentParams),
);
router.post('/retrievefornotifications', (req: Request, res: Response) =>
  handleRequest(req, res, db, retrieveForNotifications, parseRetrieveForNotificationParams),
);

app.use('/api', router);

app.listen(3000);
