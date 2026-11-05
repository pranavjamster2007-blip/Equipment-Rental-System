# Project 20: Equipment Rental System
**2nd Year College Internal Mark Project — Full Stack Web Application**

A full-stack equipment rental and inventory management system built with **ReactJS (Vite)**, **Node.js (Express)**, **MongoDB / Mongoose schemas**, and **JWT Authentication**.

---

## 🚀 How to Run Locally on Any Laptop (Windows / macOS / Linux)

### 1. Prerequisites
- **Node.js** (v18, v20, or v22 recommended)
- **npm** (included with Node.js)

### 2. Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the unified development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```
The server will automatically seed realistic equipment, categories, and test accounts.

---

## ⚡ How to Deploy on Vercel

This repository is pre-configured with `vercel.json` and `api/index.ts` for zero-configuration deployment to Vercel:

1. Push this repository to your **GitHub** account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Keep the default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build the React frontend and deploy the Express API as a serverless function automatically!

---

## 👥 Demo Logins for Project Evaluation / Viva

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@rental.edu` | `admin123` | Full control: Inventory CRUD, Categories, Users, Financial & Utilization Reports, ER Diagram |
| **Staff** | `staff@rental.edu` | `staff123` | Equipment checkout, pickup dispatch, return inspections, damage notes, deposit refunds |
| **Customer** | `customer@rental.edu` | `cust123` | Equipment catalog, booking reservation with deposit calculator, active rentals, receipts |

*(You can also use the **Demo Role Switch** bar at the top of the webpage for 1-click role switching during grading).*

---

## 🛠️ Tech Stack & Key Features

- **Frontend**: React 19, React Router v7, React Context API (`AuthContext`), Tailwind CSS, Controlled Forms with `event.preventDefault()`.
- **Backend**: Express.js REST API with separated routes, controllers, middleware, and database layers.
- **Security**: JSON Web Tokens (JWT) in Authorization Bearer headers, bcrypt password hashing.
- **7 Mongoose Models**: User, Equipment, Category, Booking, Rental, Inspection, Payment.
- **Features**: Live search, category and status filters, pricing sorting, pagination, damage fee calculation, deposit refund receipts, and analytics dashboard.
