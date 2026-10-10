# Philippine Red Cross - Blood Services Information System (PRC-BSIS)

A functional V1.1 web application prototype designed to digitize and manage the operational workflows of the Philippine Red Cross blood services. The system features secure role-based access for voluntary donors, chapter staff, attending physicians, and system administrators.

## Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS v4 (Using modern `@theme` architecture)
* **Routing:** React Router v6 (Nested Layouts)
* **Backend / BaaS:** Supabase
* **Authentication:** Supabase Auth
* **Database:** PostgreSQL

## Key Features (v1.1)

* **Role-Based Access Control:** Secure routing that verifies user roles (Donor, Staff, Physician, Admin) directly against the database upon login.
* **Dynamic Registration:** Context-aware signup forms that automatically generate Donor Identification Numbers (DIN) and capture specific demographic data (birthdate, sex, blood group) exclusively for donor accounts.
* **Nested Dashboard Architecture:** Persistent navigation and consistent state management across different portal views using React Router `<Outlet/>`.
* **Live Database Integration:** Real-time fetching of user profiles, dynamic welcome headers, and active state tracking.
* **Public Supply Directory:** A standalone, unauthenticated view for the public to check real-time blood availability across regional chapters.

## Database Schema Overview

The application relies on a relational PostgreSQL database. Ensure the following core tables are configured in your Supabase instance:

* **`profiles`**: Stores user metadata linked to Supabase Auth.
* Columns: `id` (uuid, PK), `role` (text), `full_name` (text), `din` (text, nullable), `birthdate` (date, nullable), `sex` (text, nullable), `blood_group` (text, nullable).


* **`appointments`**: Tracks donor schedules and physical screening outcomes.
* Columns: `id` (uuid, PK), `donor_id` (uuid, FK), `scheduled_date` (timestamp), `venue` (text), `status` (text), `deferral_reason` (text).


* **`blood_units`**: Tracks the physical inventory lifecycle.
* Columns: `unit_id` (text, PK), `donor_id` (uuid, FK), `appointment_id` (uuid, FK), `component_type` (text), `collection_date` (timestamp), `status` (text).



## Prerequisites

* Node.js (v18 or higher)
* A Supabase account and project

## Installation & Setup

1. **Clone the repository and install dependencies:**
```bash
npm install

```


2. **Configure Environment Variables:**
Create a `.env` file in the root directory of the project and add your Supabase credentials. Use the modern Publishable Key, not the legacy anon key.
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here

```


3. **Database Configuration:**
* Disable email confirmation in your Supabase Dashboard (`Authentication > Providers > Email > Confirm email`) for local prototyping and debugging.
* Ensure your PostgreSQL tables (`profiles`, etc.) are created according to the schema overview.


4. **Run the Development Server:**
```bash
npm run dev

```



## Project Structure

```text
src/
├── components/          # Reusable UI components
├── lib/
│   └── supabase.js      # Supabase client initialization
├── pages/
│   ├── admin/           # Administrator views (Audit Logs)
│   ├── donor/           # Voluntary Donor portal
│   │   ├── Dashboard.jsx
│   │   ├── BookAppointment.jsx
│   │   └── DonorLayout.jsx
│   ├── physician/       # Hospital attending physician portal
│   ├── staff/           # Chapter staff & MedTech portal
│   │   ├── Dashboard.jsx
│   │   ├── InventoryLedger.jsx
│   │   ├── SerologicalEntry.jsx
│   │   ├── TransferCoord.jsx
│   │   └── StaffLayout.jsx
│   ├── Login.jsx        # Unified Authentication & Registration
│   └── PublicBoard.jsx  # Public blood directory
├── App.jsx              # Main application router
├── index.css            # Tailwind v4 configuration and global styles
└── main.jsx             # React entry point

```