-- ============================================================
-- TransitOps — Database Schema
-- Smart Transport Operations Platform
-- Engine: MySQL (InnoDB, utf8mb4)
-- ============================================================

CREATE DATABASE IF NOT EXISTS transitops
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE transitops;

-- ------------------------------------------------------------
-- Drop tables in dependency order (children first)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS Expenses;
DROP TABLE IF EXISTS FuelLogs;
DROP TABLE IF EXISTS MaintenanceLogs;
DROP TABLE IF EXISTS Trips;
DROP TABLE IF EXISTS Drivers;
DROP TABLE IF EXISTS Vehicles;
DROP TABLE IF EXISTS Users;

-- ------------------------------------------------------------
-- Users (platform accounts)
-- ------------------------------------------------------------
CREATE TABLE Users (
  id            INT            NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)   NOT NULL,
  email         VARCHAR(150)   NOT NULL,
  password_hash VARCHAR(255)   NOT NULL,
  role          ENUM('Admin','Fleet Manager','Safety Officer','Financial Analyst','Driver','Dispatcher') NOT NULL DEFAULT 'Driver',
  phone         VARCHAR(20)    DEFAULT NULL,
  status        ENUM('Active','Inactive','Suspended')               NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Vehicles
-- ------------------------------------------------------------
CREATE TABLE Vehicles (
  id                  INT           NOT NULL AUTO_INCREMENT,
  registration_number VARCHAR(20)   NOT NULL,
  make                VARCHAR(50)   DEFAULT NULL,
  model               VARCHAR(50)   DEFAULT NULL,
  year                INT           DEFAULT NULL,
  vehicle_type        ENUM('Truck','Mini Truck','Van','Bus','Trailer') NOT NULL,
  max_load_capacity   DECIMAL(10,2) NOT NULL,
  fuel_type           ENUM('Diesel','Petrol','CNG','Electric')        NOT NULL DEFAULT 'Diesel',
  acquisition_cost    DECIMAL(12,2) DEFAULT NULL,
  status              ENUM('Available','On Trip','In Shop','Retired') NOT NULL DEFAULT 'Available',
  last_maintenance_date DATE        DEFAULT NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehicles_registration (registration_number),
  KEY idx_vehicles_status (status),
  KEY idx_vehicles_type (vehicle_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Drivers
-- ------------------------------------------------------------
CREATE TABLE Drivers (
  id                  INT          NOT NULL AUTO_INCREMENT,
  name                VARCHAR(100) NOT NULL,
  license_number      VARCHAR(30)  NOT NULL,
  license_expiry_date DATE         NOT NULL,
  phone               VARCHAR(20)  DEFAULT NULL,
  status              ENUM('Available','On Trip','Off Duty','Suspended') NOT NULL DEFAULT 'Available',
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_drivers_license (license_number),
  KEY idx_drivers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Trips
-- ------------------------------------------------------------
CREATE TABLE Trips (
  id               INT           NOT NULL AUTO_INCREMENT,
  vehicle_id       INT           NOT NULL,
  driver_id        INT           NOT NULL,
  source           VARCHAR(120)  NOT NULL,
  destination      VARCHAR(120)  NOT NULL,
  cargo_weight     DECIMAL(10,2) NOT NULL,
  planned_distance DECIMAL(10,2) NOT NULL,
  actual_distance  DECIMAL(10,2) DEFAULT NULL,
  status           ENUM('Draft','Dispatched','In Transit','Completed','Cancelled') NOT NULL DEFAULT 'Draft',
  start_time       DATETIME      DEFAULT NULL,
  end_time         DATETIME      DEFAULT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_trips_vehicle (vehicle_id),
  KEY idx_trips_driver (driver_id),
  KEY idx_trips_status (status),
  CONSTRAINT fk_trips_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES Vehicles (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id)
    REFERENCES Drivers (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- MaintenanceLogs
-- ------------------------------------------------------------
CREATE TABLE MaintenanceLogs (
  id                INT          NOT NULL AUTO_INCREMENT,
  vehicle_id        INT          NOT NULL,
  maintenance_type  ENUM('Routine','Repair','Inspection','Accident') NOT NULL,
  description       TEXT,
  cost              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  maintenance_date  DATE         NOT NULL,
  odometer_reading  INT          DEFAULT NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_maintenance_vehicle (vehicle_id),
  KEY idx_maintenance_date (maintenance_date),
  CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES Vehicles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- FuelLogs
-- ------------------------------------------------------------
CREATE TABLE FuelLogs (
  id               INT           NOT NULL AUTO_INCREMENT,
  vehicle_id       INT           NOT NULL,
  driver_id        INT           DEFAULT NULL,
  quantity         DECIMAL(10,2) NOT NULL,
  cost             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fuel_date        DATE          NOT NULL,
  odometer_reading INT           DEFAULT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fuel_vehicle (vehicle_id),
  KEY idx_fuel_driver (driver_id),
  KEY idx_fuel_date (fuel_date),
  CONSTRAINT fk_fuel_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES Vehicles (id) ON DELETE CASCADE,
  CONSTRAINT fk_fuel_driver FOREIGN KEY (driver_id)
    REFERENCES Drivers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Expenses
-- ------------------------------------------------------------
CREATE TABLE Expenses (
  id           INT            NOT NULL AUTO_INCREMENT,
  trip_id      INT            DEFAULT NULL,
  vehicle_id   INT            DEFAULT NULL,
  category     ENUM('Fuel','Maintenance','Toll','Salary','Insurance','Misc') NOT NULL,
  amount       DECIMAL(10,2)  NOT NULL,
  expense_date DATE           NOT NULL,
  note         VARCHAR(255)   DEFAULT NULL,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expenses_trip (trip_id),
  KEY idx_expenses_vehicle (vehicle_id),
  KEY idx_expenses_category (category),
  CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id)
    REFERENCES Trips (id) ON DELETE SET NULL,
  CONSTRAINT fk_expenses_vehicle FOREIGN KEY (vehicle_id)
    REFERENCES Vehicles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
