import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import Database from '../src/db';
import Constants from '../src/constants';

describe('Database - Student', () => {
  let db: Database;
  const validEmail1 = 'abc@gmail.com';
  const validEmail2 = 'defgh@gmail.com';

  beforeAll(() => (db = new Database(DB_HOST, DB_USER, DB_NAME, DB_PASS)));

  afterAll(() => db.close());

  describe('Add Student', () => {
    beforeEach(async () => {
      await db.reset();
    });

    afterEach(async () => {
      await db.reset();
    });

    test('When adding student, should return student object', async () => {
      expect(await db.addStudent(validEmail1)).toMatchObject({
        id: expect.any(Number),
        email: validEmail1,
        is_suspended: 0,
      });
    });

    test('When adding student with the same email, does not result in duplicate entries', async () => {
      expect(await db.addStudent(validEmail1)).toBeTruthy();
      expect(await db.getStudentCount(validEmail1)).toBe(1);
      expect(await db.addStudent(validEmail1)).toBeTruthy();
      expect(await db.getStudentCount(validEmail1)).toBe(1);
    });
  });

  describe('Get Student', () => {
    beforeAll(async () => await db.addStudent(validEmail1));
    afterAll(async () => await db.reset());

    test('When getting existent student, should return student object', async () => {
      expect(await db.getStudent(validEmail1)).toMatchObject({
        id: expect.any(Number),
        email: validEmail1,
        is_suspended: 0,
      });
    });

    test('When getting non-existent student, should throw error', async () => {
      await expect(db.getStudent(validEmail2)).rejects.toThrow(
        new Error(Constants.ERR_STUDENT_DOES_NOT_EXIST)
      );
    });
  });

  describe('Does Student Exist', () => {
    beforeAll(async () => await db.addStudent(validEmail1));
    afterAll(async () => await db.reset());

    test('When checking existent student, should return true', async () => {
      expect(await db.doesStudentExist(validEmail1)).toBe(true);
    });

    test('When checking non-existent student, should return false', async () => {
      expect(await db.doesStudentExist(validEmail2)).toBe(false);
    });
  });
});
