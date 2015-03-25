-- MySQL database creation

DROP DATABASE IF EXISTS produce;

CREATE DATABASE produce;

USE produce;

CREATE TABLE Users (
 id    	     INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name  	     	   VARCHAR(20) NOT NULL,
 pwd	     	   CHAR(60) NOT NULL,
 isAdmin     	   BOOLEAN NOT NULL DEFAULT 0,
 isActive     	   BOOLEAN NOT NULL DEFAULT 1,
 UNIQUE INDEX(name)
);

CREATE TABLE UnitsOfMeasure (
 id    	     INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name	     VARCHAR(20) NOT NULL,
 UNIQUE INDEX(name)
);

CREATE TABLE Items (
 id    	     INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 description VARCHAR(80) NOT NULL,
 uom INTEGER NOT NULL,
 unitPrice     DECIMAL(10, 2) NOT NULL,
 isActive BOOLEAN NOT NULL DEFAULT 1,
 image VARCHAR(80) NOT NULL DEFAULT 'noimage.gif',
 created TIMESTAMP NOT NULL DEFAULT NOW(),
 constraint fk_uom
  FOREIGN KEY (uom) REFERENCES UnitsOfMeasure(id)
);

CREATE TABLE Locations (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(80) NOT NULL,
 UNIQUE INDEX(name)
);

CREATE TABLE Sales (
 id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
 saleDate TIMESTAMP NOT NULL DEFAULT NOW(),
 location INTEGER NOT NULL,
 totalPrice DECIMAL(10, 2) NOT NULL,
 soldBy INTEGER NOT NULL,
 constraint fk_users
  FOREIGN KEY (soldBy) REFERENCES Users(id),
 constraint fk_location
  FOREIGN KEY (location) REFERENCES Locations(id)
);

CREATE TABLE SoldItems (
 quantity INTEGER NOT NULL,
 unitPrice DECIMAL(10, 2) NOT NULL,
 item INTEGER NOT NULL,
 sale INTEGER NOT NULL,
 constraint fk_item
  FOREIGN KEY (item) REFERENCES Items(id),
 constraint fk_sale
  FOREIGN KEY (sale) REFERENCES Sales(id)
);

INSERT INTO UnitsOfMeasure set id = 1, name = 'each';
INSERT INTO Items(id, description, uom, unitPrice) VALUES 
 (1, 'Discounted Amount', 1, 1),
 (2, 'Donated Amount', 1, 1);

-- play data
INSERT INTO Users(name, pwd) VALUES ('Fooble', password('feeble'));
INSERT INTO Locations(name) VALUES ('Fargo');
INSERT INTO Sales(location, totalPrice, soldBy) VALUES (1, 250.00, 1);
INSERT INTO SoldItems(quantity, unitPrice, item, sale) VALUES (10, 5.00, 1, 1);
INSERT INTO SoldItems(quantity, unitPrice, item, sale) VALUES (1, 13.00, 1, 1);
INSERT INTO SoldItems(quantity, unitPrice, item, sale) VALUES (4, 22.00, 1, 1);
INSERT INTO SoldItems(quantity, unitPrice, item, sale) VALUES (6, 3.09, 1, 1);
INSERT INTO SoldItems(quantity, unitPrice, item, sale) VALUES (12, 45.00, 1, 1);
