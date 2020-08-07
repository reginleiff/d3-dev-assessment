module.exports = {
  up:
    'CREATE TABLE teacher (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(320) NOT NULL);',
  down: 'DROP TABLE teacher;',
};
