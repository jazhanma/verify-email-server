const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// Mock user data for demonstration
const mockUsers = [
  { email: 'admin@example.com', role: 'admin', name: 'Admin User' },
  { email: 'manager@example.com', role: 'manager', name: 'Manager User' },
  { email: 'worker@example.com', role: 'worker', name: 'Worker User' },
  { email: 'customer@example.com', role: 'customer', name: 'Customer User' }
];

// User registration endpoint
router.post('/api/register', async (req, res) => {
  console.log('📝 User registration request received:', req.body);
  
  try {
    const { name, email, password, role } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      console.log('❌ Registration validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: name, email, password, role' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Registration validation failed: Invalid email format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    // Validate role
    const validRoles = ['customer', 'admin', 'manager', 'worker'];
    if (!validRoles.includes(role)) {
      console.log('❌ Registration validation failed: Invalid role');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role. Must be one of: customer, admin, manager, worker' 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      console.log('❌ Registration validation failed: Password too short');
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ Registration failed: Email already exists');
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Save user to MongoDB
    console.log('💾 Saving user to MongoDB...');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // No hashing for now
      role,
      isVerified: false
    });
    
    console.log('🧾 User saved to MongoDB:', email);

    // Send verification email
    console.log('📧 Sending verification email...');
    const emailResult = await sendEmail({
      name: name,
      email: email,
      toEmail: email // Send to the user's email address
    });
    
    if (emailResult.success) {
      console.log('📨 Verification email sent to:', email);
    } else {
      console.log('❌ Failed to send verification email:', emailResult.error);
    }
    
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name,
        email,
        role,
        isVerified: user.isVerified
      },
      emailSent: emailResult.success,
      emailError: emailResult.error || null
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// User login endpoint
router.post('/api/auth/login', async (req, res) => {
  console.log('🔐 User login request received:', req.body);
  
  try {
    const { email, password, role } = req.body;
    
    // Validation
    if (!email || !password || !role) {
      console.log('❌ Login validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: email, password, role' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Login validation failed: Invalid email format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    // Validate role
    const validRoles = ['customer', 'admin', 'manager', 'worker'];
    if (!validRoles.includes(role)) {
      console.log('❌ Login validation failed: Invalid role');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role. Must be one of: customer, admin, manager, worker' 
      });
    }

    // Look up user by email and role
    console.log('🔍 Looking up user in MongoDB...');
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      role: role 
    });

    // Check if user exists
    if (!user) {
      console.log('❌ Login failed: User not found for email:', email, 'role:', role);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User found:', user.email);

    // Check if email is verified
    if (!user.isVerified) {
      console.log('❌ Login failed: Email not verified for:', email);
      return res.status(403).json({
        success: false,
        error: 'Please verify your email address before logging in'
      });
    }

    // Check password (plain text comparison for now)
    if (user.password !== password) {
      console.log('❌ Login failed: Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Login successful
    console.log('✅ Login success for:', email);
    console.log('📋 Login details:', { email, role, name: user.name });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Email verification endpoint
router.get('/api/auth/verify', async (req, res) => {
  console.log('🔗 Email verification request received:', req.query);
  console.log('🔗 Full URL:', req.originalUrl);
  console.log('🔗 Method:', req.method);
  
  try {
    const { email } = req.query;
    
    if (!email) {
      console.log('❌ Verification failed: Email parameter missing');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .error { color: #d32f2f; font-size: 18px; margin-bottom: 20px; }
            .btn { background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ Verification Failed</div>
            <p>Email parameter is required.</p>
            <a href="http://localhost:3000" class="btn">Go to Website</a>
          </div>
        </body>
        </html>
      `);
    }

    console.log('📧 Email to verify:', email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Verification failed: Invalid email format');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .error { color: #d32f2f; font-size: 18px; margin-bottom: 20px; }
            .btn { background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ Verification Failed</div>
            <p>Invalid email format.</p>
            <a href="http://localhost:3000" class="btn">Go to Website</a>
          </div>
        </body>
        </html>
      `);
    }

    // Look up user by email
    console.log('🔍 Looking up user for verification:', email);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ No user found to verify:', email);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .error { color: #d32f2f; font-size: 18px; margin-bottom: 20px; }
            .btn { background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ User Not Found</div>
            <p>No account found with this email address.</p>
            <a href="http://localhost:3000" class="btn">Go to Website</a>
          </div>
        </body>
        </html>
      `);
    }

    console.log('✅ User found:', user.email, 'Current isVerified:', user.isVerified);

    // Check if already verified
    if (user.isVerified) {
      console.log('✅ User already verified:', email);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Already Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .success { color: #388e3c; font-size: 18px; margin-bottom: 20px; }
            .btn { background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
            .auto-redirect { color: #666; font-size: 14px; margin-top: 20px; }
          </style>
          <script>
            setTimeout(function() {
              window.location.href = 'http://localhost:3000';
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Email Already Verified</div>
            <p>Your email address has already been verified successfully.</p>
            <a href="http://localhost:3000" class="btn">Go to Website</a>
            <div class="auto-redirect">Redirecting to website in 3 seconds...</div>
          </div>
        </body>
        </html>
      `);
    }

    // Update user to verified
    console.log('✅ Verifying user:', email);
    user.isVerified = true;
    await user.save();

    console.log('✅ Email verification successful for:', email);
    console.log('✅ User isVerified updated to:', user.isVerified);
    
    // Send beautiful success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified Successfully</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            background: white; 
            padding: 50px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
            max-width: 500px; 
            margin: 0 auto;
            animation: fadeInUp 0.6s ease-out;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .success-icon { 
            font-size: 60px; 
            margin-bottom: 20px; 
            animation: bounce 1s ease-in-out;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          .success { 
            color: #388e3c; 
            font-size: 24px; 
            font-weight: bold;
            margin-bottom: 15px; 
          }
          .message { 
            color: #666; 
            font-size: 16px; 
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .btn { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            display: inline-block; 
            margin-top: 20px;
            font-weight: bold;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
          .auto-redirect { 
            color: #999; 
            font-size: 14px; 
            margin-top: 25px; 
          }
          .user-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
        </style>
        <script>
          // Auto-redirect after 5 seconds
          setTimeout(function() {
            window.location.href = 'http://localhost:3000';
          }, 5000);
        </script>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">🎉</div>
          <div class="success">Email Verified Successfully!</div>
          <p class="message">
            Congratulations! Your email address has been verified successfully. 
            You can now log in to your account and access all features.
          </p>
          <div class="user-info">
            <strong>Account Details:</strong><br>
            Name: ${user.name}<br>
            Email: ${user.email}<br>
            Role: ${user.role}
          </div>
          <a href="http://localhost:3000" class="btn">Continue to Website</a>
          <div class="auto-redirect">You'll be automatically redirected in 5 seconds...</div>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
          .error { color: #d32f2f; font-size: 18px; margin-bottom: 20px; }
          .btn { background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">❌ Verification Error</div>
          <p>An error occurred during verification. Please try again later.</p>
          <a href="http://localhost:3000" class="btn">Go to Website</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Google authentication endpoint
router.post('/api/auth/google', async (req, res) => {
  console.log('🔐 Google auth request received:', req.body);
  
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google token is required' 
      });
    }

    // In a real app, you would verify the Google token here
    // For now, we'll simulate a successful authentication
    console.log('✅ Google token received:', token.substring(0, 20) + '...');
    
    // Mock response - in real app, decode JWT and get user info
    const mockUser = {
      email: 'user@gmail.com',
      name: 'Google User',
      role: 'customer' // Default role for Google users
    };

    console.log('✅ Google authentication successful for:', mockUser.email);
    
    res.json({
      success: true,
      role: mockUser.role,
      user: {
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      }
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Google authentication failed' 
    });
  }
});

// Google signup endpoint
router.post('/api/auth/google-signup', async (req, res) => {
  console.log('📝 Google signup request received:', req.body);
  
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Google token is required' 
      });
    }

    // In a real app, you would verify the Google token and create user
    // For now, we'll simulate a successful signup
    console.log('✅ Google signup token received:', token.substring(0, 20) + '...');
    
    // Mock response - in real app, decode JWT and create user in DB
    const mockUser = {
      email: 'newuser@gmail.com',
      name: 'New Google User',
      role: 'customer' // Default role for new Google users
    };

    console.log('✅ Google signup successful for:', mockUser.email);
    
    res.json({
      success: true,
      role: mockUser.role,
      user: {
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      }
    });

  } catch (error) {
    console.error('❌ Google signup error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Google signup failed' 
    });
  }
});

// Test verification endpoint (for debugging)
router.get('/api/auth/test-verify/:email', async (req, res) => {
  console.log('🧪 Test verification for email:', req.params.email);
  
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found', email });
    }
    
    return res.json({
      success: true,
      message: 'User found',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        id: user._id
      }
    });
    
  } catch (error) {
    console.error('❌ Test verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 