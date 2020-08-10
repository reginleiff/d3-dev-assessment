/**
 * Parsers are used to parse and validate input parameters to the request through params, query or body prior to
 * continuing the chain of execution with the respective handler.
 * @param req request object
 */

import _ from 'lodash';
import { Request } from 'express';
import { areValidEmails, isValidEmail, parseTaggedEmails } from './utility';
import Constants from './constants';

export const parseRegisterParams = (req: Request): any[] => {
  const studentEmails: string[] = req?.body?.students;
  const teacherEmail: string = req?.body?.teacher;
  if (_.isUndefined(teacherEmail)) throw new Error(Constants.ERR_TEACHER_EMAIL_NOT_PROVDED);
  if (!isValidEmail(teacherEmail)) throw new Error(Constants.ERR_TEACHER_EMAIL_INVALID);
  if (_.isUndefined(studentEmails) || studentEmails.length == 0)
    throw new Error(Constants.ERR_STUDENT_EMAILS_NOT_PROVDED);
  if (!areValidEmails(studentEmails)) throw new Error(Constants.ERR_STUDENT_EMAILS_INVALID);
  return [teacherEmail, studentEmails];
};

export const parseCommonStudentsParams = (req: Request): any[] => {
  // @ts-ignore: Incorrect types provided
  const query: string[] | string = req?.query?.teacher; // @ts-ignore:
  const teacherEmails: string[] = _.concat([], query);
  if (_.isUndefined(teacherEmails) || teacherEmails.length == 0)
    throw new Error(Constants.ERR_TEACHER_EMAILS_NOT_PROVDED);
  if (!areValidEmails(teacherEmails)) throw new Error(Constants.ERR_TEACHER_EMAILS_INVALID);
  return [teacherEmails];
};

export const parseSuspendStudentParams = (req: Request): any[] => {
  const studentEmail = req?.body?.student;
  if (_.isUndefined(studentEmail)) throw new Error(Constants.ERR_STUDENT_EMAIL_NOT_PROVDED);
  if (!isValidEmail(studentEmail)) throw new Error(Constants.ERR_STUDENT_EMAIL_INVALID);
  return [studentEmail];
};

export const parseRetrieveForNotificationParams = (req: Request): any[] => {
  const teacherEmail: string = req?.body?.teacher;
  const notification: string = req?.body?.notification;
  if (_.isUndefined(teacherEmail)) throw new Error(Constants.ERR_TEACHER_EMAILS_NOT_PROVDED);
  if (!isValidEmail(teacherEmail)) throw new Error(Constants.ERR_TEACHER_EMAIL_INVALID);
  if (_.isUndefined(notification)) throw new Error(Constants.ERR_NOTIFICATION_NOT_PROVDED);

  const additionEmails = parseTaggedEmails(notification);
  return [teacherEmail, additionEmails];
};

export default {
  parseCommonStudentsParams,
  parseRegisterParams,
  parseRetrieveForNotificationParams,
  parseSuspendStudentParams,
};