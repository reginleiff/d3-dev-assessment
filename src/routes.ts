import { Router, Request, Response } from 'express';
import Database from './db';
import {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
} from './parser';
import { handleRequest, registerStudent, getCommonStudents, suspendStudent, retrieveForNotifications } from './handler';

export default (router: Router, db: Database) => {
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

  return router;
};
