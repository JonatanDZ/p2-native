CREATE DATABASE p2_app;
USE p2_app;

CREATE TABLE products (
    id integer PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price integer,
    amount integer,
    filters VARCHAR(255),
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO products (name, price, amount, filters)
VALUES
("test1", 199, 10, "tøj"),
("test2", 299, 30, "tøj"),
("test3", 322, 12, "tøj");
