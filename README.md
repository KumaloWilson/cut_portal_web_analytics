# 🎓 University Student Portal Web Analytics System

## 📢 Overview
This project is a **real-time web analytics system** designed to track user activity on a university student portal. It provides both **real-time and historical** insights using a **browser extension, a React dashboard, and a backend powered by Express and Supabase (PostgreSQL).**

## 🚀 Features
✅ **Real-time analytics** (Active users, clicks, time spent)  
✅ **Historical data visualization** (Charts, trends, insights)  
✅ **User session tracking** (Navigation flow, session durations)  
✅ **Heatmaps & Click Tracking**  
✅ **Secure Data Transmission** using **WebSockets**  
✅ **Role-based Access** for admins and authorized personnel  
✅ **Performance Optimized & Scalable Architecture**  

---

## 🛠️ Tech Stack

### 🌐 Frontend (React)
- **React.js** (with modern hooks & context API)
- **Recharts** for data visualization
- **Socket.io-client** for real-time updates
- **Tailwind CSS** for styling  
- **Zustand** for state management  
- **React Router** for navigation  

### 📡 Backend (Express + PostgreSQL/Supabase)
- **Express.js** for API development  
- **Supabase (PostgreSQL)** as the database  
- **Socket.io** for real-time communication  
- **Redis** for caching real-time data  
- **Prisma ORM** for database management  
- **Zod** for input validation  
- **JWT** for authentication  

### 🧩 Browser Extension  
- **Manifest V3** (Chrome/Firefox support)  
- **Vanilla JavaScript**  
- **WebSockets** for real-time event streaming  

---

## 📂 Project Structure

```
📦 cut_portal_web_analytics
 ┣ 📂 extension        # Browser Extension Code
 ┣ 📂 frontend         # React-based Web Dashboard
 ┣ 📂 backend          # Express + Supabase (PostgreSQL)
 ┣ 📜 README.md        # Project Documentation
 ┣ 📜 .env.example     # Example Environment Variables
 ┣ 📜 package.json     # Dependencies & Scripts
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git https://github.com/KumaloWilson/cut_portal_web_analytics
cd cut_portal_web_analytics
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Add your Supabase credentials
npx prisma migrate dev
npm start
```

### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

### 4️⃣ Browser Extension Setup
1. Open Chrome and navigate to `chrome://extensions/`  
2. Enable **Developer Mode** (Top Right Corner)  
3. Click **Load Unpacked** and select the `extension` folder  

---

## 🎯 Future Improvements
- AI-based predictions for student behavior  
- Customizable dashboards  
- Integration with **Google Analytics**  

👨‍💻 **Contributions are welcome!** Feel free to open PRs and issues.  

🚀 **Built with passion for innovation!** 🎓

