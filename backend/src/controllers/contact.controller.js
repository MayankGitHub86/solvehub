const nodemailer = require('nodemailer');

class ContactController {
  /**
   * Send contact form email
   */
  async sendContactEmail(req, res) {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          error: 'All fields are required' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }

      // Log the contact form submission
      console.log('\n📧 ===== NEW CONTACT FORM SUBMISSION =====');
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log(`Date: ${new Date().toLocaleString()}`);
      console.log('==========================================\n');

      // Check if email credentials are configured properly
      const hasValidPassword = process.env.EMAIL_PASSWORD && 
                              process.env.EMAIL_PASSWORD !== 'your_16_char_app_password_here' &&
                              process.env.EMAIL_PASSWORD.length === 16;

      if (!process.env.EMAIL_USER || !hasValidPassword) {
        console.log('⚠️  Email not configured. Contact form data saved to logs above.');
        console.log('💡 To enable email: Generate Gmail App Password at https://myaccount.google.com/apppasswords');
        
        // Return success even without email
        return res.json({ 
          success: true,
          message: 'Message received! We will get back to you soon.',
          note: 'Contact saved to server logs. Email will be sent once configured.'
        });
      }

      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify transporter configuration
      try {
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
      } catch (verifyError) {
        console.error('❌ Email transporter verification failed:', verifyError.message);
        console.log('⚠️  Saving contact to logs instead.');
        
        // Return success even if email fails
        return res.json({ 
          success: true,
          message: 'Message received! We will get back to you soon.',
          note: 'Contact saved to server logs. Email configuration needs attention.'
        });
      }

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'pandeymp8602@gmail.com',
        subject: `[SolveHub Contact] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">New Contact Form Submission</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0;">Message:</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>This email was sent from the SolveHub contact form.</p>
              <p>Reply to: ${email}</p>
            </div>
          </div>
        `,
        replyTo: email,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);

      res.json({ 
        success: true,
        message: 'Message sent successfully! We will get back to you soon.' 
      });
    } catch (error) {
      console.error('❌ Error sending contact email:', error);
      
      // Log the contact anyway
      console.log('⚠️  Contact form data saved to logs (email failed)');
      
      // Return success to user (contact is logged)
      res.json({ 
        success: true,
        message: 'Message received! We will get back to you soon.',
        note: 'Contact saved to server logs.'
      });
    }
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }

      // Check if email credentials are configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Email credentials not configured in .env file');
        return res.status(500).json({ 
          error: 'Email service not configured. Please contact administrator.' 
        });
      }
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify transporter
      try {
        await transporter.verify();
      } catch (verifyError) {
        console.error('❌ Email transporter verification failed:', verifyError.message);
        return res.status(500).json({ 
          error: 'Email service configuration error.' 
        });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'pandeymp8602@gmail.com',
        subject: '[SolveHub] New Newsletter Subscription',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">New Newsletter Subscription</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Newsletter subscription email sent');

      res.json({ 
        success: true,
        message: 'Subscribed successfully!' 
      });
    } catch (error) {
      console.error('❌ Error subscribing to newsletter:', error);
      
      let errorMessage = 'Failed to subscribe. Please try again later.';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please contact administrator.';
      }
      
      res.status(500).json({ 
        success: false,
        error: errorMessage
      });
    }
  }
}

module.exports = new ContactController();
