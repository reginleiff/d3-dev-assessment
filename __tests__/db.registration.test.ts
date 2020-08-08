import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import Database from '../src/db';
import Constants from '../src/constants';

describe('Database - Registration', () => {
  let db: Database;
  const validEmail1 = 'abc@gmail.com';
  const validEmail2 = 'defgh@gmail.com';

  beforeAll(() => (db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME)));

  afterAll(() => db.close());

  describe('Add Registration', () => {
    beforeEach(async () => {
      await db.reset();
    });

    afterEach(async () => {
      await db.reset();
    });

    test('When adding registration, should return registration object', async () => {
      const { id: studentID } = await db.addStudent(validEmail1);
      const { id: teacherID } = await db.addTeacher(validEmail2);
      expect(await db.addRegistration(studentID, teacherID)).toMatchObject({
        student_id: studentID,
        teacher_id: teacherID,
      });
    });

    test('When adding registration with the same student and teacher IDs, does not result in duplicate entries', async () => {
      const { id: studentID } = await db.addStudent(validEmail1);
      const { id: teacherID } = await db.addTeacher(validEmail2);
      expect(await db.addRegistration(studentID, teacherID)).toBeTruthy();
      expect(await db.getRegistrationCount(studentID, teacherID)).toBe(1);
      expect(await db.addRegistration(studentID, teacherID)).toBeTruthy();
      expect(await db.getRegistrationCount(studentID, teacherID)).toBe(1);
    });
  });

  describe('Get Registration', () => {
    let studentID, teacherID;
    beforeAll(async () => {
      ({ id: studentID } = await db.addStudent(validEmail1));
      ({ id: teacherID } = await db.addTeacher(validEmail2));
      await db.addRegistration(studentID, teacherID);
    });
    afterAll(async () => await db.reset());

    test('When getting existent registration, should return registration object', async () => {
      expect(await db.addRegistration(studentID, teacherID)).toMatchObject({
        student_id: studentID,
        teacher_id: teacherID,
      });
    });

    test('When getting non-existent registration, should throw error', async () => {
      await expect(
        db.getRegistration(studentID - 1, teacherID - 1)
      ).rejects.toThrow(new Error(Constants.ERR_REGISTRATION_DOES_NOT_EXIST));
    });
  });

  describe('Does Registration Exist', () => {
    let studentID, teacherID;
    beforeAll(async () => {
      ({ id: studentID } = await db.addStudent(validEmail1));
      ({ id: teacherID } = await db.addTeacher(validEmail2));
      await db.addRegistration(studentID, teacherID);
    });
    afterAll(async () => await db.reset());

    test('When checking existent registration, should return true', async () => {
      expect(await db.doesRegistrationExist(studentID, teacherID)).toBe(true);
    });

    test('When checking non-existent registration, should return false', async () => {
      expect(await db.doesRegistrationExist(studentID - 1, teacherID - 1)).toBe(
        false
      );
    });
  });
});
