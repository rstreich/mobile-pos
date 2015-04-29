-- MySQL database creation

DROP DATABASE IF EXISTS produce;

CREATE DATABASE produce;

USE produce;

CREATE TABLE Users (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(20) NOT NULL,
 pwd CHAR(60) NOT NULL,
 isAdmin BOOLEAN NOT NULL DEFAULT 0,
 isActive BOOLEAN NOT NULL DEFAULT 1,
 UNIQUE INDEX(name)
);

CREATE TABLE UnitsOfMeasure (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(20) NOT NULL,
 UNIQUE INDEX(name)
);

CREATE TABLE Items (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(20) NOT NULL,
 uom INTEGER NOT NULL,
 unitPrice DECIMAL(10, 2) NOT NULL,
 isActive BOOLEAN NOT NULL DEFAULT 1,
 image VARCHAR(80) NOT NULL DEFAULT 'no-image.png',
 UNIQUE INDEX(name),
 CONSTRAINT fk_uom
  FOREIGN KEY (uom) REFERENCES UnitsOfMeasure(id)
);

CREATE TABLE Locations (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(40) NOT NULL,
 UNIQUE INDEX(name)
);

CREATE TABLE Sales (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 saleDate TIMESTAMP NOT NULL DEFAULT NOW(),
 totalCollected DECIMAL(10, 2) NOT NULL,
 location INTEGER NOT NULL,
 soldBy INTEGER NOT NULL,
 INDEX dataIndex(saleDate),
 CONSTRAINT fk_users
  FOREIGN KEY (soldBy) REFERENCES Users(id),
 CONSTRAINT fk_location
  FOREIGN KEY (location) REFERENCES Locations(id)
);

CREATE TABLE SoldItems (
 quantity DECIMAL(4,2) NOT NULL,
 unitPrice DECIMAL(10, 2) NOT NULL,
 item INTEGER NOT NULL,
 sale INTEGER NOT NULL,
 CONSTRAINT fk_item
  FOREIGN KEY (item) REFERENCES Items(id),
 CONSTRAINT fk_sale
  FOREIGN KEY (sale) REFERENCES Sales(id)
);

INSERT INTO Locations SET id = 1, name = 'admin';
INSERT INTO UnitsOfMeasure(id, name) VALUES
 (1, 'each'),
 (2, 'lb.'),
 (3, 'dozen'),
 (4, 'quart'),
 (5, 'pint');
INSERT INTO Items(id, name, uom, unitPrice, image) VALUES
 (1, 'Discount', 1, -1, 'discount.png'),
 (2, 'Donation', 1, 1, 'donation.png');

-- play data
INSERT INTO Users(name, pwd) VALUES ('Fooble', password('feeble'));
INSERT INTO Locations(name) VALUES ('Fargo');
INSERT INTO Sales(location, totalCollected, soldBy) VALUES (1, 250.00, 1);
INSERT INTO SoldItems(quantity, unitPrice, item, sale) VALUES
 (10, 5.00, 1, 1),
 (1, 13.00, 1, 1),
 (4, 22.00, 1, 1),
 (6, 3.09, 1, 1),
 (12, 45.00, 1, 1);
