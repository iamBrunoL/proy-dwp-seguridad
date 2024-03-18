-- to create a new database
CREATE DATABASE proy-dwp;

-- to use database
use proy-dwp;

-- creating a new table
CREATE TABLE usuarios (
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombreCompleto VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(15)
);

-- to show all tables
show tables;

-- to describe table
describe customer;