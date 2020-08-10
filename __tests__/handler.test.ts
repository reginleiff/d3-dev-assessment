import Database from '../src/db';
import Constants from '../src/constants';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import { createResponse, MockResponse } from 'node-mocks-http';
import { registerStudents, getCommonStudents, suspendStudent, retrieveForNotifications } from '../src/handler';

const SUITE_NAME = 'Handlers';
const TEACHER_EMAIL1 = 'teacherken@gmail.com';
const TEACHER_EMAIL2 = 'teacherben@gmail.com';
const STUDENT_EMAIL1 = 'studentjon@gmail.com';
const STUDENT_EMAIL2 = 'studenthon@gmail.com';
const STUDENT_EMAIL3 = 'studentkon@gmail.com';
const STUDENT_EMAIL4 = 'studentlon@gmail.com';

describe(SUITE_NAME, () => {
  let db: Database;
  let res: MockResponse<any>;

  beforeAll(() => (db = new Database(DB_HOST, DB_USER, DB_NAME, DB_PASS)));
  afterAll(() => db.close());

  describe('Register Student', () => {
    beforeEach(async () => (res = createResponse()));
    afterEach(async () => await db.reset());

    test('When provided teacher and students, should successfully register students and return 204', async () => {
      await registerStudents([TEACHER_EMAIL1, [STUDENT_EMAIL1, STUDENT_EMAIL2]], res, db);

      const teacher = await db.getTeacher(TEACHER_EMAIL1);
      expect(teacher).toMatchObject({
        id: expect.any(Number),
        email: TEACHER_EMAIL1,
      });

      const student1 = await db.getStudent(STUDENT_EMAIL1);
      expect(student1).toMatchObject({
        id: expect.any(Number),
        email: STUDENT_EMAIL1,
        is_suspended: 0,
      });

      const student2 = await db.getStudent(STUDENT_EMAIL2);
      expect(student2).toMatchObject({
        id: expect.any(Number),
        email: STUDENT_EMAIL2,
        is_suspended: 0,
      });

      const registration1 = await db.getRegistration(student1.id, teacher.id);
      expect(registration1).toMatchObject({
        student_id: student1.id,
        teacher_id: teacher.id,
      });

      const registration2 = await db.getRegistration(student2.id, teacher.id);
      expect(registration2).toMatchObject({
        student_id: student2.id,
        teacher_id: teacher.id,
      });

      expect(res._getStatusCode()).toBe(204);
    });
  });

  describe('Get Students', () => {
    beforeEach(() => (res = createResponse()));
    afterEach(async () => await db.reset());

    test('When provided teachers who have no registered students, should return empty array', async () => {
      await getCommonStudents([[TEACHER_EMAIL1]], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('students');
      const { students } = data;
      expect(students).toEqual(expect.any(Array));
      expect(students).toHaveLength(0);
    });

    test('When provided teachers with common students, return common students', async () => {
      await registerStudents([TEACHER_EMAIL1, [STUDENT_EMAIL1, STUDENT_EMAIL2, STUDENT_EMAIL4]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await registerStudents([TEACHER_EMAIL2, [STUDENT_EMAIL4, STUDENT_EMAIL1, STUDENT_EMAIL3]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await getCommonStudents([[TEACHER_EMAIL1, TEACHER_EMAIL2]], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('students');
      const { students } = data;
      expect(students).toEqual(expect.any(Array));
      expect(students).toHaveLength(2);
      expect(students).toContain(STUDENT_EMAIL1);
      expect(students).toContain(STUDENT_EMAIL4);
    });

    test('When provided teachers with no common students, return empty array', async () => {
      await registerStudents([TEACHER_EMAIL1, [STUDENT_EMAIL2]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await registerStudents([TEACHER_EMAIL2, [STUDENT_EMAIL3]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await getCommonStudents([[TEACHER_EMAIL1, TEACHER_EMAIL2]], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('students');
      const { students } = data;
      expect(students).toEqual(expect.any(Array));
      expect(students).toHaveLength(0);
    });
  });

  describe('Suspend Student', () => {
    beforeAll(() => (res = createResponse()));
    afterEach(async () => await db.reset());

    test('When provided existent student, should return 204 success with student suspended', async () => {
      await registerStudents([TEACHER_EMAIL1, [STUDENT_EMAIL1]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await suspendStudent([STUDENT_EMAIL1], res, db);
      expect(res._getStatusCode()).toBe(204);
      const student = await db.getStudent(STUDENT_EMAIL1);
      expect(student).toMatchObject({
        id: expect.any(Number),
        email: STUDENT_EMAIL1,
        is_suspended: 1,
      });
    });

    test('When provided non-existent student, should throw student does not exist error', async () => {
      await expect(suspendStudent([STUDENT_EMAIL2], res, db)).rejects.toThrowError(
        new Error(Constants.ERR_STUDENT_DOES_NOT_EXIST),
      );
    });
  });

  describe('Retrieve Student Notification List', () => {
    beforeEach(async () => (res = createResponse()));
    afterEach(async () => await db.reset());

    test('When provided teacher with no registered students and no tagged students, should successfully return 200 and recipients', async () => {
      await retrieveForNotifications([TEACHER_EMAIL1, []], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('recipients');
      const { recipients } = data;
      expect(recipients).toEqual(expect.any(Array));
      expect(recipients).toHaveLength(0);
    });

    test('When provided teacher with no registered students and tagged students, should successfully return 200 and recipients', async () => {
      await retrieveForNotifications([TEACHER_EMAIL1, [STUDENT_EMAIL3, STUDENT_EMAIL1]], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('recipients');
      const { recipients } = data;
      expect(recipients).toEqual(expect.any(Array));
      expect(recipients).toHaveLength(2);
      expect(recipients).toContain(STUDENT_EMAIL3);
      expect(recipients).toContain(STUDENT_EMAIL1);
    });

    test('When provided teacher with registered and no tagged students, should successfully return 200 and recipients', async () => {
      await registerStudents([TEACHER_EMAIL1, [STUDENT_EMAIL1, STUDENT_EMAIL2]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await retrieveForNotifications([TEACHER_EMAIL1, []], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('recipients');
      const { recipients } = data;
      expect(recipients).toEqual(expect.any(Array));
      expect(recipients).toHaveLength(2);
      expect(recipients).toContain(STUDENT_EMAIL1);
      expect(recipients).toContain(STUDENT_EMAIL2);
    });

    test('When provided teacher and tagged students, should successfully return 200 and recipients', async () => {
      await registerStudents([TEACHER_EMAIL1, [STUDENT_EMAIL1, STUDENT_EMAIL2]], res, db);
      expect(res._getStatusCode()).toBe(204);
      res = createResponse();
      await retrieveForNotifications([TEACHER_EMAIL1, [STUDENT_EMAIL3, STUDENT_EMAIL4]], res, db);
      expect(res._getStatusCode()).toBe(200);
      const data = res._getData();
      expect(data).toHaveProperty('recipients');
      const { recipients } = data;
      expect(recipients).toEqual(expect.any(Array));
      expect(recipients).toHaveLength(4);
      expect(recipients).toContain(STUDENT_EMAIL1);
      expect(recipients).toContain(STUDENT_EMAIL2);
      expect(recipients).toContain(STUDENT_EMAIL3);
      expect(recipients).toContain(STUDENT_EMAIL4);
    });
  });
});
