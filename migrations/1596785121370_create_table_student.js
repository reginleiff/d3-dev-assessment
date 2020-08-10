module.exports = {
  up:
    'CREATE TABLE student (id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, email VARCHAR(320) NOT NULL, is_suspended BOOLEAN DEFAULT false, UNIQUE (email));',
  down: 'DROP TABLE student;',
};
