# Mech-Fuel 🚗⛽

Emergency Road Services Platform

Mech-Fuel is a full-stack web application designed to provide emergency roadside assistance quickly and efficiently. The platform allows users to request fuel delivery or mechanical support directly to their location, making roadside emergencies easier to handle.

This project was built to simulate a real-world service platform with authentication, order management, admin control, and secure backend APIs.

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
- Monitor users
- Oversee service requests from a central dashboard

---

## 🛠 Tech Stack

### Frontend
- React 19
- Material UI (MUI)
- React Router DOM
- React Leaflet (for location selection)
- Axios
- Context API for authentication state

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Helmet & Rate Limiting for security

---

## 🔐 Security Features

- Token-based authentication using JWT
- Password hashing using bcrypt
- Protected frontend routes
- API rate limiting
- Secure HTTP headers using Helmet
- Input validation on backend

---

## 📂 Project Structure

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

## 👨‍💻 Author

Developed by Varun (varun77-nani)

---

## 📌 Project Purpose

This project was built as a full-stack application to demonstrate practical implementation of authentication, REST APIs, database integration, and frontend-backend communication in a real-world service-based scenario.