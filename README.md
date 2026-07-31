# 📱 Internal Reporting System - Mobile Application

A cross-platform **React Native** mobile application built with **Expo** for the **Internal Reporting System**.

The application enables employees and reviewers to manage reports from anywhere by connecting to the existing **Node.js (Express)** backend through REST APIs.

---

## ✨ Features

### Employee
- Secure authentication
- Submit scheduled reports
- Upload supporting attachments
- View submitted reports
- Track report status
- Receive notifications

### Reviewer
- View pending reports
- Approve reports
- Reject reports
- Request report revisions

### Authentication
- JWT-based authentication
- Persistent login session
- Role-based navigation

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Mobile application |
| Expo | Development platform |
| JavaScript | Programming language |
| React Navigation | App navigation |
| Axios | API communication |
| Context API | Authentication state |
| Express.js | Backend API |
| PostgreSQL / MySQL | Database |

---

# 📂 Project Structure

```
mobile/
│
├── App.js
├── src/
│   ├── api/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   └── utils/
│
├── assets/
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
cd mobile
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start the development server

```bash
npx expo start
```

---

## Running the application

Once Expo starts, you can choose one of the following:

- Press **a** → Android Emulator
- Press **i** → iOS Simulator (macOS only)
- Scan the QR code using the **Expo Go** application on your mobile device

---

# 🔗 Backend Configuration

The mobile application communicates with an existing Express backend.

Configure the API URL inside:

```
src/constants/config.js
```

Example:

```javascript
export const API_BASE_URL = "http://192.168.1.20:5000/api";
```

Use the appropriate URL depending on your environment.

| Environment | API URL |
|-------------|---------|
| Android Emulator | http://10.0.2.2:5000/api |
| iOS Simulator | http://localhost:5000/api |
| Physical Device | http://YOUR_LOCAL_IP:5000/api |

> **Note**
>
> When testing on a physical device, ensure:
>
> - Both the phone and computer are connected to the same Wi-Fi network.
> - The backend server is running.
> - Firewall settings allow incoming connections.

---

# 🔐 Authentication

The application uses **JWT Authentication**.

Expected authentication endpoints:

```
POST   /auth/login
GET    /auth/me
```

Example Login Response

```json
{
    "token": "...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "role": "Employee"
    }
}
```

If your backend uses different response formats or field names, update:

```
src/context/AuthContext.js
src/api/auth.js
```

---

# 📡 API Endpoints

The mobile application consumes the following REST APIs.

### Authentication

```
POST /auth/login
GET  /auth/me
```

### Reports

```
GET    /reports/mine
POST   /reports
GET    /reports/:id
```

### Review Workflow

```
GET   /reviews/pending
POST  /reviews/:id/decision
```

### Notifications

```
GET    /notifications
PATCH  /notifications/:id/read
POST   /notifications/register-device
```

---

# 👥 User Roles

## Employee

- Submit reports
- Upload attachments
- View report history
- Track approval progress

## Department Reviewer

- Review submitted reports
- Approve reports
- Reject reports
- Request changes

## Administrator

- Dashboard (future enhancement)
- Organization management
- Analytics

---

# 📋 Project Features

- Role-based authentication
- Report submission
- File upload support
- Two-stage approval workflow
- Report tracking
- Status indicators
- Notification support
- REST API integration

---

# 📌 Future Improvements

The following features are planned for future development:

- Push Notifications using Expo Notifications
- Offline report submission
- Automatic synchronization
- Pull-to-refresh
- Dark mode
- Admin analytics dashboard
- Performance optimizations

---

# 🧪 Development

Start Expo

```bash
npx expo start
```

Run on Android

```bash
a
```

Run on iOS

```bash
i
```

# 📖 Related Backend

This mobile application is designed to work alongside the **Internal Reporting System REST API** built with:

- Node.js
- Express.js
- PostgreSQL 

