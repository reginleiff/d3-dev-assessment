module.exports = {
  up:
    'CREATE TABLE registration(student_id BIGINT UNSIGNED NOT NULL REFERENCES student(id), teacher_id BIGINT UNSIGNED NOT NULL REFERENCES teacher(id));',
  down: 'DROP TABLE registration;',
};
