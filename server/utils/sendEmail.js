const axios = require('axios');

async function sendEmail({ name, email, message, toEmail = null }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID;
  
  // Use provided toEmail or fall back to environment variable
  const recipientEmail = toEmail || process.env.EMAILJS_TO_EMAIL;

  // Validate EmailJS configuration
  if (!serviceId || !templateId || !userId) {
    const missingVars = [];
    if (!serviceId) missingVars.push('EMAILJS_SERVICE_ID');
    if (!templateId) missingVars.push('EMAILJS_TEMPLATE_ID');
    if (!userId) missingVars.push('EMAILJS_USER_ID');
    
    console.error('❌ EmailJS configuration missing:', missingVars.join(', '));
    return { 
      success: false, 
      error: `EmailJS configuration missing: ${missingVars.join(', ')}` 
    };
  }

  if (!recipientEmail) {
    console.error('❌ No recipient email provided');
    return { 
      success: false, 
      error: 'No recipient email provided' 
    };
  }

  console.log('📧 EmailJS Configuration:', {
    serviceId: serviceId ? 'Set' : 'Missing',
    templateId: templateId ? 'Set' : 'Missing', 
    userId: userId ? 'Set' : 'Missing',
    recipientEmail: recipientEmail || 'Missing'
  });

  const url = 'https://api.emailjs.com/api/v1.0/email/send';
  
  // Prepare template parameters
  const templateParams = {
    from_email: email,
    to_email: recipientEmail
  };

  // Add verification link for verification emails
  if (email && !message) {
    const verificationLink = `http://localhost:5000/api/auth/verify?email=${encodeURIComponent(email)}`;
    templateParams.verificationLink = verificationLink;
    templateParams.name = name || 'User';
    console.log('🔗 Verification link generated:', verificationLink);
  }

  // Add message if provided (for contact form emails)
  if (message) {
    templateParams.message = message;
  }

  const data = {
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: templateParams
  };

  console.log('📧 Sending email to:', recipientEmail);
  console.log('📧 Email data:', JSON.stringify(data, null, 2));

  // Retry logic for email sending
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('✅ EmailJS response:', response.status, response.data);
      return { success: true, response: response.data };
      
    } catch (error) {
      lastError = error;
      console.error(`❌ EmailJS attempt ${attempt}/${maxRetries} failed:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return { 
    success: false, 
    error: lastError.response?.data || lastError.message,
    status: lastError.response?.status
  };
}

module.exports = sendEmail; 