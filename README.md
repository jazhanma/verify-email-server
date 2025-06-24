# 🔐 Authentication Backend API

A robust Node.js backend API for user authentication with email verification, role-based access control, and MongoDB integration.

## 📋 Project Overview

This authentication backend provides a complete user management system with secure registration, login, email verification, and role-based access control. Built with modern Node.js technologies, it offers a scalable foundation for applications requiring user authentication and authorization.

## ✨ Features

### 🔑 Authentication & Authorization
- **User Registration** - Secure signup with email verification
- **User Login** - Role-based authentication system
- **Email Verification** - Automated verification emails via EmailJS
- **Role-Based Access Control** - Support for Customer, Admin, Manager, and Worker roles
- **Session Management** - Secure session handling and validation

### 📧 Email Integration
- **EmailJS Integration** - Professional email templates for verification
- **Automated Verification** - One-click email verification links
- **Contact Form Support** - Email notifications for contact submissions

### 🗄️ Database & Storage
- **MongoDB Atlas** - Cloud-hosted database with automatic scaling
- **User Management** - Complete CRUD operations for user data
- **Contact Messages** - Store and manage contact form submissions

### 🛡️ Security Features
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Cross-origin request security
- **Error Handling** - Graceful error responses and logging
- **Environment Variables** - Secure configuration management

## 🛠️ Tech Stack

### Backend Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM

### External Services
- **EmailJS** - Email service for verification emails
- **MongoDB Atlas** - Cloud database hosting

### Development Tools
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- MongoDB Atlas account
- EmailJS account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Auth_Backend
```

### 2. Install Dependencies
```bash
npm install
cd server
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_USER_ID=your_user_id
EMAILJS_TO_EMAIL=admin@yourdomain.com
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Register a new user with email verification |
| `POST` | `/api/auth/login` | Authenticate user login |
| `GET` | `/api/auth/verify` | Verify user email address |
| `POST` | `/api/auth/google` | Google OAuth authentication |
| `POST` | `/api/auth/google-signup` | Google OAuth signup |

### Contact & Support

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/contact` | Submit contact form message |

### System & Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

### Testing & Debug

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/test-verify/:email` | Test user verification status |

## 🔧 API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Contact Form Submission
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Hello, I have a question about your service."
  }'
```

## 📊 Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required),
  role: String (customer|admin|manager|worker),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Message Model
```javascript
{
  name: String (required),
  email: String (required),
  message: String (required),
  createdAt: Date
}
```

## 🔐 Role-Based Access

The system supports four user roles:

- **Customer** - Basic user access
- **Worker** - Service provider access
- **Manager** - Team management access
- **Admin** - Full system administration

## 📧 Email Verification Flow

1. User registers with email and role
2. System sends verification email via EmailJS
3. User clicks verification link in email
4. Email is verified and user can login
5. Role-based dashboard access granted

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify your MongoDB Atlas connection string
- Check network connectivity
- Ensure database user has proper permissions

**EmailJS Configuration Error**
- Verify all EmailJS environment variables are set
- Check EmailJS service and template IDs
- Ensure EmailJS account is active

**Port Already in Use**
- Change PORT in .env file
- Kill existing process on port 5000

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your `.env` file.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Check the [API Documentation](API_DOCUMENTATION.md)
- Review the troubleshooting section above

---

**Built with ❤️ using Node.js, Express, and MongoDB** 