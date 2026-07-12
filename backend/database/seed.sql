-- ============================================================
-- TransitOps — Seed Data
-- Realistic sample data for the Smart Transport Operations Platform
-- NOTE: password_hash values are placeholders (not real bcrypt hashes).
-- ============================================================

USE transitops;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Expenses;
TRUNCATE TABLE FuelLogs;
TRUNCATE TABLE MaintenanceLogs;
TRUNCATE TABLE Trips;
TRUNCATE TABLE Drivers;
TRUNCATE TABLE Vehicles;
TRUNCATE TABLE Users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
INSERT INTO Users (id, name, email, password_hash, role, phone, status) VALUES
(1, 'Aarav Sharma',   'admin@transitops.com',      'placeholder_hash_admin',   'Admin',         '9811000001', 'Active'),
(2, 'Rohan Mehta',    'fleet.manager@transitops.com','placeholder_hash_fm',    'Fleet Manager', '9811000002', 'Active'),
(3, 'Vikram Singh',   'driver.vikram@transitops.com','placeholder_hash_drv',   'Driver',        '9811000003', 'Active'),
(4, 'Priya Nair',     'dispatcher@transitops.com',  'placeholder_hash_disp',   'Dispatcher',    '9811000004', 'Active'),
(5, 'Suresh Kumar',   'driver.suresh@transitops.com','placeholder_hash_drv2',  'Driver',        '9811000005', 'Active'),
(6, 'Anita Desai',    'safety@transitops.com',      'placeholder_hash_safety', 'Safety Officer','9811000006', 'Active'),
(7, 'Rajesh Khanna',  'finance@transitops.com',     'placeholder_hash_fin',    'Financial Analyst', '9811000007', 'Active');

-- ------------------------------------------------------------
-- Vehicles
-- ------------------------------------------------------------
INSERT INTO Vehicles (id, registration_number, make, model, year, vehicle_type, max_load_capacity, fuel_type, acquisition_cost, status, last_maintenance_date) VALUES
(1, 'MH12AB1234', 'Tata',          'Prima LX',   2021, 'Truck',     25000.00, 'Diesel', 1850000.00, 'On Trip', '2026-05-10'),
(2, 'DL01CD5678', 'Ashok Leyland', '1612',       2020, 'Truck',     22000.00, 'Diesel', 1650000.00, 'Available','2026-04-22'),
(3, 'KA05EF9012', 'Mahindra',      'Bolero Pickup', 2022, 'Mini Truck', 1500.00, 'Diesel', 850000.00,  'Available','2026-06-01'),
(4, 'GJ03GH3456', 'Eicher',        'Pro 3015',   2019, 'Truck',     18000.00, 'Diesel', 1400000.00, 'In Shop', '2026-03-15'),
(5, 'TN07IJ7890', 'Tata',          'Ultra',      2023, 'Van',        2500.00, 'CNG',   1100000.00, 'Available','2026-06-20'),
(6, 'HR26KL1122', 'BharatBenz',    '1217',       2018, 'Bus',        5000.00, 'Diesel', 2200000.00, 'Retired', '2025-12-30');

-- ------------------------------------------------------------
-- Drivers
-- ------------------------------------------------------------
INSERT INTO Drivers (id, name, license_number, license_expiry_date, phone, status) VALUES
(1, 'Vikram Singh',  'DL9821001234', '2027-08-15', '9876500001', 'On Trip'),
(2, 'Suresh Kumar',  'MH4523005678', '2026-11-30', '9876500002', 'Available'),
(3, 'Arjun Reddy',   'KA7812003456', '2028-02-10', '9876500003', 'Available'),
(4, 'Manoj Tiwari',  'UP3214007890', '2026-09-05', '9876500004', 'Off Duty'),
(5, 'Deepak Verma',  'RJ5612001122', '2027-05-20', '9876500005', 'Suspended'),
(6, 'Karthik Nair',  'TN9012003344', '2028-01-25', '9876500006', 'Available');

-- ------------------------------------------------------------
-- Trips
-- ------------------------------------------------------------
INSERT INTO Trips (id, vehicle_id, driver_id, source, destination, cargo_weight, planned_distance, actual_distance, status, start_time, end_time) VALUES
(1, 1, 1, 'Mumbai',   'Pune',      12000.00, 150.00, NULL,   'Dispatched', '2026-07-10 08:00:00', NULL),
(2, 2, 2, 'Delhi',    'Jaipur',     9000.00, 280.00, NULL,   'Dispatched', '2026-07-11 06:30:00', NULL),
(3, 3, 3, 'Bengaluru','Mysuru',      800.00, 150.00, 148.00, 'Completed',  '2026-07-05 09:00:00', '2026-07-05 12:30:00'),
(4, 4, 4, 'Ahmedabad','Vadodara',  10000.00, 110.00, NULL,   'Draft',      NULL, NULL),
(5, 5, 6, 'Chennai',  'Coimbatore', 1500.00, 510.00, NULL,   'In Transit', '2026-07-12 05:00:00', NULL),
(6, 1, 1, 'Pune',     'Nashik',    11000.00, 210.00, NULL,   'Draft',      NULL, NULL),
(7, 2, 2, 'Jaipur',   'Ajmer',      8500.00, 135.00, 130.00, 'Completed',  '2026-07-02 07:00:00', '2026-07-02 10:15:00'),
(8, 6, 5, 'Kolkata',  'Asansol',    3000.00, 220.00, NULL,   'Cancelled',  NULL, NULL);

-- ------------------------------------------------------------
-- MaintenanceLogs
-- ------------------------------------------------------------
INSERT INTO MaintenanceLogs (id, vehicle_id, maintenance_type, description, cost, maintenance_date, odometer_reading) VALUES
(1, 1, 'Routine',    '15000 km periodic service',         12500.00, '2026-05-10', 48200),
(2, 4, 'Repair',     'Brake pad replacement',            22000.00, '2026-03-15', 91200),
(3, 2, 'Inspection', 'Annual fitness check',              4500.00, '2026-04-22', 61000),
(4, 3, 'Routine',    'Oil change and filter',             3200.00, '2026-06-01', 33000),
(5, 5, 'Accident',   'Bumper dent repair',               18500.00, '2026-06-20', 27000);

-- ------------------------------------------------------------
-- FuelLogs
-- ------------------------------------------------------------
INSERT INTO FuelLogs (id, vehicle_id, driver_id, quantity, cost, fuel_date, odometer_reading) VALUES
(1, 1, 1, 250.00, 22500.00, '2026-07-10', 49000),
(2, 2, 2, 300.00, 27000.00, '2026-07-11', 62500),
(3, 3, 3,  60.00,  5400.00, '2026-07-05', 33400),
(4, 5, 6,  80.00,  6800.00, '2026-07-12', 27500),
(5, 1, 1, 240.00, 21600.00, '2026-07-08', 48250),
(6, 4, 4, 280.00, 25200.00, '2026-03-10', 90800);

-- ------------------------------------------------------------
-- Expenses
-- ------------------------------------------------------------
INSERT INTO Expenses (id, trip_id, vehicle_id, category, amount, expense_date, note) VALUES
(1, 3, 3, 'Fuel',       5400.00, '2026-07-05', 'Fuel for Mysuru trip'),
(2, 1, 1, 'Toll',       1200.00, '2026-07-10', 'Mumbai-Pune expressway toll'),
(3, 1, 1, 'Fuel',      22500.00, '2026-07-10', 'Diesel refill'),
(4, NULL, 1, 'Maintenance', 12500.00, '2026-05-10', 'Periodic service'),
(5, NULL, 2, 'Salary',   45000.00, '2026-07-01', 'Driver monthly salary'),
(6, 2, 2, 'Toll',        850.00, '2026-07-11', 'Delhi-Jaipur toll'),
(7, NULL, 4, 'Maintenance', 22000.00, '2026-03-15', 'Brake repair'),
(8, 5, 5, 'Fuel',        6800.00, '2026-07-12', 'CNG refill');
