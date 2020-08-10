import _ from 'lodash';
import { createPool, Pool } from 'mysql2';
import Constants from './constants';

class Database {
  private pool: Pool;

  constructor(host: string, user: string, databaseName: string, password?: string) {
    let error: string | null = null;
    if (_.isUndefined(host) || !_.isString(host) || host.length === 0) error = 'DB_HOST not provided in config';
    if (_.isUndefined(user) || !_.isString(user) || user.length === 0) error = 'DB_USER not provided in config';
    if (_.isUndefined(databaseName) || !_.isString(databaseName) || databaseName.length === 0)
      error = 'DB_NAME not provided in config';
    if (!_.isNull(error)) throw new Error(`Failed to initialise database: ${error}`);

    this.pool = createPool({
      host,
      user,
      database: databaseName,
      password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  private async query(query: string, args: any[]): Promise<any[]> {
    return new Promise((resolve, reject) =>
      this.pool.getConnection((poolErr, connection) => {
        if (poolErr) reject(poolErr);
        connection.execute(query, args, (execErr, result, fields) => {
          if (execErr) reject(execErr);
          this.pool.releaseConnection(connection);
          resolve([result, fields]);
        });
      }),
    );
  }

  public async verifyConnection(): Promise<boolean> {
    return new Promise((resolve, reject) =>
      this.pool.getConnection((poolErr, connection) => {
        if (poolErr) reject(new Error(`Database failed to instantiate connection: ${poolErr.message}`));
        if (_.isUndefined(connection)) reject(new Error(`Database failed to instantiate connection`));
        else this.pool.releaseConnection(connection);
        resolve(true);
      }),
    );
  }

  // ------------- TEACHER ---------------

  public async getTeacher(email: string): Promise<any> {
    const queryString = 'SELECT * FROM `teacher` WHERE `email` = ?;';
    const [result] = await this.query(queryString, [email]);
    if (result.length == 0) throw new Error(Constants.ERR_TEACHER_DOES_NOT_EXIST);
    return result[0];
  }

  public async addTeacher(email: string): Promise<any> {
    const queryString = 'INSERT INTO `teacher` (email) VALUES (?);';
    const exists = await this.doesTeacherExist(email);
    if (!exists) {
      await this.query(queryString, [email]);
    }

    const teacher = await this.getTeacher(email);
    return teacher;
  }

  public async getTeacherCount(email: string): Promise<number> {
    const queryString = 'SELECT COUNT(id) as count FROM teacher WHERE `email` = ?;';
    const [result] = await this.query(queryString, [email]);
    const { count } = result[0];
    return count;
  }

  public async doesTeacherExist(email: string): Promise<any> {
    const count = await this.getTeacherCount(email);
    return count >= 1;
  }

  // ------------- STUDENT ---------------

  public async getStudent(email: string): Promise<any> {
    const queryString = 'SELECT * FROM `student` WHERE `email` = ?;';
    const [result] = await this.query(queryString, [email]);
    if (result.length == 0) throw new Error(Constants.ERR_STUDENT_DOES_NOT_EXIST);
    return result[0];
  }

  public async addStudent(email: string): Promise<any> {
    const queryString = 'INSERT INTO `student` (email) VALUES (?);';
    const exists = await this.doesStudentExist(email);
    if (!exists) {
      await this.query(queryString, [email]);
    }

    const student = await this.getStudent(email);
    return student;
  }

  public async getStudentCount(email: string): Promise<number> {
    const queryString = 'SELECT COUNT(id) as count FROM `student` WHERE `email` = ?;';
    const [result] = await this.query(queryString, [email]);
    const { count } = result[0];
    return count;
  }

  public async doesStudentExist(email: string): Promise<any> {
    const count = await this.getStudentCount(email);
    return count >= 1;
  }

  public async suspendStudent(email: string): Promise<any> {
    const exists = await this.doesStudentExist(email);
    if (!exists) throw new Error(Constants.ERR_STUDENT_DOES_NOT_EXIST);

    const queryString = 'UPDATE `student` SET `is_suspended` = true WHERE `email` = ?;';
    const [result] = await this.query(queryString, [email]);
    const { affectedRows } = result;
    if (affectedRows != 1) throw new Error(Constants.ERR_INTERNAL_ERROR);
    return this.getStudent(email);
  }

  // ------------- REGISTRATION ---------------
  public async getRegistration(studentID: number, teacherID: number): Promise<object> {
    const queryString = 'SELECT * FROM `registration` WHERE `student_id` = ? AND `teacher_id` = ?;';
    const [result] = await this.query(queryString, [studentID, teacherID]);
    if (result.length == 0) throw new Error(Constants.ERR_REGISTRATION_DOES_NOT_EXIST);
    return result[0];
  }

  public async addRegistration(studentID: number, teacherID: number): Promise<object> {
    const queryString = 'INSERT INTO `registration` (student_id, teacher_id) VALUES (?, ?);';
    const exists = await this.doesRegistrationExist(studentID, teacherID);
    if (!exists) {
      await this.query(queryString, [studentID, teacherID]);
    }

    const registration = await this.getRegistration(studentID, teacherID);
    return registration;
  }

  public async getRegistrationCount(studentID: number, teacherID: number): Promise<number> {
    const queryString = 'SELECT COUNT(*) as count FROM `registration` WHERE `student_id` = ? AND `teacher_id` = ?;';
    const [result] = await this.query(queryString, [studentID, teacherID]);
    const { count } = result[0];
    return count;
  }

  public async doesRegistrationExist(studentID: number, teacherID: number): Promise<any> {
    const count = await this.getRegistrationCount(studentID, teacherID);
    return count >= 1;
  }

  // ------------- MISCELLANEOUS ---------------
  public async getStudentEmails(teacherEmail: string): Promise<any[]> {
    const queryString =
      'SELECT DISTINCT s.email AS student_email FROM registration AS r INNER JOIN teacher AS t ON (r.teacher_id = t.id) INNER JOIN student AS s ON (r.student_id = s.id) WHERE t.email = ?;';
    const [result] = await this.query(queryString, [teacherEmail]);
    const students = result.map(({ student_email }) => student_email);
    return students;
  }

  public async getNotificationList(teacherEmail: string): Promise<any[]> {
    const queryString =
      'SELECT DISTINCT s.email AS student_email FROM registration AS r INNER JOIN teacher AS t ON (r.teacher_id = t.id) INNER JOIN student AS s ON (r.student_id = s.id) WHERE t.email = ? AND s.is_suspended = false;';
    const [result] = await this.query(queryString, [teacherEmail]);
    const students = result.map(({ student_email }) => student_email);
    return students;
  }

  public async reset(): Promise<boolean> {
    const [result1] = await this.query('DELETE FROM `registration`;', []);
    const [result2] = await this.query('DELETE FROM `teacher`;', []);
    const [result3] = await this.query('DELETE FROM `student`;', []);
    return result1 && result2 && result3;
  }

  public async close() {
    this.pool.end();
  }
}

export default Database;
