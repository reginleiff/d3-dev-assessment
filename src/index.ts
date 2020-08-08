import _ from 'lodash';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import Database from './db';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import Constants from './constants';

const app = express();

// support parsing of application/json type post data
app.use(bodyParser.json());

const router = express.Router();
const db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME);

const isValidEmail = (email: string) => {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length == 0) return false;
  const lower = trimmed.toLowerCase();
  const emailRegex = /\b[a-z0-9._%+-]{3,255}@[a-z0-9.-]+.[a-z]{2,}\b/;
  return emailRegex.test(lower);
};

const areValidEmails = (emails: string[]) =>
  emails.reduce((valid, email) => (valid ? isValidEmail(email) : valid), true);

const parseRegisterParams = (req: Request): any[] => {
  const studentEmails: string[] = req?.body?.students;
  const teacherEmail: string = req?.body?.teacher;
  if (!teacherEmail) throw new Error('Teacher email not provided');
  if (!studentEmails || studentEmails.length == 0)
    throw new Error('Student email(s) not provided');
  if (!isValidEmail(teacherEmail))
    throw new Error('Invalid email format for teacher');
  if (!areValidEmails(studentEmails))
    throw new Error('Invalid email(s) format for students');
  return [teacherEmail, studentEmails];
};

const parseCommonStudentsParams = (req: Request): any[] => {
  // @ts-ignore: Incorrect types provided
  const query: string[] | string = req?.query?.teacher; // @ts-ignore: 
  const teacherEmails: string[] = _.concat([], query);
  console.log(teacherEmails);
  if (!teacherEmails || teacherEmails.length == 0)
    throw new Error('Teacher email(s) not provided');
  if (!areValidEmails(teacherEmails))
    throw new Error('Invalid email(s) format for teachers');
  return [teacherEmails];
};

const parseSuspendStudentParams = (req: Request): any[] => {
  const studentEmail = req?.body?.student;
  if (!studentEmail)
    throw new Error('Student email not provided');
  if (!isValidEmail(studentEmail))
    throw new Error('Invalid email format for student');
  return [studentEmail];
};

router.post('/register', async function (req: Request, res: Response) {
  let teacherEmail: string = '',
    studentEmails: string[] = [];
  try {
    [teacherEmail, studentEmails] = parseRegisterParams(req);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
    return;
  }

  try {
    const teacher: any = await db.addTeacher(teacherEmail);
    const studentPromises = studentEmails.map((studentEmail: string) =>
      db.addStudent(studentEmail)
    );
    const students: any[] = await Promise.all(studentPromises);
    const registrationPromises = students.map((student) =>
      db.addRegistration(student.id, teacher.id)
    );
    await Promise.all(registrationPromises);
  } catch (err) {
    res.status(500).send(err.message);
  }

  res.sendStatus(204);
});

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
    console.log(teacherEmails);
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
    if(!student.is_suspended) {
      throw new Error(Constants.ERR_INTERNAL_ERROR);
    }
    res.sendStatus(204);
  } catch(err) {
    res.status(500).send(err.message);
  }
});

router.post('/retrieveForNotifications', function (req, res) {
  const { body } = req;
  console.log({ body });
  res.send(204);
});

app.use('/api', router);

app.listen(3000);
