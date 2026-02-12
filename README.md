# Mech-Fuel 🚗⛽

A Full-Stack Emergency Road Services Platform

Built using MERN Stack Architecture

Mech-Fuel is a full-stack web application designed to provide emergency roadside assistance quickly and efficiently. The platform allows users to request fuel delivery or mechanical support directly to their location, making roadside emergencies easier to handle.

This project was built to simulate a real-world service platform with authentication, order management, admin control, and secure backend APIs.

The application follows a modular architecture separating frontend and backend, with secure RESTful APIs and role-based access control.

---

## 💡 What This Project Does

Mech-Fuel connects users with emergency road services in a simple and structured way.

### User Features
- Order petrol or diesel to their current location
- Request mechanical assistance (battery jump-start, tire change, towing, etc.)
- Select their service location using an interactive map
- Track and manage their service requests
- Manage their profile securely

### Admin Features
- View and manage all orders
- Monitor users and service providers
- Oversee service requests from a central dashboard

---

## 🛠 Tech Stack

### Frontend
- React 19
- Material UI (MUI)
- React Router DOM
- React Leaflet (for location selection)
- Fetch API for HTTP requests
- Context API for authentication state

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Helmet & Rate Limiting for security

---

## 🏗 Architecture Overview

Mech-Fuel follows a client-server architecture designed for scalability and security.

- The React frontend communicates with the Express backend through RESTful APIs.
- Authentication is handled using JWT tokens stored securely in localStorage.
- MongoDB stores user data, fuel orders, and mechanical service requests with proper indexing.
- Protected routes ensure only authenticated users can access secured pages.
- Role-based logic separates user, admin, and service provider functionalities.
- Middleware layer handles authentication, validation, error handling, and file uploads.
- Controllers manage business logic independently from routes and database operations.

---

## ⭐ Key Technical Highlights

- Implemented JWT-based authentication with refresh token strategy and protected routes.
- Designed modular RESTful APIs for fuel and mechanical service management with proper HTTP status codes.
- Integrated interactive maps using React Leaflet and Geosearch for real-time location selection.
- Applied rate limiting (100 requests per 15 minutes) and secure HTTP headers using Helmet to prevent API abuse.
- Structured backend using controllers, models, middleware, and routes for separation of concerns and scalability.
- Implemented input validation and sanitization using express-validator for data integrity.
- Used bcryptjs for secure password hashing with salt rounds.
- Configured CORS for secure cross-origin communication between frontend and backend.

---

## 🔐 Security Features

- Token-based authentication using JWT
- Password hashing using bcrypt
- Protected frontend routes
- API rate limiting
- Secure HTTP headers using Helmet
- Input validation on backend

---

## � Screenshots

### Landing Page
The main landing page with quick access to fuel delivery and mechanical assistance services.

### Fuel Order Flow
Step-by-step fuel ordering with location selection, quantity, and checkout.

### Admin Dashboard
Centralized admin panel for managing orders, monitoring users, and service requests.

### Map Selection
Interactive map using React Leaflet for precise location selection.

---

## �📂 Project Structure

The project is divided into two main parts:

- client/ → React frontend
- server/ → Express backend

Frontend handles UI, authentication flow, map selection, and checkout process.

Backend manages authentication, database operations, order handling, and API security.

---

## ⚙️ How to Run the Project

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file inside `server/`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

---

## 🌐 Running URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5001

---

## 📡 Main API Features

- User registration and login
- Create fuel orders
- Create mechanical service requests
- Admin order management
- Profile management
- Health check endpoint

---

## � Future Improvements

- Real-time service provider tracking using WebSockets
- Online payment gateway integration (Stripe/PayPal)
- Push notifications for order updates and status changes
- Automated deployment with CI/CD pipeline (GitHub Actions)
- Service provider ratings and reviews system
- Email notifications for order confirmations
- Mobile app using React Native for iOS and Android
- Advanced analytics dashboard for admin insights

---

## �👨‍💻 Author

Developed by Varun (varun77-nani)

---

## 📌 Project Purpose

This project was built as a full-stack application to demonstrate practical implementation of authentication, REST APIs, database integration, and frontend-backend communication in a real-world service-based scenario.