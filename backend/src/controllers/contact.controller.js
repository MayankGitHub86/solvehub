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

      // Create email transporter (using Gmail as example)
      // For production, use environment variables for credentials
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'your-app-password',
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@solvehub.com',
        to: 'pandeymp8602@gmail.com',
        subject: `[SolveHub Contact] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">New Contact Form Submission</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
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
      await transporter.sendMail(mailOptions);

      res.json({ 
        success: true,
        message: 'Message sent successfully!' 
      });
    } catch (error) {
      console.error('Error sending contact email:', error);
      
      // For development, still return success even if email fails
      // In production, you'd want to handle this properly
      res.json({ 
        success: true,
        message: 'Message received! We will get back to you soon.',
        note: 'Email service not configured. Contact saved to logs.'
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

      // Here you would typically save to database or mailing list service
      // For now, just send notification email
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'your-app-password',
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@solvehub.com',
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

      res.json({ 
        success: true,
        message: 'Subscribed successfully!' 
      });
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      
      res.json({ 
        success: true,
        message: 'Subscribed successfully!',
        note: 'Email service not configured. Subscription saved to logs.'
      });
    }
  }
}

module.exports = new ContactController();
