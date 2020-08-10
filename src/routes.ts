import { Router, Request, Response } from 'express';
import Database from './db';
import {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
} from './parser';
import { handleRequest, registerStudents, getCommonStudents, suspendStudent, retrieveForNotifications } from './handler';

export default (router: Router, db: Database) => {
  if (!router) throw new Error('Router not initialised');
  if (!db) throw new Error('Database not initialised');

  router.post('/register', (req: Request, res: Response) =>
    handleRequest(req, res, db, registerStudents, parseRegisterParams),
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

  return router;
};
