import { createRequest } from 'node-mocks-http';
import {
  parseRegisterParams,
  parseCommonStudentsParams,
  parseSuspendStudentParams,
  parseRetrieveForNotificationParams,
} from '../src/parser';
import Constants from '../src/constants';

const SUITE_NAME = 'Handlers';

describe(SUITE_NAME, () => {
  let req: any;

  describe('Retrieve Student', () => {
    test('When not provided teacher param, should throw teacher email not provided error', () => {
      req = createRequest({
        body: {
          students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
        },
      });
      expect(() => parseRegisterParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAIL_NOT_PROVDED));
    });

    test('When provided invalid teacher email, should throw teacher email invalid error', () => {
      req = createRequest({
        body: {
          teacher: '',
          students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
        },
      });
      expect(() => parseRegisterParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAIL_INVALID));
    });

    test('When provided incorrect teacher input format, should throw invalid input format error', () => {
      req = createRequest({
        body: {
          teacher: ['teacherken@gmail.com', 'teacherben@gmail.com'],
          students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
        },
      });
      expect(() => parseRegisterParams(req)).toThrow(new Error(Constants.ERR_INCORRECT_INPUT_FORMAT));
    });

    test('When not provided any student parameter, should throw student emails not provided error', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
        },
      });
      expect(() => parseRegisterParams(req)).toThrow(new Error(Constants.ERR_STUDENT_EMAILS_NOT_PROVDED));
    });

    test('When provided an invalid student param, should throw student emails invalid error', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          students: ['studentjon@gmail.com', ''],
        },
      });
      expect(() => parseRegisterParams(req)).toThrow(new Error(Constants.ERR_STUDENT_EMAILS_INVALID));
    });

    test('When provided incorrect student input format, should throw invalid input format error', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          students: 'studentjon@gmail.com',
        },
      });
      expect(() => parseRegisterParams(req)).toThrow(new Error(Constants.ERR_INCORRECT_INPUT_FORMAT));
    });

    test('When provided 1 valid teacher and 3 valid student, should successfully validate and return args', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          students: ['studentjon@gmail.com', 'studenthon@gmail.com', 'studentkon@gmail.com'],
        },
      });
      const [teacherEmail, studentEmails] = parseRegisterParams(req);
      expect(teacherEmail).toEqual('teacherken@gmail.com');
      expect(studentEmails.length).toBe(3);
      expect(studentEmails).toContain('studentjon@gmail.com');
      expect(studentEmails).toContain('studenthon@gmail.com');
      expect(studentEmails).toContain('studentkon@gmail.com');
    });

    test('When provided duplicate students, should successfully filter and return args', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          students: ['studentjon@gmail.com', 'studentkon@gmail.com', 'studentjon@gmail.com', 'studentkon@gmail.com'],
        },
      });
      const [teacherEmail, studentEmails] = parseRegisterParams(req);
      expect(teacherEmail).toEqual('teacherken@gmail.com');
      expect(studentEmails.length).toBe(2);
      expect(studentEmails).toContain('studentjon@gmail.com');
      expect(studentEmails).toContain('studentkon@gmail.com');
    });
  });

  describe('Get Common Students', () => {
    test('When not provided teacher param, should throw teacher email not provided error', () => {
      req = createRequest({});
      expect(() => parseCommonStudentsParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAILS_NOT_PROVDED));
    });

    test('When provided invalid teacher param, should throw teacher email invalid error', () => {
      req = createRequest({
        query: {
          teacher: 'a',
        },
      });
      expect(() => parseCommonStudentsParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAILS_INVALID));
    });

    test('When provided single invalid teacher param, should throw teacher email invalid error', () => {
      req = createRequest({
        query: {
          teacher: ['teacherken@gmail.com', 'a'],
        },
      });
      expect(() => parseCommonStudentsParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAILS_INVALID));
    });

    test('When provided single teacher param, should successfully validate and return args', () => {
      req = createRequest({
        query: {
          teacher: 'teacherken@gmail.com',
        },
      });
      const [teacherEmails] = parseCommonStudentsParams(req);
      expect(teacherEmails).toHaveLength(1);
      expect(teacherEmails).toContain('teacherken@gmail.com');
    });

    test('When provided multiple teacher param, should successfully validate and return args', () => {
      req = createRequest({
        query: {
          teacher: ['teacherken@gmail.com', 'teacherben@gmail.com'],
        },
      });
      const [teacherEmails] = parseCommonStudentsParams(req);
      expect(teacherEmails).toHaveLength(2);
      expect(teacherEmails).toContain('teacherken@gmail.com');
      expect(teacherEmails).toContain('teacherben@gmail.com');
    });
  });

  describe('Suspend Student', () => {
    test('When not provided student param, should throw student email not provided error', () => {
      req = createRequest({});
      expect(() => parseSuspendStudentParams(req)).toThrow(new Error(Constants.ERR_STUDENT_EMAIL_NOT_PROVDED));
    });

    test('When provided invalid student param, should throw student email invalid error', () => {
      req = createRequest({
        body: {
          student: 'a',
        },
      });
      expect(() => parseSuspendStudentParams(req)).toThrow(new Error(Constants.ERR_STUDENT_EMAIL_INVALID));
    });

    test('When provided invalid student param format, should throw invalid input format error', () => {
      req = createRequest({
        body: {
          student: ['studentjon@gmail.com', 'studenthon@gmail.com'],
        },
      });
      expect(() => parseSuspendStudentParams(req)).toThrow(new Error(Constants.ERR_INCORRECT_INPUT_FORMAT));
    });

    test('When provided single student param, should successfully validate and return args', () => {
      req = createRequest({
        body: {
          student: 'studentjon@gmail.com',
        },
      });
      const [studentEmail] = parseSuspendStudentParams(req);
      expect(studentEmail).toBe('studentjon@gmail.com');
    });
  });

  describe('Retrieve Student Notification List', () => {
    test('When not provided teacher param, should throw teacher email not provided error', () => {
      req = createRequest({
        body: {
          notification: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
        },
      });
      expect(() => parseRetrieveForNotificationParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAIL_NOT_PROVDED));
    });

    test('When provided invalid teacher email, should throw teacher email invalid error', () => {
      req = createRequest({
        body: {
          teacher: 'a',
          notification: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
        },
      });
      expect(() => parseRetrieveForNotificationParams(req)).toThrow(new Error(Constants.ERR_TEACHER_EMAIL_INVALID));
    });

    test('When provided incorrect teacher input format, should throw invalid input format error', () => {
      req = createRequest({
        body: {
          teacher: ['teacherken@gmail.com', 'teacherben@gmail.com'],
          notification: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
        },
      });
      expect(() => parseRetrieveForNotificationParams(req)).toThrow(new Error(Constants.ERR_INCORRECT_INPUT_FORMAT));
    });

    test('When not provided any notification parameter, should throw student emails not provided error', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
        },
      });
      expect(() => parseRetrieveForNotificationParams(req)).toThrow(new Error(Constants.ERR_NOTIFICATION_NOT_PROVDED));
    });

    test('When provided invalid notification param, should throw student emails invalid error', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          notification: ['Hello students! @studentagnes@gmail.com @studentmiche@gmail.com'],
        },
      });
      expect(() => parseRetrieveForNotificationParams(req)).toThrow(new Error(Constants.ERR_INCORRECT_INPUT_FORMAT));
    });

    test('When provided valid teacher and notification with 2 tags, should successfully validate and parse args', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          notification: 'Hello students! @studentagnes@gmail.com @studentmiche@gmail.com',
        },
      });
      const [teacherEmail, additionalEmails] = parseRetrieveForNotificationParams(req);
      expect(teacherEmail).toBe('teacherken@gmail.com');
      expect(additionalEmails).toHaveLength(2);
      expect(additionalEmails).toContain('studentagnes@gmail.com');
      expect(additionalEmails).toContain('studentmiche@gmail.com');
    });

    test('When provided valid teacher and notification with 0 tags, should successfully validate and parse args', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          notification: 'Hello students!',
        },
      });
      const [teacherEmail, additionalEmails] = parseRetrieveForNotificationParams(req);
      expect(teacherEmail).toBe('teacherken@gmail.com');
      expect(additionalEmails).toHaveLength(0);
    });

    test('When provided duplicated tags, should successfully filter and parse args', () => {
      req = createRequest({
        body: {
          teacher: 'teacherken@gmail.com',
          notification: 'Hello students! @studentagnes@gmail.com @studentagnes@gmail.com',
        },
      });
      const [teacherEmail, additionalEmails] = parseRetrieveForNotificationParams(req);
      expect(teacherEmail).toBe('teacherken@gmail.com');
      expect(additionalEmails).toHaveLength(1);
      expect(additionalEmails).toContain('studentagnes@gmail.com');
    });
  });
});
