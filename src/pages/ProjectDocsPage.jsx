/**
 * ProjectDocsPage.jsx
 * Internal College Mark Evaluation Pack:
 * - Objective & Scope Compliance Checklist
 * - Visual Mongoose ER Diagram (7 Models)
 * - Exportable Postman API Collection
 * - Architecture & Viva Reference Guide
 */

import React, { useState } from 'react';
import {
  FileText,
  Database,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Server,
  Layers,
  Code2,
  ExternalLink,
} from 'lucide-react';

export default function ProjectDocsPage() {
  const [activeTab, setActiveTab] = useState('checklist');
  const [copied, setCopied] = useState(false);

  const postmanCollection = {
    info: {
      name: "Equipment Rental System - College Project #20 API Collection",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: "Postman collection covering all 7 Mongoose model Express routes with JWT Bearer authentication."
    },
    item: [
      {
        name: "1. Authentication",
        item: [
          { name: "Register User", request: { method: "POST", url: "{{BASE_URL}}/api/auth/register" } },
          { name: "Login User", request: { method: "POST", url: "{{BASE_URL}}/api/auth/login" } },
          { name: "Get Current Profile (Me)", request: { method: "GET", url: "{{BASE_URL}}/api/auth/me" } }
        ]
      },
      {
        name: "2. Equipment & Inventory",
        item: [
          { name: "Get All Equipment (Search, Filter, Pagination)", request: { method: "GET", url: "{{BASE_URL}}/api/equipment?category=All&status=Available&sortBy=price&page=1" } },
          { name: "Create Equipment (Admin/Staff)", request: { method: "POST", url: "{{BASE_URL}}/api/equipment" } },
          { name: "Update Equipment", request: { method: "PUT", url: "{{BASE_URL}}/api/equipment/:id" } },
          { name: "Delete Equipment (Admin)", request: { method: "DELETE", url: "{{BASE_URL}}/api/equipment/:id" } }
        ]
      },
      {
        name: "3. Categories",
        item: [
          { name: "Get Categories", request: { method: "GET", url: "{{BASE_URL}}/api/categories" } },
          { name: "Create Category", request: { method: "POST", url: "{{BASE_URL}}/api/categories" } }
        ]
      },
      {
        name: "4. Bookings",
        item: [
          { name: "Get Bookings", request: { method: "GET", url: "{{BASE_URL}}/api/bookings" } },
          { name: "Create Booking (Customer)", request: { method: "POST", url: "{{BASE_URL}}/api/bookings" } },
          { name: "Update Booking Status", request: { method: "PUT", url: "{{BASE_URL}}/api/bookings/:id/status" } }
        ]
      },
      {
        name: "5. Rentals & Inspections",
        item: [
          { name: "Get Rentals", request: { method: "GET", url: "{{BASE_URL}}/api/rentals" } },
          { name: "Process Pickup (Handover)", request: { method: "POST", url: "{{BASE_URL}}/api/rentals/pickup" } },
          { name: "Process Return (Checkout & Deposit)", request: { method: "POST", url: "{{BASE_URL}}/api/rentals/:id/return" } },
          { name: "Get Inspections", request: { method: "GET", url: "{{BASE_URL}}/api/inspections" } }
        ]
      },
      {
        name: "6. Payments",
        item: [
          { name: "Get Payments Ledger", request: { method: "GET", url: "{{BASE_URL}}/api/payments" } },
          { name: "Record Payment / Deposit", request: { method: "POST", url: "{{BASE_URL}}/api/payments" } }
        ]
      },
      {
        name: "7. Reports & Summary",
        item: [
          { name: "Get Dashboard Summary Stats", request: { method: "GET", url: "{{BASE_URL}}/api/reports/dashboard" } }
        ]
      }
    ]
  };

  const handleCopyPostman = () => {
    navigator.clipboard.writeText(JSON.stringify(postmanCollection, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPostman = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(postmanCollection, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Equipment_Rental_System_Postman.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Project Allocation: #20
            </span>
            <span className="text-xs text-gray-500 font-medium">Internal Mark Submission Dossier</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" />
            <span>Project Submission & Architecture Pack</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Verification of overview, scope, functional work, Mongoose models, and ER schema
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'checklist'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Objectives Checklist</span>
        </button>

        <button
          onClick={() => setActiveTab('er_diagram')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'er_diagram'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Mongoose ER Diagram</span>
        </button>

        <button
          onClick={() => setActiveTab('postman')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'postman'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Postman API Collection</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-3 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'credentials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Credentials & Viva Guide</span>
        </button>
      </div>

      {/* TAB 1: OBJECTIVES CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Project Requirements & Completion Matrix</span>
            </h2>

            <div className="space-y-3 text-xs">
              {[
                {
                  id: 1,
                  title: 'Authentication',
                  req: 'Registration, login, logout, JWT-protected APIs and password hashing (bcrypt).',
                  status: 'Completed',
                  impl: 'Implemented with Express JWT middleware, bcrypt 10 rounds salt, and safe auth context.',
                },
                {
                  id: 2,
                  title: 'Role Access',
                  req: 'Provide separate permissions and navigation for: Admin, Staff, Customer.',
                  status: 'Completed',
                  impl: 'Role-based authorization middleware + dynamic Navbar with distinct view permissions.',
                },
                {
                  id: 3,
                  title: 'Core Workflow',
                  req: 'Maintain rentable equipment, availability and pricing, create bookings, record pickup and return, deposits, damage notes and payments.',
                  status: 'Completed',
                  impl: 'End-to-end lifecycle from catalog booking -> pickup dispatch -> condition inspection -> return checkout & deposit refund.',
                },
                {
                  id: 4,
                  title: 'Data Management',
                  req: 'Create CRUD screens and Express APIs for: User, Equipment, Category, Booking, Rental, Inspection, Payment.',
                  status: 'Completed',
                  impl: 'All 7 Mongoose models have dedicated controllers, validation, and React screens.',
                },
                {
                  id: 5,
                  title: 'List Features',
                  req: 'Provide search, filters, pagination and suitable sorting for main records.',
                  status: 'Completed',
                  impl: 'Equipped with search keywords, Category & Status dropdown filters, price/date sorting, and pagination controls.',
                },
                {
                  id: 6,
                  title: 'Validation',
                  req: 'Validate required fields in React forms and again in the Express API.',
                  status: 'Completed',
                  impl: 'Double-tier validation: Frontend state checks before submit + Express backend 400 Bad Request error handlers.',
                },
                {
                  id: 7,
                  title: 'Feedback States',
                  req: 'Show loading, empty, success and error states for API operations.',
                  status: 'Completed',
                  impl: 'LoadingSpinner, EmptyState with call-to-actions, and AlertBanner components for error/success notifications.',
                },
                {
                  id: 8,
                  title: 'Reports',
                  req: 'Add at least one useful summary dashboard or report based on project records.',
                  status: 'Completed',
                  impl: 'Dashboard with revenue breakdown, active vs available inventory ratios, category distribution, and recent activity.',
                },
              ].map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">
                      {item.id}. {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ {item.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{item.req}</p>
                  <p className="text-blue-700 font-medium text-[11px]">→ {item.impl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ER DIAGRAM */}
      {activeTab === 'er_diagram' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>MongoDB Mongoose Schema & Entity-Relationship (ER) Diagram</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Showing relationships between the 7 Mongoose models: User, Equipment, Category, Booking, Rental, Inspection, Payment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* User Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-purple-200">
              <div className="font-bold text-purple-900 text-sm mb-2 pb-1 border-b border-purple-200">
                1. User
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-purple-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-purple-600">name:</span> String (Required)</li>
                <li><span className="text-purple-600">email:</span> String (Unique, Indexed)</li>
                <li><span className="text-purple-600">password:</span> String (bcrypt hash)</li>
                <li><span className="text-purple-600">role:</span> Enum ['Admin','Staff','Customer']</li>
                <li><span className="text-purple-600">phone:</span> String</li>
                <li><span className="text-purple-600">address:</span> String</li>
              </ul>
            </div>

            {/* Category Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-indigo-200">
              <div className="font-bold text-indigo-900 text-sm mb-2 pb-1 border-b border-indigo-200">
                2. Category
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-indigo-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-indigo-600">name:</span> String (Required, Unique)</li>
                <li><span className="text-indigo-600">description:</span> String</li>
                <li><span className="text-indigo-600">icon:</span> String</li>
              </ul>
            </div>

            {/* Equipment Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-blue-200">
              <div className="font-bold text-blue-900 text-sm mb-2 pb-1 border-b border-blue-200">
                3. Equipment
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-blue-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-blue-600">name:</span> String (Required)</li>
                <li><span className="text-blue-600">categoryId:</span> ObjectId (FK → Category)</li>
                <li><span className="text-blue-600">dailyRate:</span> Number (Required)</li>
                <li><span className="text-blue-600">securityDeposit:</span> Number</li>
                <li><span className="text-blue-600">status:</span> Enum ['Available','Booked','Rented','Maintenance']</li>
                <li><span className="text-blue-600">condition:</span> Enum ['Excellent','Good','Fair','Damaged']</li>
                <li><span className="text-blue-600">modelNumber:</span> String</li>
                <li><span className="text-blue-600">serialNumber:</span> String</li>
              </ul>
            </div>

            {/* Booking Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-amber-200">
              <div className="font-bold text-amber-900 text-sm mb-2 pb-1 border-b border-amber-200">
                4. Booking
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-amber-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-amber-600">bookingNumber:</span> String (Unique)</li>
                <li><span className="text-amber-600">customerId:</span> ObjectId (FK → User)</li>
                <li><span className="text-amber-600">equipmentId:</span> ObjectId (FK → Equipment)</li>
                <li><span className="text-amber-600">startDate:</span> Date</li>
                <li><span className="text-amber-600">endDate:</span> Date</li>
                <li><span className="text-amber-600">totalDays:</span> Number</li>
                <li><span className="text-amber-600">totalAmount:</span> Number</li>
                <li><span className="text-amber-600">depositAmount:</span> Number</li>
                <li><span className="text-amber-600">status:</span> Enum ['Pending','Confirmed','Cancelled','Completed']</li>
              </ul>
            </div>

            {/* Rental Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-emerald-200">
              <div className="font-bold text-emerald-900 text-sm mb-2 pb-1 border-b border-emerald-200">
                5. Rental
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-emerald-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-emerald-600">rentalNumber:</span> String (Unique)</li>
                <li><span className="text-emerald-600">bookingId:</span> ObjectId (FK → Booking)</li>
                <li><span className="text-emerald-600">customerId:</span> ObjectId (FK → User)</li>
                <li><span className="text-emerald-600">equipmentId:</span> ObjectId (FK → Equipment)</li>
                <li><span className="text-emerald-600">staffId:</span> ObjectId (FK → User)</li>
                <li><span className="text-emerald-600">pickupDate:</span> Date</li>
                <li><span className="text-emerald-600">expectedReturnDate:</span> Date</li>
                <li><span className="text-emerald-600">actualReturnDate:</span> Date (Nullable)</li>
                <li><span className="text-emerald-600">status:</span> Enum ['Active','Returned','Overdue']</li>
              </ul>
            </div>

            {/* Inspection Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-rose-200">
              <div className="font-bold text-rose-900 text-sm mb-2 pb-1 border-b border-rose-200">
                6. Inspection
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-rose-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-rose-600">rentalId:</span> ObjectId (FK → Rental)</li>
                <li><span className="text-rose-600">equipmentId:</span> ObjectId (FK → Equipment)</li>
                <li><span className="text-rose-600">inspectorId:</span> ObjectId (FK → User)</li>
                <li><span className="text-rose-600">inspectionType:</span> Enum ['Pickup','Return']</li>
                <li><span className="text-rose-600">conditionRating:</span> Enum ['Excellent','Good','Fair','Damaged']</li>
                <li><span className="text-rose-600">damageNotes:</span> String</li>
                <li><span className="text-rose-600">repairCostEstimate:</span> Number</li>
                <li><span className="text-rose-600">cleanState:</span> Boolean</li>
              </ul>
            </div>

            {/* Payment Schema */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-teal-200">
              <div className="font-bold text-teal-900 text-sm mb-2 pb-1 border-b border-teal-200">
                7. Payment
              </div>
              <ul className="space-y-1 text-gray-700">
                <li><span className="text-teal-600">_id:</span> ObjectId (PK)</li>
                <li><span className="text-teal-600">paymentNumber:</span> String (Unique)</li>
                <li><span className="text-teal-600">rentalId:</span> ObjectId (FK → Rental)</li>
                <li><span className="text-teal-600">customerId:</span> ObjectId (FK → User)</li>
                <li><span className="text-teal-600">amount:</span> Number (Required)</li>
                <li><span className="text-teal-600">paymentType:</span> Enum ['Deposit','Rental Fee','Damage Fee','Refund']</li>
                <li><span className="text-teal-600">paymentMethod:</span> Enum ['Cash','Credit Card','Debit Card','UPI','Net Banking']</li>
                <li><span className="text-teal-600">transactionId:</span> String</li>
                <li><span className="text-teal-600">paymentDate:</span> Date</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POSTMAN COLLECTION */}
      {activeTab === 'postman' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <span>Postman API Collection JSON</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Export and import into Postman Desktop or Web to execute and test all Express routes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPostman}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied JSON!' : 'Copy to Clipboard'}</span>
              </button>
              <button
                onClick={handleDownloadPostman}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-gray-900 text-emerald-400 rounded-xl text-xs font-mono max-h-96 overflow-y-auto">
            {JSON.stringify(postmanCollection, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB 4: CREDENTIALS & VIVA */}
      {activeTab === 'credentials' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">Default Pre-seeded Demo Credentials</h2>
            <p className="text-xs text-gray-500 mb-4">Use these accounts during teacher demonstration and grading:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="font-bold text-purple-900 text-sm mb-1">Admin Account</div>
                <div className="text-purple-700">Email: <span className="font-mono font-bold">admin@rental.edu</span></div>
                <div className="text-purple-700">Password: <span className="font-mono font-bold">admin123</span></div>
                <p className="mt-2 text-[11px] text-purple-600">Permissions: Full system control, reports, inventory CRUD, user management.</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-900 text-sm mb-1">Staff Account</div>
                <div className="text-blue-700">Email: <span className="font-mono font-bold">staff@rental.edu</span></div>
                <div className="text-blue-700">Password: <span className="font-mono font-bold">staff123</span></div>
                <p className="mt-2 text-[11px] text-blue-600">Permissions: Pickup dispatch, return checkout inspection, damage fee entry.</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="font-bold text-emerald-900 text-sm mb-1">Customer Account</div>
                <div className="text-emerald-700">Email: <span className="font-mono font-bold">customer@rental.edu</span></div>
                <div className="text-emerald-700">Password: <span className="font-mono font-bold">cust123</span></div>
                <p className="mt-2 text-[11px] text-emerald-600">Permissions: Equipment catalog, online booking, payment receipts.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">Viva Technical Architecture Overview</h3>
            <p>
              • <strong>Frontend:</strong> React 19 with Vite, pure React Context API (<code className="bg-gray-100 px-1">AuthContext.jsx</code>), React Router v7, controlled input forms adhering to <code className="bg-gray-100 px-1">event.preventDefault()</code>, and Tailwind CSS.
            </p>
            <p>
              • <strong>Backend:</strong> Node.js + ExpressJS modular architecture separated into <code className="bg-gray-100 px-1">server/controllers</code>, <code className="bg-gray-100 px-1">server/routes</code>, <code className="bg-gray-100 px-1">server/middleware</code>, and <code className="bg-gray-100 px-1">server/models</code>.
            </p>
            <p>
              • <strong>Security:</strong> JSON Web Tokens (JWT) signed with HS256, Authorization Bearer header parsing, and password hashing using bcrypt.
            </p>
            <p>
              • <strong>Database:</strong> MongoDB Mongoose schemas with indexed collections, ObjectId references, field validation, and pre-seeded college inventory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
