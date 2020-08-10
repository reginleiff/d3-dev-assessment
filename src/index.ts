import _ from 'lodash';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import Database from './db';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import Constants from './constants';
import {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
} from './parsers';
import { handleRequest, registerStudent } from './handlers';

const app = express();

// support parsing of application/json type post data
app.use(bodyParser.json());

const router = express.Router();
const db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);

router.post('/register', (req: Request, res: Response) =>
  handleRequest(req, res, db, registerStudent, parseRegisterParams),
);

// router.post('/register', async function (req: Request, res: Response) {
//   let teacherEmail: string = '',
//     studentEmails: string[] = [];
//   try {
//     [teacherEmail, studentEmails] = parseRegisterParams(req);
//   } catch (err) {
//     console.error(err);
//     res.status(400).send(err.message);
//     return;
//   }

//   try {
//     const teacher: any = await db.addTeacher(teacherEmail);
//     const studentPromises = studentEmails.map((studentEmail: string) =>
//       db.addStudent(studentEmail)
//     );
//     const students: any[] = await Promise.all(studentPromises);
//     const registrationPromises = students.map((student) =>
//       db.addRegistration(student.id, teacher.id)
//     );
//     await Promise.all(registrationPromises);
//   } catch (err) {
//     res.status(500).send(err.message);
//   }

//   res.sendStatus(204);
// });

router.get('/commonstudents', async function (req, res) {
  let teacherEmails: string[] = [];
  try {
    [teacherEmails] = parseCommonStudentsParams(req);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }

  try {
    let studentEmails: string[] = [];
    for (let teacherEmail of teacherEmails) {
      const respectiveStudentEmails = await db.getStudentEmails(teacherEmail);
      studentEmails = _.concat(studentEmails, respectiveStudentEmails);
    }
    res.status(200).send({ students: _.uniq(studentEmails) });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/suspend', async function (req, res) {
  let studentEmail: string = '';
  try {
    [studentEmail] = parseSuspendStudentParams(req);
  } catch (err) {
    res.status(400).send(err.message);
  }

  try {
    const student = await db.suspendStudent(studentEmail);
    if (!student.is_suspended) {
      throw new Error(Constants.ERR_INTERNAL_ERROR);
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/retrieveForNotifications', async function (req, res) {
  let teacherEmail: string = '';
  let additionalEmails: string[] = [];
  try {
    [teacherEmail, additionalEmails] = parseRetrieveForNotificationParams(req);
  } catch (err) {
    res.status(400).send(err.message);
  }

  try {
    const unsuspendedStudentEmails = await db.getNotificationList(teacherEmail);
    const recipients = _.concat(unsuspendedStudentEmails, additionalEmails);
    res.status(200).send({ recipients });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.use('/api', router);

app.listen(3000);
