module.exports = {
  up:
    'CREATE TABLE teacher (id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(320) NOT NULL, UNIQUE (email));',
  down: 'DROP TABLE teacher;',
};
