const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/api/contact', async (req, res) => {
  console.log('📧 Contact form request received:', req.body);
  
  const { name, email, message } = req.body;
  
  // Validation
  if (!name || !email || !message) {
    console.log('❌ Contact validation failed: Missing required fields');
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  
  if (!isValidEmail(email)) {
    console.log('❌ Contact validation failed: Invalid email format');
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  try {
    console.log('💾 Saving contact message to MongoDB...');
    const contactMessage = new ContactMessage({ name, email, message });
    await contactMessage.save();
    console.log('✅ Contact message saved successfully');

    console.log('📤 Sending email via EmailJS...');
    const emailResult = await sendEmail({ name, email, message });
    
    if (!emailResult.success) {
      console.log('❌ Email sending failed:', emailResult.error);
      return res.status(500).json({ success: false, error: emailResult.error });
    }
    
    console.log('✅ Email sent successfully');
    console.log('✅ Contact form submission completed successfully');
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 