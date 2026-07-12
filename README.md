TransitOps 🚛
Smart Transport Operations Platform

TransitOps is a lightweight, full-stack, role-based logistics and fleet management terminal designed for a 20-truck, 50-driver Indian long-haul fleet. It features a custom UI, real-time analytics, and a live, browser-embedded SQLite database powered by WebAssembly (WASM), making it incredibly fast and self-contained while offering a clear pathway to a traditional server-side database architecture.

🌟 Key Features
🔐 Role-Based Access Control (RBAC)
The platform adapts its UI and capabilities based on the logged-in user:

Fleet Manager: Full administrative control over vehicles, drivers, trips, maintenance, and the SQL console.

Driver: Focused view of personal trip manifests and assigned vehicle status.

Safety Officer: Dedicated views for monitoring driver license validity, safety scores, and compliance metrics.

Financial Analyst: Access to detailed cost, revenue, and ROI analytics.

📊 Live Command Dashboard
A real-time snapshot of fleet operations computed directly from SQL aggregates. Includes:

Fleet Utilization metrics.

Alerts for expiring driver licenses (under 45 days) and upcoming vehicle maintenance (under 21 days).

Live counts of dispatched trips, available vehicles, and active drivers.

🛣️ Comprehensive Operations Management
Vehicle Registry: Track truck models, registration plates, cargo capacities, odometer readings, and maintenance schedules.

Driver Roster: Manage driver profiles, license categories (HMV, LMV, etc.), experience, and safety scores.

Trip Manifest: Create and dispatch trips. Changing a trip to "Dispatched" or "Completed" automatically updates the assigned driver and vehicle statuses.

Maintenance Logs: Record service types, dates, and costs. Logging an "Active" maintenance task automatically flags the vehicle as unavailable.

📈 Analytics & Reporting
Integrated with Chart.js to visualize data directly from the SQL database:

Fleet Composition by Vehicle Type.

Vehicle Status Split (Available, On Trip, Maintenance).

Trip Status Funnels.

Maintenance Cost per Vehicle.

💻 Embedded SQL Console
A built-in sandbox for Fleet Managers to run raw SELECT queries directly against the live embedded database to pull custom reports on the fly.

🛠️ Tech Stack
Frontend

HTML5 / CSS3 (Custom Tailwind-inspired styling)

Vanilla JavaScript

Chart.js (Data Visualization)

sql.js (WebAssembly SQLite port)

Backend Architecture

Node.js

Express.js (Routing and static file serving)

sqlite3 (Ready for server-side migration)

📂 Project Structure
Plaintext
transit-ops/
├── package.json          # Node dependencies and scripts
├── server.js             # Express backend server setup
├── database.js           # Server-side SQLite connection (Roadmap)
└── public/               # Frontend Assets
    ├── index.html        # Main application entry point
    ├── style.css         # UI styling and animations
    └── app.js            # Core application logic, routing, and DB queries
🚀 Installation & Setup
Follow these steps to get the project running on your local machine.

Clone the Repository:

Bash
git clone https://github.com/yourusername/transit-ops.git
cd transit-ops
Install Backend Dependencies:
Ensure you have Node.js installed, then run:

Bash
npm install
Start the Server:

Bash
npm start
Access the Application:
Open your browser and navigate to:

Plaintext
http://localhost:3000
💾 How the Data Works (Current State)
Currently, the application utilizes sql.js to run a complete SQLite database inside your browser's memory.

Seeding: On the first load, the app automatically generates the schema and seeds it with real-world data (20 trucks, 50 drivers, 30 trips).

Persistence: Changes made during your session are serialized into base64 and saved in your browser's localStorage so you do not lose data on refresh.

🗺️ Roadmap & Future Migrations
The current architecture is intentionally structured to allow for an easy migration from client-side data storage to a traditional backend database.

API Route Integration: Migrate the raw db.run() and q() calls in app.js to fetch() requests pointing to the Express backend.

Backend SQLite: Fully utilize the database.js file to handle CRUD operations on the server side using the sqlite3 npm package.

Authentication: Replace the mock RBAC login screen with JWT-based authentication.

📝 License
This project is open-source and available under the MIT License.

Developed by Prragun Marwah and ANgad singh
