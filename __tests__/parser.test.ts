import { createRequest } from 'node-mocks-http';
import { parseRegisterParams, parseCommonStudentsParams } from '../src/parser';
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
      expect(teacherEmails.length).toBe(1);
      expect(teacherEmails).toContain('teacherken@gmail.com');
    });

    test('When provided multiple teacher param, should successfully validate and return args', () => {
      req = createRequest({
        query: {
          teacher: ['teacherken@gmail.com', 'teacherben@gmail.com'],
        },
      });
      const [teacherEmails] = parseCommonStudentsParams(req);
      expect(teacherEmails.length).toBe(2);
      expect(teacherEmails).toContain('teacherken@gmail.com');
      expect(teacherEmails).toContain('teacherben@gmail.com');
    });
  });

  describe('Suspend Student', () => {});

  describe('Retrieve Student Notification List', () => {});
});
