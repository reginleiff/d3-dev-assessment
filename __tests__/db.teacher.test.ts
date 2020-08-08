import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import Database from '../src/db';
import Constants from '../src/constants';

describe('Database - Teacher', () => {
  let db: Database;
  const validEmail1 = 'abc@gmail.com';
  const validEmail2 = 'defgh@gmail.com';

  beforeAll(() => (db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME)));

  afterAll(() => db.close());

  describe('Add Teacher', () => {
    beforeEach(async () => {
      await db.reset();
    });

    afterEach(async () => {
      await db.reset();
    });

    test('When adding teacher, should return teacher object', async () => {
      expect(await db.addTeacher(validEmail1)).toMatchObject({
        id: expect.any(Number),
        email: validEmail1,
      });
    });

    test('When adding teacher with the same email, does not result in duplicate entries', async () => {
      expect(await db.addTeacher(validEmail1)).toBeTruthy();
      expect(await db.getTeacherCount(validEmail1)).toBe(1);
      expect(await db.addTeacher(validEmail1)).toBeTruthy();
      expect(await db.getTeacherCount(validEmail1)).toBe(1);
    });
  });

  describe('Get Teacher', () => {
    beforeAll(async () => await db.addTeacher(validEmail1));
    afterAll(async () => await db.reset());

    test('When getting existent teacher, should return teacher object', async () => {
      expect(await db.getTeacher(validEmail1)).toMatchObject({
        id: expect.any(Number),
        email: validEmail1,
      });
    });

    test('When getting non-existent teacher, should throw error', async () => {
      await expect(db.getTeacher(validEmail2)).rejects.toThrow(
        new Error(Constants.ERR_TEACHER_DOES_NOT_EXIST)
      );
    });
  });

  describe('Does Teacher Exist', () => {
    beforeAll(async () => await db.addTeacher(validEmail1));
    afterAll(async () => await db.reset());

    test('When checking existent teacher, should return true', async () => {
      expect(await db.doesTeacherExist(validEmail1)).toBe(true);
    });

    test('When checking non-existent teacher, should return false', async () => {
      expect(await db.doesTeacherExist(validEmail2)).toBe(false);
    });
  });
});
