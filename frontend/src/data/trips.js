// Trip data, derived from trips_data.xlsx.
// Draft trips in the source sheet used "TBD" placeholders for fields that
// hadn't been assigned yet (vehicle, driver, distance, times) — those are
// normalized to null here.

export const TRIP_STATUS_VALUES = ["Draft", "Dispatched", "Completed", "Cancelled"];

export const RAW_TRIPS = [
  { source: "Chandigarh", destination: "Hyderabad", vehicle: "UP-04-EU-8624", driver: "Om Tiwari", cargoWeight: 18000, plannedDistance: 560, departureDate: "2026-06-16", departureTime: "03:00", arrivalDate: "2026-06-16", arrivalTime: "16:12", status: "Completed" },
  { source: "Bengaluru", destination: "Mumbai", vehicle: "HR-85-DN-4265", driver: "Pankaj Saxena", cargoWeight: 24000, plannedDistance: 410, departureDate: "2026-07-04", departureTime: "08:00", arrivalDate: "2026-07-04", arrivalTime: "20:51", status: "Completed" },
  { source: "Delhi", destination: "Bengaluru", vehicle: "DL-74-UN-1812", driver: "Vijay Das", cargoWeight: 18000, plannedDistance: 220, departureDate: "2026-05-31", departureTime: "23:00", arrivalDate: "2026-06-01", arrivalTime: "03:45", status: "Completed" },
  { source: "Hyderabad", destination: "Patna", vehicle: "MH-17-BZ-6796", driver: "Chandra Negi", cargoWeight: 18000, plannedDistance: 220, departureDate: "2026-05-28", departureTime: "08:00", arrivalDate: "2026-05-28", arrivalTime: "14:22", status: "Completed" },
  { source: "Surat", destination: "Varanasi", vehicle: "RJ-17-ZH-7519", driver: "Prakash Das", cargoWeight: 9500, plannedDistance: 780, departureDate: "2026-06-24", departureTime: "09:00", arrivalDate: "2026-06-25", arrivalTime: "02:12", status: "Completed" },
  { source: "Varanasi", destination: "Pune", vehicle: "PB-26-SR-6825", driver: "Jitender Tiwari", cargoWeight: 12000, plannedDistance: 480, departureDate: "2026-07-07", departureTime: "00:00", arrivalDate: "2026-07-07", arrivalTime: "12:33", status: "Completed" },
  { source: "Pune", destination: "Ludhiana", vehicle: "MP-44-YM-9137", driver: "Prakash Rana", cargoWeight: 21000, plannedDistance: 950, departureDate: "2026-07-09", departureTime: "05:00", arrivalDate: "2026-07-09", arrivalTime: "23:22", status: "Completed" },
  { source: "Guwahati", destination: "Kanpur", vehicle: "RJ-01-EP-9758", driver: "Vikram Rawat", cargoWeight: 21000, plannedDistance: 340, departureDate: "2026-06-04", departureTime: "09:00", arrivalDate: "2026-06-04", arrivalTime: "17:49", status: "Completed" },
  { source: "Varanasi", destination: "Dehradun", vehicle: "HR-68-ZE-8107", driver: "Ajay Iyer", cargoWeight: 15000, plannedDistance: 620, departureDate: "2026-06-21", departureTime: "10:00", arrivalDate: "2026-06-22", arrivalTime: "04:45", status: "Completed" },
  { source: "Gurugram", destination: "Pune", vehicle: "KA-51-NN-7457", driver: "Dinesh Nair", cargoWeight: 9500, plannedDistance: 340, departureDate: "2026-06-14", departureTime: "09:00", arrivalDate: "2026-06-14", arrivalTime: "19:06", status: "Completed" },
  { source: "Chandigarh", destination: "Dehradun", vehicle: "TN-47-RD-2889", driver: "Vikram Chopra", cargoWeight: 15000, plannedDistance: 950, departureDate: "2026-07-12", departureTime: "07:00", arrivalDate: "2026-07-13", arrivalTime: "2:00 (Tentative)", status: "Dispatched" },
  { source: "Chandigarh", destination: "Ranchi", vehicle: "DL-14-AU-3478", driver: "Ravi Thapa", cargoWeight: 12000, plannedDistance: 700, departureDate: "2026-07-12", departureTime: "08:00", arrivalDate: "2026-07-12", arrivalTime: "22:00 (Tentative)", status: "Dispatched" },
  { source: "Surat", destination: "Chandigarh", vehicle: "KA-47-FM-4650", driver: "Dinesh Mishra", cargoWeight: 24000, plannedDistance: 480, departureDate: "2026-07-11", departureTime: "19:00", arrivalDate: "2026-07-12", arrivalTime: "3:54 (Tentative)", status: "Dispatched" },
  { source: "Kolkata", destination: "Bengaluru", vehicle: "GJ-37-VC-2934", driver: "Anil Reddy", cargoWeight: 15000, plannedDistance: 410, departureDate: "2026-07-11", departureTime: "15:00", arrivalDate: "2026-07-12", arrivalTime: "1:30 (Tentative)", status: "Dispatched" },
  { source: "Chandigarh", destination: "Varanasi", vehicle: "UP-67-AG-9654", driver: "Rajesh Gupta", cargoWeight: 9500, plannedDistance: 950, departureDate: "2026-07-11", departureTime: "20:00", arrivalDate: "2026-07-12", arrivalTime: "23:06 (Tentative)", status: "Dispatched" },
  { source: "Amritsar", destination: "Delhi", vehicle: null, driver: null, cargoWeight: null, plannedDistance: null, departureDate: null, departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Kolkata", destination: "Pune", vehicle: null, driver: null, cargoWeight: 9500, plannedDistance: null, departureDate: null, departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Chandigarh", destination: "Lucknow", vehicle: null, driver: null, cargoWeight: 24000, plannedDistance: 560, departureDate: "2026-07-18", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Chandigarh", destination: "Jaipur", vehicle: null, driver: "Satish Rathore", cargoWeight: 9500, plannedDistance: 1250, departureDate: null, departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Bhopal", destination: "Hyderabad", vehicle: null, driver: null, cargoWeight: 9500, plannedDistance: 480, departureDate: "2026-07-28", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Ludhiana", destination: "Mumbai", vehicle: null, driver: null, cargoWeight: null, plannedDistance: 340, departureDate: "2026-08-06", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Cancelled" },
  { source: "Dehradun", destination: "Varanasi", vehicle: "HR-85-DN-4265", driver: "Pankaj Chopra", cargoWeight: 8000, plannedDistance: null, departureDate: null, departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Mumbai", destination: "Varanasi", vehicle: "DL-74-UN-1812", driver: "Ashish Mishra", cargoWeight: null, plannedDistance: 780, departureDate: "2026-08-09", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Indore", destination: "Amritsar", vehicle: "MH-17-BZ-6796", driver: "Vivek Negi", cargoWeight: 12000, plannedDistance: 780, departureDate: null, departureTime: null, arrivalDate: null, arrivalTime: null, status: "Cancelled" },
  { source: "Mumbai", destination: "Chandigarh", vehicle: null, driver: null, cargoWeight: 27000, plannedDistance: 410, departureDate: "2026-08-08", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Bengaluru", destination: "Kolkata", vehicle: "PB-26-SR-6825", driver: null, cargoWeight: null, plannedDistance: 220, departureDate: null, departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Patna", destination: "Dehradun", vehicle: "MP-44-YM-9137", driver: null, cargoWeight: 27000, plannedDistance: 480, departureDate: "2026-07-22", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Varanasi", destination: "Hyderabad", vehicle: "RJ-01-EP-9758", driver: null, cargoWeight: 12000, plannedDistance: null, departureDate: "2026-08-01", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Surat", destination: "Jaipur", vehicle: null, driver: "Sandeep Mishra", cargoWeight: null, plannedDistance: 480, departureDate: "2026-07-16", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
  { source: "Ranchi", destination: "Varanasi", vehicle: null, driver: "Sanjay Mehta", cargoWeight: 24000, plannedDistance: null, departureDate: "2026-08-01", departureTime: null, arrivalDate: null, arrivalTime: null, status: "Draft" },
];
export function buildInitialTrips() {
  return RAW_TRIPS.map((t, i) => ({
    id: i + 1,
    ...t,
  }));
}
