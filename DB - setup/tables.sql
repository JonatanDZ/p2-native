CREATE DATABASE IF NOT EXISTS p2_database;
USE p2_database;

CREATE TABLE IF NOT EXISTS users_table(
	ID INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255),
    password VARCHAR(225),
    name VARCHAR(255),
    admin INT DEFAULT 0,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS products_table(
	ID INT NOT NULL AUTO_INCREMENT,
    shopID INT NOT NULL,
    name VARCHAR(255),
    picture VARCHAR(255),
    info VARCHAR(255),
    price INT,
    amount INT,
    size VARCHAR(255),
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS events_table(
	ID INT NOT NULL AUTO_INCREMENT,
    price INT,
    place VARCHAR(255),
    info VARCHAR(255),
    name VARCHAR(255),
    image VARCHAR(255),
    time VARCHAR(255),
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS user_filters(
	userID INT,
    black INT DEFAULT 0,
    white INT DEFAULT 0,
    gray INT DEFAULT 0,
    brown INT DEFAULT 0,
    blue INT DEFAULT 0,
    pants INT DEFAULT 0,
    t_shirt INT DEFAULT 0,
    sweatshirt INT DEFAULT 0,
    hoodie INT DEFAULT 0,
    shoes INT DEFAULT 0,
    shorts INT DEFAULT 0,
    cotton INT DEFAULT 0,
    linnen INT DEFAULT 0,
    polyester INT DEFAULT 0,
    FOREIGN KEY (userID) REFERENCES users_table(ID)
);

CREATE TABLE IF NOT EXISTS products_filters(
	productID INT NOT NULL AUTO_INCREMENT,
    black INT DEFAULT 0,
    white INT DEFAULT 0,
    gray INT DEFAULT 0,
    brown INT DEFAULT 0,
    blue INT DEFAULT 0,
    pants INT DEFAULT 0,
    t_shirt INT DEFAULT 0,
    sweatshirt INT DEFAULT 0,
    hoodie INT DEFAULT 0,
    shoes INT DEFAULT 0,
    shorts INT DEFAULT 0,
    cotton INT DEFAULT 0,
    linnen INT DEFAULT 0,
    polyester INT DEFAULT 0,
	FOREIGN KEY (productID) REFERENCES products_table(ID)
);

CREATE TABLE IF NOT EXISTS user_events(
	userID int,
    eventID int,
    FOREIGN KEY (userID) REFERENCES users_table(ID),
    FOREIGN KEY (eventID) REFERENCES events_table(ID)
);