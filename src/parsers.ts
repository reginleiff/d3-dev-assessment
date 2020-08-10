/**
 * Parsers are used to validate input parameters to the request through params, query and body prior before
 * continuing the chain of execution through a handler.
 * @param req request object
 */

import _ from 'lodash';
import { Request } from 'express';
import { areValidEmails, isValidEmail, parseTaggedEmails } from './utility';

export const parseRegisterParams = (req: Request): any[] => {
  const studentEmails: string[] = req?.body?.students;
  const teacherEmail: string = req?.body?.teacher;
  if (!teacherEmail) throw new Error('Teacher email not provided');
  if (!studentEmails || studentEmails.length == 0) throw new Error('Student email(s) not provided');
  if (!isValidEmail(teacherEmail)) throw new Error('Invalid email format for teacher');
  if (!areValidEmails(studentEmails)) throw new Error('Invalid email(s) format for students');
  return [teacherEmail, studentEmails];
};

export const parseCommonStudentsParams = (req: Request): any[] => {
  // @ts-ignore: Incorrect types provided
  const query: string[] | string = req?.query?.teacher; // @ts-ignore:
  const teacherEmails: string[] = _.concat([], query);
  if (!teacherEmails || teacherEmails.length == 0) throw new Error('Teacher email(s) not provided');
  if (!areValidEmails(teacherEmails)) throw new Error('Invalid email(s) format for teachers');
  return [teacherEmails];
};

export const parseSuspendStudentParams = (req: Request): any[] => {
  const studentEmail = req?.body?.student;
  if (!studentEmail) throw new Error('Student email not provided');
  if (!isValidEmail(studentEmail)) throw new Error('Invalid email format for student');
  return [studentEmail];
};

export const parseRetrieveForNotificationParams = (req: Request): any[] => {
  const teacherEmail: string = req?.body?.teacher;
  const notification: string = req?.body?.notification;
  if (!teacherEmail) throw new Error('Teacher email not provided');
  if (!isValidEmail(teacherEmail)) throw new Error('Invalid email format for teacher');

  const additionEmails = parseTaggedEmails(notification);
  return [teacherEmail, additionEmails];
};

export default {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
};
