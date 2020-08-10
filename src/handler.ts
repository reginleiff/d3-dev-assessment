/**
 * Handlers are used to execute logic of handling a request with the required parameters obtained from a parser
 * (if necessary).
 * @param params array of parameters obtained from parser (args)
 * @param res response writer for writing status codes and data
 * @param db database instance to obtain information
 */
import _ from 'lodash';
import { Request, Response } from 'express';

import Database from './db';
import Constants from './constants';
import { Parser, ResponseHandler } from './types';

/**
 * handleRequest is the generic request handler wrapper to handle requests and responses appropriately.
 * @param req to pipe into parser for parameters
 * @param res to write status codes and data
 * @param db to obtain information
 * @param handler to handle request logic execution
 * @param parser to parse and validate request inputs
 */
export const handleRequest = async (
  req: Request,
  res: Response,
  db: Database,
  handler: ResponseHandler,
  parser?: Parser,
) => {
  let params: any[] = [];
  if (parser) {
    try {
      params = parser(req);
    } catch ({ message }) {
      return res.status(400).send({ message }); // bad request for failed parameter validation
    }
  }

  try {
    await handler(params, res, db);
    if (!res.headersSent) res.sendStatus(204); // default no content if missing reponse write
  } catch ({ message }) {
    return res.status(500).send({ message }); // internal error for failed logic execution
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

export const getCommonStudents = async (params: any[], res: Response, db: Database) => {
  const [teacherEmails]: string[] = params;
  let studentEmails: string[] = [];
  for (let teacherEmail of teacherEmails) {
    const respectiveStudentEmails = await db.getStudentEmails(teacherEmail);
    studentEmails = _.concat(studentEmails, respectiveStudentEmails);
  }
  res.status(200).send({ students: _.uniq(studentEmails) });
};

export const suspendStudent = async (params: any[], res: Response, db: Database) => {
  const [studentEmail] = params;
  const student = await db.suspendStudent(studentEmail);
  if (!student.is_suspended) {
    throw new Error(Constants.ERR_INTERNAL_ERROR);
  }
  res.sendStatus(204);
};

export const retrieveForNotifications = async (params: any[], res: Response, db: Database) => {
  const [teacherEmail, additionalEmails] = params;
  const unsuspendedStudentEmails = await db.getNotificationList(teacherEmail);
  const recipients = _.concat(unsuspendedStudentEmails, additionalEmails);
  res.status(200).send({ recipients });
};
