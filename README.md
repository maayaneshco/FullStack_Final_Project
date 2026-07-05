# Full Stack Final Project 2026 - LabHub

## Backend Overview
LabHub is a Full Stack laboratory management system developed as an Advanced Full Stack final project.
The system is designed for academic research laboratories and provides a centralized platform for managing research projects, laboratory tasks, responsibilities, equipment, inventory, protocol documents, bookings, user authentication, and dashboard statistics.
This repository contains the complete Backend implementation built with Node.js, Express, MongoDB, and Mongoose.

# Features
* Authentication
    - User Registration
    - User Login
    - JWT Authentication
    - Password Hashing using bcrypt
    - Protected Routes
    - Role-Based Authorization (Admin / Researcher)

* User Management
    - View Profile
    - Update Profile
    - Change Password

* Project Management
    - Create Project
    - Update Project
    - Delete Project
    - View User Projects
    - Project Members Management
    - Project Tasks

# Task Management
Supports two task types: Project Tasks and Laboratory Tasks.

* Features:
    - Create Tasks
    - Update Tasks
    - Delete Tasks
    - Assign Multiple Users
    - Update Task Status
    - Completed Tasks
    - Overdue Tasks
    - My Laboratory Tasks
    -mMy Project Tasks

# Responsibilities

* Create Responsibilities
* Update Responsibilities
* Soft Delete
* My Responsibilities


# Inventory Management

* Create Inventory Items
* Update Inventory
* Soft Delete
* Low Stock Detection
* Expired Inventory Detection

# Equipment Management

* Equipment CRUD
* Availability Status
* Maintenance Status
* Soft Delete

# Equipment Booking

* Create Booking
* Update Booking
* Cancel Booking
* View Equipment Bookings
* View My Bookings

# Protocol Library

* Upload Protocol Files
* Download Files
* Search by Title
* Search by Category
* Soft Delete
* Supported File Types: PDF, DOC, DOCX
* Maximum Upload Size: 10 MB

# Dashboard API

* Provides summarized laboratory statistics:
    - Total Projects
    - Total Tasks
    - Open Tasks
    - Completed Tasks
    - Active Bookings
    - Available Equipment
    - Low Stock Items
    - Expired Inventory
    - Total Protocols

* Includes recent activity lists for:
    - Projects
    - Tasks
    - Bookings
    - Protocols

Dashboard queries are optimized using Promise.all().

# Technology Stack
* Backend
    - Node.js
    - Express.js

* Database
    - MongoDB
    - Mongoose

* Authentication
    - JWT
    - bcrypt

* Security
    - Helmet
    - CORS
    - express-rate-limit

* Validation
    - Mongoose Validation
    - Controller Validation

* File Upload
    - Multer


# Project Structure
```
server/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
│
│   └── protocols/
│
├── utils/
│
├── app.js
├── server.js
└── .env
```

# Architecture
The backend follows a simple MVC architecture.

```
Client 

↓

Routes

↓

Middleware

↓

Controllers

↓

Models

↓

MongoDB
```

Business logic is implemented inside Controllers.

Routes remain lightweight and only define API endpoints.


# Authentication Flow

1. User registers using:

   * First Name
   * Last Name
   * Email
   * Password
   * Lab Position
   * Laboratory Access Code

2. Password is hashed using bcrypt.

3. JWT token is generated.

4. Protected endpoints require:

```
Authorization: Bearer <token>
```

5. User roles determine authorization level.


# User Roles

* Researcher - Can:
    - Access laboratory resources
    - Manage assigned work
    - Create projects
    - Create tasks
    - Upload protocols
    - Book equipment

* Admin - Has full system access including:
    - Inventory Management
    - Equipment Management
    - Responsibilities Management
    - User Administration


# REST API
Main endpoints:
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/change-password

GET    /api/projects
POST   /api/projects

GET    /api/tasks

GET    /api/inventory

GET    /api/equipment

GET    /api/bookings

GET    /api/protocols

GET    /api/dashboard
```

# Environment Variables
Create a `.env` file containing:
```
PORT=

MONGO_URI=

JWT_SECRET=

JWT_EXPIRE=

LAB_ACCESS_CODE=

CLIENT_URL=
```

# Installation
Clone the repository

```
git clone <repository-url>
```

Install dependencies

```
npm install
```

Configure environment variables

```
Create .env
```

Run development server

```
npm run dev
```

Production

```
npm start
```

# Security

The backend includes:
* JWT Authentication
* Password Hashing (bcrypt)
* Role-Based Authorization
* Helmet
* CORS
* Rate Limiting
* Protected Routes
* Environment Variables
* Secure File Upload Validation

# Database
MongoDB collections:
* Users
* Projects
* Tasks
* Responsibilities
* Inventory
* Equipment
* Bookings
* Protocols

Relationships are implemented using MongoDB ObjectId references.

# Error Handling
The API returns consistent JSON responses.
Example:
```json
{
    "message": "Resource not found"
}
```

Status Codes:
* 200 OK
* 201 Created
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 500 Internal Server Error

# Future Frontend
The backend is designed to integrate with a React frontend using:
* React
* React Router
* Context API
* Redux Toolkit
* Tailwind CSS

# Author
* Maayan Eshco 207175761
