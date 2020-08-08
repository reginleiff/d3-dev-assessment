
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from '../config';
import Database from '../src/db';
import Constants from '../src/constants';

describe('Database - Miscellaneous', () => {
  let db: Database;
  const validEmail1 = 'abc@gmail.com';
  const validEmail2 = 'defgh@gmail.com';
  const validEmail3 = 'ijkl_mnop@gmail.com';

  beforeAll(() => (db = new Database(DB_HOST, DB_USER, DB_PASS, DB_NAME)));
  afterAll(() => db.close());

  describe('Get Student Emails', () => {
    beforeAll(async () => {
      const teacher = await db.addTeacher(validEmail1);
      const student1 = await db.addStudent(validEmail2);
      const student2 = await db.addStudent(validEmail3);
      await db.addRegistration(student1.id, teacher.id);
      await db.addRegistration(student2.id, teacher.id);
    });

    afterAll(async () => {
      await db.reset();
    });

    test('When getting students under a valid teacher, should return all student emails', async () => {
      const studentEmails = await db.getStudentEmails(validEmail1);
      for(let studentEmail of studentEmails) {
        expect(studentEmail).toEqual(expect.any(String));
      }
    });
  });
});
