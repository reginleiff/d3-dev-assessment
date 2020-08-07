module.exports = {
  up:
    'CREATE TABLE student (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(320) NOT NULL, is_suspended BOOLEAN DEFAULT false);',
  down: 'DROP TABLE student;',
};
