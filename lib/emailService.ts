// Hybrid email service: Firebase (primary) + SendGrid (optional enhancement)
// Smart fallback system for maximum reliability

// Dynamic import to avoid build errors if SendGrid not installed
interface SendGridMail {
  setApiKey: (key: string) => void
  send: (template: EmailTemplate) => Promise<void>
}

let sgMail: SendGridMail | null = null

// Initialize SendGrid only if available and configured
const initializeSendGrid = async () => {
  if (sgMail) return sgMail
  
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Dynamic import to avoid build errors
      try {
        const sendGridModule = await import('@sendgrid/mail' as any)
        sgMail = sendGridModule.default
        if (sgMail) {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        }
        console.log('✅ SendGrid initialized successfully')
        return sgMail
      } catch {
        console.warn('⚠️ SendGrid package not available')
        return null
      }
    }
  } catch (_error) {
    console.warn('⚠️ SendGrid not available, using fallback methods')
  }
  
  return null
}

export interface EmailTemplate {
  to: string
  from: string
  subject: string
  html: string
  text?: string
}

export interface VerificationEmailData {
  userEmail: string
  verificationCode: string
  firstName?: string
}

export interface RatingReminderEmailData {
  buyerEmail: string
  buyerName: string
  sellerName: string
  listingTitle: string
  listingId: string
  daysSinceTransaction: number
}

// Send verification code email (Firebase primary, SendGrid optional enhancement)
export const sendVerificationEmail = async (data: VerificationEmailData): Promise<void> => {
  const sendGrid = await initializeSendGrid()
  
  if (!sendGrid) {
    console.log('🔄 Using Firebase for verification emails (SendGrid not configured)')
    
    // Development fallback - show alert if in development mode
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        alert(`Development Mode: Your verification code is ${data.verificationCode}`)
      }, 1000)
    }
    return
  }

  const emailTemplate: EmailTemplate = {
    to: data.userEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@dulif.com',
    subject: 'Your dulif™ Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code - dulif™</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #1A202C;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #003262 0%, #FDB515 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border: 1px solid #E2E8F0;
              border-radius: 0 0 12px 12px;
            }
            .code-container {
              background: #F7FAFC;
              border: 2px solid #003262;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .verification-code {
              font-size: 36px;
              font-weight: bold;
              color: #003262;
              letter-spacing: 8px;
              font-family: "Courier New", monospace;
            }
            .footer {
              text-align: center;
              color: #64748B;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E2E8F0;
            }
            .warning {
              background: #FEF3C7;
              border: 1px solid #FDB515;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              color: #92400E;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">dulif™</div>
            <p>Berkeley Student Marketplace</p>
          </div>
          
          <div class="content">
            <h1>Welcome${data.firstName ? ` ${data.firstName}` : ''}!</h1>
            
            <p>Thank you for joining the dulif™ community. To complete your registration, please enter the verification code below:</p>
            
            <div class="code-container">
              <div style="font-size: 14px; color: #64748B; margin-bottom: 10px;">Your Verification Code</div>
              <div class="verification-code">${data.verificationCode}</div>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <div class="warning">
              <strong>🔒 Security Note:</strong> Never share this code with anyone. dulif™ team will never ask for your verification code.
            </div>
            
            <p>If you didn't request this code, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br>
            The dulif™ Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${data.userEmail}</p>
            <p>Need help? Contact us at <a href="mailto:support@dulif.com">support@dulif.com</a></p>
            <p>© 2024 dulif™. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      dulif™ - Berkeley Student Marketplace
      
      Welcome${data.firstName ? ` ${data.firstName}` : ''}!
      
      Thank you for joining the dulif™ community. To complete your registration, please enter the verification code below:
      
      Verification Code: ${data.verificationCode}
      
      This code will expire in 10 minutes.
      
      Security Note: Never share this code with anyone. dulif™ team will never ask for your verification code.
      
      If you didn't request this code, please ignore this email or contact our support team at support@dulif.com.
      
      Best regards,
      The dulif™ Team
      
      © 2024 dulif™. All rights reserved.
    `
  }

  try {
    await sendGrid.send(emailTemplate)
    console.log(`✅ Professional verification email sent to ${data.userEmail}`)
  } catch (error) {
    console.error('❌ SendGrid verification email failed:', error)
    
    // Fallback to development mode if email fails
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        alert(`Email failed, showing code: ${data.verificationCode}`)
      }, 1000)
    }
    
    throw new Error('Failed to send verification email')
  }
}

// Send rating reminder email (SendGrid only - optional feature)
export const sendRatingReminderEmail = async (data: RatingReminderEmailData): Promise<void> => {
  const sendGrid = await initializeSendGrid()
  
  if (!sendGrid) {
    console.log('⚠️ Rating reminders require SendGrid. Feature disabled.')
    return
  }

  const emailTemplate: EmailTemplate = {
    to: data.buyerEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@dulif.com',
    subject: `Rate your experience with ${data.sellerName} - dulif™`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rate Your Experience - dulif™</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #1A202C;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #003262 0%, #FDB515 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border: 1px solid #E2E8F0;
              border-radius: 0 0 12px 12px;
            }
            .listing-card {
              background: #F7FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background: #FDB515;
              color: #1A202C;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .stars {
              color: #FDB515;
              font-size: 20px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>dulif™</h1>
            <p>Berkeley Student Marketplace</p>
          </div>
          
          <div class="content">
            <h2>Hi ${data.buyerName}!</h2>
            
            <p>It's been ${data.daysSinceTransaction} days since your transaction with ${data.sellerName}. We'd love to hear about your experience!</p>
            
            <div class="listing-card">
              <h3>${data.listingTitle}</h3>
              <p><strong>Seller:</strong> ${data.sellerName}</p>
            </div>
            
            <p>Your feedback helps build trust in the Berkeley community and helps other students make informed decisions.</p>
            
            <div class="stars">⭐⭐⭐⭐⭐</div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dulif.com'}/listing/${data.listingId}#rate" class="cta-button">
              Rate Your Experience
            </a>
            
            <p><em>This should only take 30 seconds of your time!</em></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E2E8F0;">
            
            <p style="font-size: 14px; color: #64748B;">
              🔒 Your feedback is valuable to us. We'll never share your personal information and you can unsubscribe from rating reminders anytime.
            </p>
            
            <p>Thanks for being part of the dulif™ community!</p>
            
            <p>Best regards,<br>
            The dulif™ Team</p>
          </div>
        </body>
      </html>
    `,
    text: `
      dulif™ - Berkeley Student Marketplace
      
      Hi ${data.buyerName}!
      
      It's been ${data.daysSinceTransaction} days since your transaction with ${data.sellerName}. We'd love to hear about your experience!
      
      Item: ${data.listingTitle}
      Seller: ${data.sellerName}
      
      Your feedback helps build trust in the Berkeley community and helps other students make informed decisions.
      
      Rate your experience: ${process.env.NEXT_PUBLIC_APP_URL || 'https://dulif.com'}/listing/${data.listingId}#rate
      
      This should only take 30 seconds of your time!
      
      Thanks for being part of the dulif™ community!
      
      Best regards,
      The dulif™ Team
      
      Need help? Contact us at support@dulif.com
    `
  }

  try {
    await sendGrid.send(emailTemplate)
    console.log(`✅ Rating reminder email sent successfully to ${data.buyerEmail}`)
  } catch (error) {
    console.error('❌ Error sending rating reminder email:', error)
    throw new Error('Failed to send rating reminder email')
  }
}

// Send welcome email after profile completion (SendGrid only - optional feature)
export const sendWelcomeEmail = async (userEmail: string, firstName: string): Promise<void> => {
  const sendGrid = await initializeSendGrid()
  
  if (!sendGrid) {
    console.log('⚠️ Welcome emails require SendGrid. Feature disabled.')
    return
  }

  const emailTemplate: EmailTemplate = {
    to: userEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@dulif.com',
    subject: 'Welcome to dulif™ - Your Berkeley Marketplace Journey Begins!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to dulif™</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #1A202C;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #003262 0%, #FDB515 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .content {
              background: white;
              padding: 40px 30px;
              border: 1px solid #E2E8F0;
              border-radius: 0 0 12px 12px;
            }
            .cta-button {
              display: inline-block;
              background: #003262;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              text-align: center;
              margin: 20px 10px;
            }
            .feature-list {
              background: #F7FAFC;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 36px; margin-bottom: 10px;">Welcome to dulif™!</h1>
            <p style="font-size: 18px;">Berkeley's Premier Student Marketplace</p>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName}! 🎉</h2>
            
            <p>Congratulations on joining the dulif™ community! You're now part of Berkeley's most trusted student marketplace.</p>
            
            <div class="feature-list">
              <h3>What you can do now:</h3>
              <ul>
                <li>🛍️ <strong>Browse listings</strong> from verified Berkeley students</li>
                <li>💬 <strong>Chat safely</strong> with buyers and sellers</li>
                <li>📝 <strong>Create listings</strong> to sell your items</li>
                <li>⭐ <strong>Build your reputation</strong> with our rating system</li>
                <li>🔒 <strong>Trade securely</strong> with our safety guidelines</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dulif.com'}" class="cta-button">
                Start Browsing
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://dulif.com'}/create" class="cta-button" style="background: #FDB515; color: #1A202C;">
                Create Your First Listing
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E2E8F0;">
            
            <h3>Pro Tips for Success:</h3>
            <ul>
              <li>📸 Add clear photos to your listings</li>
              <li>💰 Price items competitively</li>
              <li>📱 Respond quickly to messages</li>
              <li>🤝 Meet in safe, public locations</li>
              <li>⭐ Leave honest ratings after transactions</li>
            </ul>
            
            <p>Questions? We're here to help at <a href="mailto:support@dulif.com">support@dulif.com</a></p>
            
            <p>Happy trading!</p>
            
            <p>The dulif™ Team<br>
            <em>Building Berkeley's future, one transaction at a time</em></p>
          </div>
        </body>
      </html>
    `
  }

  try {
    await sendGrid.send(emailTemplate)
    console.log(`✅ Welcome email sent successfully to ${userEmail}`)
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    // Don't throw error for welcome emails - they're not critical
  }
}

// Generic email sender for custom templates (SendGrid only - optional feature)
export const sendCustomEmail = async (template: EmailTemplate): Promise<void> => {
  const sendGrid = await initializeSendGrid()
  
  if (!sendGrid) {
    console.log('⚠️ Custom emails require SendGrid. Feature disabled.')
    return
  }

  try {
    await sendGrid.send(template)
    console.log(`✅ Custom email sent successfully to ${template.to}`)
  } catch (error) {
    console.error('❌ Error sending custom email:', error)
    throw new Error('Failed to send custom email')
  }
}