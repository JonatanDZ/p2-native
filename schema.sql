CREATE DATABASE p2_app;
USE p2_app;

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    shop VARCHAR(255),
    picture VARCHAR(255),
    info TEXT,
    price INT,
    amount INT,
    black TINYINT(1),
    white TINYINT(1),
    grey TINYINT(1),
    brown TINYINT(1),
    blue TINYINT(1),
    pants TINYINT(1),
    tshirt TINYINT(1),
    sweatshirt TINYINT(1),
    hoodie TINYINT(1),
    shoes TINYINT(1),
    shorts TINYINT(1),
    cotton TINYINT(1),
    linen TINYINT(1),
    polyester TINYINT(1),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



