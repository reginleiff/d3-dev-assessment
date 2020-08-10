module.exports = {
  up:
    'CREATE TABLE registration(student_id INT UNSIGNED NOT NULL REFERENCES student(id), teacher_id BIGINT UNSIGNED NOT NULL REFERENCES teacher(id), UNIQUE(student_id, teacher_id));',
  down: 'DROP TABLE registration;',
};
