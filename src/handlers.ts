import _ from 'lodash';
import { Request, Response } from 'express';

import Database from './db';
import Constants from './constants';
import { Parser, ResponseHandler } from './types';
import {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
} from './parsers';

export const handleRequest = async (req: Request, res: Response, db: Database, handler: ResponseHandler, parser?: Parser) => {
  let params: any[] = [];
  if (parser) {
    try {
      params = parser(req);
    } catch ({ message }) {
      return res.status(400).send({ message });
    }
  }

  try {
    await handler(params, res, db);
    if (!res.headersSent) res.sendStatus(204);
  } catch ({ message }) {
    return res.status(500).send({ message });
  }
};

export const registerStudent = async (params: any[], res: Response, db: Database) => {
  const [teacherEmail, studentEmails] = params;
  const teacher: any = await db.addTeacher(teacherEmail);
  const studentPromises = studentEmails.map((studentEmail: string) => db.addStudent(studentEmail));
  const students: any[] = await Promise.all(studentPromises);
  const registrationPromises = students.map((student) => db.addRegistration(student.id, teacher.id));
  await Promise.all(registrationPromises);
  res.sendStatus(204);
};

export const registerStudentHandler = async (req: Request, res: Response, db: Database) =>
  handleRequest(req, res, db, registerStudent, parseRegisterParams);

export const getCommonStudentsHandler = async (req: Request, res: Response, db: Database) => {
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
};

export const suspendStudentHandler = async (req: Request, res: Response, db: Database) => {
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
};

export const retrieveForNotificationsHandler = async (req: Request, res: Response, db: Database) => {
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
};
