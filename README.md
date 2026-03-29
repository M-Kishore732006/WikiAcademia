# WikiAcademia

WikiAcademia is an AI-powered collaborative learning platform designed to transform unstructured lecture materials into structured, interactive knowledge while enabling meaningful peer-to-peer learning.

## 🚀 Key Features

- **AI-Powered Content Structuring**: Automatically converts uploaded lecture materials into structured summaries, key concepts, and simplified explanations.  
- **Revision Flashcards**: Generates quick flashcards for efficient revision and concept reinforcement.  
- **Context-Aware AI Q&A**: Allows students to ask questions and receive answers based on the uploaded material.    
- **Intelligent Peer Matching**: Connects learners with relevant helpers studying the same material for targeted collaboration.  
- **Smart Doubt Visibility**: Displays the latest questions from learners to help peers quickly identify and respond to doubts.  
- **Material-Based Learning Flow**: Each document acts as a complete learning unit with AI insights and collaborative features.  
- **Full-Stack Deployment**: Built using React (Vercel), Node.js & Express (Render), and MongoDB Atlas.  
- **Responsive UI/UX**: Clean and user-friendly interface designed for seamless navigation and interaction.
    
## 🎦 Project Demo

🎥 Watch the full demo here:  
👉 https://www.youtube.com/watch?v=5lLhAdehWMU

## 🔑 Demo Access

To explore the platform, you can use the following sample accounts:

### 👨‍🎓 Student Login
- **Email**: teststudent@gmail  
- **Password**: teststudent
- **note**: All self-registered accounts are created as Students.

### 👨‍🏫 Faculty Login
- **Email**: test@example.com
- **Password**: 123456

### 🏫 Admin Login
- **Email**: viceadmin@gmail.com
- **password**: IIITDM

## 🌐 Live Demo

👉(https://wiki-academia.vercel.app/)

> ⚠️ Note: These are demo accounts for evaluation purposes only.

---

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
- **Groq API (LLaMA 3.1)**: High-performance AI inference 
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
git clone https://github.com/M-Kishore732006/WikiAcademia.git
cd WikiAcademia
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
   GROQ_API_KEY=your_Groq_api_key
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
