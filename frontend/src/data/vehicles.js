// Vehicle master data, derived from trucks_data.xlsx
// The source spreadsheet only contains: Truck Model, Vehicle Age, Number Plate,
// Date of Registration, Maintenance Due Date, Max Cargo Weight, Acquisition Cost.
// "Type", "Region" and "Status" are derived so the dashboard filters have real
// values to work with:
//   - type   -> manufacturer, parsed from the Truck Model
//   - region -> Indian state, parsed from the Number Plate prefix
//   - status -> defaults to "Available" (no status column in the source data)

const MANUFACTURERS = [
  "SML Isuzu",
  "Ashok Leyland",
  "BharatBenz",
  "Volvo",
  "Eicher",
  "Force",
  "Tata",
  "Mahindra",
];

export function getVehicleType(model) {
  const match = MANUFACTURERS.find((m) => model.startsWith(m));
  return match || model.split(" ")[0];
}

const STATE_CODES = {
  HR: "Haryana",
  DL: "Delhi",
  KA: "Karnataka",
  MP: "Madhya Pradesh",
  UP: "Uttar Pradesh",
  GJ: "Gujarat",
  PB: "Punjab",
  RJ: "Rajasthan",
  MH: "Maharashtra",
  TN: "Tamil Nadu",
};

export function getVehicleRegion(numberPlate) {
  const code = numberPlate.split("-")[0];
  return STATE_CODES[code] || code;
}

export const VEHICLE_STATUS_VALUES = ["Available", "On Trip", "In Shop", "Retired"];

const RAW_TRUCKS = [
  { model: "SML Isuzu Sartaj", age: 1, plate: "HR-29-WW-2013", regDate: "03-10-2024", maintenanceDue: "29-08-2026", maxCargo: 7500, cost: 4171684 },
  { model: "Volvo FM 400", age: 9, plate: "DL-72-EK-7867", regDate: "18-09-2016", maintenanceDue: "22-08-2026", maxCargo: 7500, cost: 2727284 },
  { model: "Eicher Pro 2049", age: 2, plate: "KA-88-FD-4078", regDate: "10-10-2023", maintenanceDue: "12-06-2026", maxCargo: 31000, cost: 3093866 },
  { model: "Force Traveller", age: 5, plate: "DL-80-GR-9711", regDate: "25-05-2021", maintenanceDue: "30-09-2026", maxCargo: 9000, cost: 4167132 },
  { model: "BharatBenz 1617R", age: 6, plate: "MP-39-HF-4999", regDate: "04-02-2020", maintenanceDue: "09-09-2026", maxCargo: 31000, cost: 3700793 },
  { model: "BharatBenz 3123R", age: 1, plate: "MP-94-QK-2199", regDate: "21-09-2024", maintenanceDue: "28-07-2026", maxCargo: 28000, cost: 3876668 },
  { model: "Tata Ultra T.16", age: 1, plate: "UP-63-PB-2271", regDate: "23-10-2024", maintenanceDue: "28-08-2026", maxCargo: 10500, cost: 3234686 },
  { model: "Ashok Leyland Captain", age: 12, plate: "MP-77-RU-8474", regDate: "03-10-2013", maintenanceDue: "06-10-2026", maxCargo: 18000, cost: 3226576 },
  { model: "Mahindra Blazo X 35", age: 1, plate: "DL-94-YK-8301", regDate: "26-05-2025", maintenanceDue: "21-07-2026", maxCargo: 25000, cost: 2072629 },
  { model: "Tata Prima 4023.S", age: 4, plate: "GJ-46-FV-2918", regDate: "28-12-2021", maintenanceDue: "26-12-2026", maxCargo: 18000, cost: 1894635 },
  { model: "Eicher Pro 3015", age: 7, plate: "PB-51-NR-2320", regDate: "14-06-2019", maintenanceDue: "07-07-2026", maxCargo: 16000, cost: 2342492 },
  { model: "Ashok Leyland Boss 1315", age: 2, plate: "UP-56-TJ-7804", regDate: "26-11-2023", maintenanceDue: "23-08-2026", maxCargo: 28000, cost: 2965341 },
  { model: "Volvo FMX 440", age: 5, plate: "UP-20-HX-4822", regDate: "31-12-2020", maintenanceDue: "11-07-2026", maxCargo: 10500, cost: 2148063 },
  { model: "BharatBenz 2823C", age: 0, plate: "RJ-37-AE-7864", regDate: "06-11-2025", maintenanceDue: "11-12-2026", maxCargo: 31000, cost: 2564801 },
  { model: "Mahindra Furio 7", age: 8, plate: "UP-89-SV-1884", regDate: "06-01-2018", maintenanceDue: "16-10-2026", maxCargo: 31000, cost: 3136354 },
  { model: "Tata LPT 1618", age: 7, plate: "MH-14-RW-7560", regDate: "01-10-2018", maintenanceDue: "21-08-2026", maxCargo: 21000, cost: 3473438 },
  { model: "Tata Signa 4018.T", age: 0, plate: "UP-15-LV-1861", regDate: "06-04-2026", maintenanceDue: "30-05-2026", maxCargo: 12000, cost: 3648123 },
  { model: "Mahindra Blazo X 28", age: 1, plate: "HR-47-VA-2152", regDate: "12-07-2025", maintenanceDue: "05-10-2026", maxCargo: 10500, cost: 4050741 },
  { model: "Ashok Leyland 2820", age: 3, plate: "TN-47-RD-2889", regDate: "02-01-2023", maintenanceDue: "20-06-2026", maxCargo: 16000, cost: 3257057 },
  { model: "Eicher Pro 6031", age: 7, plate: "HR-19-DZ-6613", regDate: "18-11-2018", maintenanceDue: "12-09-2026", maxCargo: 25000, cost: 3108003 },
];

export function buildInitialVehicles() {
  return RAW_TRUCKS.map((t, i) => ({
    id: i + 1,
    registrationNumber: t.plate,
    model: t.model,
    type: getVehicleType(t.model),
    age: t.age,
    region: getVehicleRegion(t.plate),
    regDate: t.regDate,
    maintenanceDue: t.maintenanceDue,
    maxCargo: t.maxCargo,
    cost: t.cost,
    odometer: 0,
    status: "Available",
  }));
}
