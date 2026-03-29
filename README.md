# WikiAcademia

A comprehensive full-stack web application designed for academic institutions to manage, share, and browse educational resources efficiently. This platform allows faculty members to upload study materials (PDFs, PPTXs) and enables students to access them easily.

## 🚀 Key Features

- **User Authentication**: Secure Login and Registration system for Students and Faculty members.
- **Faculty Dashboard**: Dedicated interface for faculty to upload and manage documents.
- **Document Management**: Support for multiple file formats (PDF, PPTX) with secure storage via Cloudinary.
- **Browse & Search**: Categorized browsing of academic resources with search and filter capabilities.
- **User Management**: Admin-level control to manage user roles and permissions.
- **Responsive Design**: Fully responsive UI/UX built with React and Tailwind CSS.

## 🚀 Project Demo

🎥 Watch the full demo here:  
👉 https://www.youtube.com/watch?v=5lLhAdehWMU

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Modern UI development.
- **React Router Dom**: For seamless client-side navigation.
- **Tailwind CSS**: Utility-first styling for a premium look.
- **Lucide React**: Beautiful icons for enhanced UX.
- **Axios**: Promised-based HTTP client for API requests.

### Backend
- **Node.js & Express**: Robust and scalable server-side environment.
- **MongoDB & Mongoose**: NoSQL database for flexible data modeling.
- **Cloudinary**: Cloud-based image and video management (used for file storage).
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).
- **JWT & BcryptJS**: For secure authentication and password hashing.
- **Helmet & Morgan**: Security and logging middlewares.

## 📂 Project Structure

```text
DigitalAcademicRepository/
├── Client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main page views (Login, Home, Dashboard, etc.)
│   │   ├── context/        # State management context
│   │   └── utils/          # Helper functions and API configuration
│   └── public/             # Static assets
└── Server/                 # Backend Node.js API
    ├── controllers/        # Request handling logic
    ├── models/             # Mongoose database schemas
    ├── routes/             # API route definitions
    ├── middleware/         # Auth and upload middlewares
    └── config/             # Database connection settings
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account (Atlas or Local)
- Cloudinary account (for file storage)

### 1. Clone the Repository
```bash
git clone https://github.com/M-Kishore732006/digital-academic-repository.git
cd digital-academic-repository
```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd Server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../Client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🛡️ Security Features
- **JWT Authentication**: Secure token-based access control.
- **Bcrypt Hashing**: Passwords are never stored in plain text.
- **Helmet.js**: Protection against common web vulnerabilities.
- **CORS Configuration**: Restricts API access to authorized origins.

## 📄 License
This project is licensed under the ISC License.
