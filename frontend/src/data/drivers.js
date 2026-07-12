// Driver master data, derived from drivers_data.xlsx (50 real rows; the
// remaining blank rows in the sheet were excluded).

export const DRIVER_STATUS_VALUES = ["Available", "On trip", "Off duty", "Suspended"];
export const LICENSE_CATEGORIES = ["HMV", "HPMV", "HTV", "HGMV"];

// dd-mm-yyyy -> Date
function parseDMY(str) {
  const [d, m, y] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isLicenseExpired(licenseValidity, today = new Date()) {
  return parseDMY(licenseValidity) < today;
}

export function daysUntilExpiry(licenseValidity, today = new Date()) {
  const diff = parseDMY(licenseValidity) - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const RAW_DRIVERS = [
  { name: "Gaurav Singh", age: 22, experience: 3, licenseValidity: "10-04-2028", status: "Available", licenseNumber: "PB-09-2005-2458591", licenseCategory: "HTV", contact: "9553035110", safetyScore: 56 },
  { name: "Rajesh Yadav", age: 27, experience: 9, licenseValidity: "03-07-2026", status: "Available", licenseNumber: "TN-02-2019-4335942", licenseCategory: "HGMV", contact: "9797808098", safetyScore: 79 },
  { name: "Anand Nair", age: 23, experience: 1, licenseValidity: "30-07-2026", status: "Off duty", licenseNumber: "DL-49-2007-8090293", licenseCategory: "HPMV", contact: "9398362082", safetyScore: 82 },
  { name: "Pankaj Chauhan", age: 53, experience: 2, licenseValidity: "04-10-2027", status: "Available", licenseNumber: "MH-07-2013-6770619", licenseCategory: "HMV", contact: "9384027113", safetyScore: 57 },
  { name: "Om Saxena", age: 55, experience: 27, licenseValidity: "31-12-2027", status: "Available", licenseNumber: "HR-36-2011-7067228", licenseCategory: "HPMV", contact: "9306468299", safetyScore: 64 },
  { name: "Satish Bhatt", age: 38, experience: 1, licenseValidity: "26-04-2027", status: "Available", licenseNumber: "PB-07-2014-5663623", licenseCategory: "HPMV", contact: "9782560971", safetyScore: 76 },
  { name: "Sunny Nair", age: 42, experience: 9, licenseValidity: "09-04-2027", status: "Available", licenseNumber: "HR-39-2022-3871230", licenseCategory: "HGMV", contact: "9882893941", safetyScore: 68 },
  { name: "Pankaj Bisht", age: 42, experience: 4, licenseValidity: "26-07-2026", status: "Available", licenseNumber: "MP-50-2003-4842788", licenseCategory: "HGMV", contact: "9964411347", safetyScore: 74 },
  { name: "Gopal Singh", age: 43, experience: 12, licenseValidity: "29-06-2028", status: "Available", licenseNumber: "PB-42-2017-7637601", licenseCategory: "HPMV", contact: "9592688426", safetyScore: 57 },
  { name: "Suresh Negi", age: 50, experience: 8, licenseValidity: "09-10-2029", status: "On trip", licenseNumber: "TN-28-2020-7700828", licenseCategory: "HMV", contact: "9335493870", safetyScore: 81 },
  { name: "Sanjay Chopra", age: 39, experience: 21, licenseValidity: "01-08-2029", status: "On trip", licenseNumber: "UP-41-2007-8082668", licenseCategory: "HTV", contact: "9168212356", safetyScore: 64 },
  { name: "Nitin Mishra", age: 25, experience: 1, licenseValidity: "31-01-2028", status: "Off duty", licenseNumber: "HR-44-2019-5476583", licenseCategory: "HMV", contact: "9465260635", safetyScore: 78 },
  { name: "Devendra Tiwari", age: 26, experience: 4, licenseValidity: "29-08-2026", status: "Off duty", licenseNumber: "RJ-33-2007-9517485", licenseCategory: "HMV", contact: "9771410971", safetyScore: 71 },
  { name: "Gopal Rathore", age: 50, experience: 24, licenseValidity: "09-05-2027", status: "On trip", licenseNumber: "MP-49-2007-9897858", licenseCategory: "HMV", contact: "9743111853", safetyScore: 80 },
  { name: "Mukesh Joshi", age: 34, experience: 9, licenseValidity: "30-04-2026", status: "Available", licenseNumber: "PB-04-2009-2321324", licenseCategory: "HMV", contact: "9885879795", safetyScore: 74 },
  { name: "Rajiv Saxena", age: 31, experience: 9, licenseValidity: "09-04-2028", status: "Off duty", licenseNumber: "GJ-36-2007-5446912", licenseCategory: "HTV", contact: "9751325257", safetyScore: 76 },
  { name: "Ajay Iyer", age: 45, experience: 9, licenseValidity: "28-12-2027", status: "Off duty", licenseNumber: "MH-43-2022-7264956", licenseCategory: "HTV", contact: "9655742829", safetyScore: 84 },
  { name: "Vivek Pandey", age: 24, experience: 2, licenseValidity: "20-11-2025", status: "Off duty", licenseNumber: "DL-38-2019-4860684", licenseCategory: "HGMV", contact: "9336456621", safetyScore: 55 },
  { name: "Arjun Reddy", age: 38, experience: 3, licenseValidity: "23-11-2027", status: "On trip", licenseNumber: "DL-22-2004-9626108", licenseCategory: "HGMV", contact: "9399012686", safetyScore: 68 },
  { name: "Nitin Rana", age: 41, experience: 7, licenseValidity: "15-02-2031", status: "Available", licenseNumber: "PB-31-2015-4194548", licenseCategory: "HMV", contact: "9204078666", safetyScore: 78 },
  { name: "Harish Rana", age: 50, experience: 10, licenseValidity: "30-06-2028", status: "Available", licenseNumber: "HR-04-2014-6692553", licenseCategory: "HMV", contact: "9366992705", safetyScore: 78 },
  { name: "Rakesh Chauhan", age: 56, experience: 35, licenseValidity: "22-06-2028", status: "Available", licenseNumber: "UP-18-2016-5191056", licenseCategory: "HMV", contact: "9575808013", safetyScore: 74 },
  { name: "Bhola Bhatt", age: 48, experience: 29, licenseValidity: "02-01-2030", status: "Available", licenseNumber: "PB-11-2015-9147706", licenseCategory: "HTV", contact: "9329509408", safetyScore: 64 },
  { name: "Mukesh Chauhan", age: 29, experience: 9, licenseValidity: "23-01-2031", status: "Available", licenseNumber: "RJ-30-2011-8096887", licenseCategory: "HTV", contact: "9884374109", safetyScore: 68 },
  { name: "Sanjay Bisht", age: 24, experience: 1, licenseValidity: "30-03-2027", status: "Available", licenseNumber: "RJ-14-2003-2022698", licenseCategory: "HGMV", contact: "9436730606", safetyScore: 66 },
  { name: "Gaurav Gupta", age: 48, experience: 20, licenseValidity: "29-03-2026", status: "Available", licenseNumber: "UP-04-2018-2344047", licenseCategory: "HMV", contact: "9173574218", safetyScore: 99 },
  { name: "Gopal Reddy", age: 59, experience: 30, licenseValidity: "18-06-2031", status: "Available", licenseNumber: "TN-16-2020-1666754", licenseCategory: "HGMV", contact: "9188029013", safetyScore: 82 },
  { name: "Naveen Chopra", age: 21, experience: 3, licenseValidity: "24-10-2026", status: "Available", licenseNumber: "RJ-14-2023-6271130", licenseCategory: "HMV", contact: "9385201412", safetyScore: 92 },
  { name: "Vivek Rana", age: 55, experience: 18, licenseValidity: "05-05-2029", status: "Available", licenseNumber: "HR-01-2016-2677407", licenseCategory: "HTV", contact: "9677280546", safetyScore: 78 },
  { name: "Deepak Tiwari", age: 48, experience: 6, licenseValidity: "13-08-2030", status: "Suspended", licenseNumber: "PB-24-2011-3646552", licenseCategory: "HGMV", contact: "9995226828", safetyScore: 76 },
  { name: "Amit Negi", age: 37, experience: 17, licenseValidity: "13-07-2027", status: "Available", licenseNumber: "KA-20-2023-2737893", licenseCategory: "HGMV", contact: "9383968123", safetyScore: 83 },
  { name: "Jitender Solanki", age: 27, experience: 5, licenseValidity: "22-03-2031", status: "Available", licenseNumber: "RJ-39-2008-6752576", licenseCategory: "HMV", contact: "9838194420", safetyScore: 85 },
  { name: "Rajiv Mishra", age: 30, experience: 6, licenseValidity: "04-05-2027", status: "Suspended", licenseNumber: "HR-41-2015-5641923", licenseCategory: "HMV", contact: "9103807155", safetyScore: 86 },
  { name: "Rohit Bisht", age: 54, experience: 1, licenseValidity: "28-02-2029", status: "Available", licenseNumber: "KA-46-2015-1162230", licenseCategory: "HPMV", contact: "9180792472", safetyScore: 63 },
  { name: "Umesh Kumar", age: 28, experience: 6, licenseValidity: "22-12-2028", status: "Available", licenseNumber: "MH-09-2003-6171716", licenseCategory: "HGMV", contact: "9954829815", safetyScore: 80 },
  { name: "Sunil Sharma", age: 36, experience: 3, licenseValidity: "27-06-2026", status: "Available", licenseNumber: "KA-27-2021-3592974", licenseCategory: "HGMV", contact: "9274484941", safetyScore: 61 },
  { name: "Raju Malhotra", age: 25, experience: 7, licenseValidity: "02-07-2031", status: "On trip", licenseNumber: "MH-43-2009-5476257", licenseCategory: "HGMV", contact: "9945436943", safetyScore: 71 },
  { name: "Devendra Yadav", age: 29, experience: 11, licenseValidity: "09-11-2030", status: "On trip", licenseNumber: "PB-30-2013-6120253", licenseCategory: "HTV", contact: "9339362341", safetyScore: 56 },
  { name: "Sameer Gupta", age: 37, experience: 17, licenseValidity: "10-04-2030", status: "Available", licenseNumber: "HR-50-2010-6891254", licenseCategory: "HTV", contact: "9646970178", safetyScore: 78 },
  { name: "Pankaj Solanki", age: 55, experience: 13, licenseValidity: "08-01-2029", status: "Off duty", licenseNumber: "HR-17-2007-5453786", licenseCategory: "HTV", contact: "9216396351", safetyScore: 99 },
  { name: "Harish Agarwal", age: 44, experience: 15, licenseValidity: "01-05-2031", status: "Off duty", licenseNumber: "HR-25-2020-4188992", licenseCategory: "HMV", contact: "9147659674", safetyScore: 84 },
  { name: "Satish Singh", age: 36, experience: 8, licenseValidity: "31-03-2026", status: "Off duty", licenseNumber: "MH-05-2023-6539837", licenseCategory: "HTV", contact: "9437064353", safetyScore: 72 },
  { name: "Kiran Kumar", age: 58, experience: 15, licenseValidity: "31-12-2027", status: "On trip", licenseNumber: "MH-21-2014-5960271", licenseCategory: "HPMV", contact: "9236674237", safetyScore: 82 },
  { name: "Amit Verma", age: 24, experience: 2, licenseValidity: "14-04-2026", status: "Available", licenseNumber: "TN-37-2011-7812810", licenseCategory: "HTV", contact: "9995205588", safetyScore: 80 },
  { name: "Suresh Mehta", age: 42, experience: 3, licenseValidity: "17-04-2031", status: "On trip", licenseNumber: "GJ-29-2016-4585314", licenseCategory: "HGMV", contact: "9608079792", safetyScore: 76 },
  { name: "Sunil Rathore", age: 52, experience: 14, licenseValidity: "04-01-2027", status: "Off duty", licenseNumber: "HR-49-2009-6207974", licenseCategory: "HTV", contact: "9966040317", safetyScore: 82 },
  { name: "Raju Solanki", age: 57, experience: 31, licenseValidity: "02-04-2028", status: "Suspended", licenseNumber: "TN-50-2004-8640615", licenseCategory: "HMV", contact: "9776205431", safetyScore: 71 },
  { name: "Vinod Thapa", age: 47, experience: 7, licenseValidity: "02-08-2026", status: "Off duty", licenseNumber: "PB-10-2022-1093026", licenseCategory: "HGMV", contact: "9935822550", safetyScore: 87 },
  { name: "Anil Agarwal", age: 48, experience: 12, licenseValidity: "11-04-2030", status: "Available", licenseNumber: "KA-16-2005-8658158", licenseCategory: "HTV", contact: "9960514523", safetyScore: 94 },
  { name: "Yogesh Iyer", age: 24, experience: 6, licenseValidity: "19-08-2026", status: "Available", licenseNumber: "TN-47-2018-8159521", licenseCategory: "HTV", contact: "9578796089", safetyScore: 85 },
];
export function buildInitialDrivers() {
  return RAW_DRIVERS.map((d, i) => ({
    id: i + 1,
    ...d,
  }));
}
