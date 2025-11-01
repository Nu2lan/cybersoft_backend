/**
 * Cloudflare Worker for CyberSoft Contact Form
 * Handles contact form submissions and sends emails via Resend
 */

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
}

interface Env {
  RESEND_API_KEY: string;
  ALLOWED_ORIGINS?: string; // Comma-separated list of allowed origins
}

// Project type labels
const PROJECT_TYPES: Record<string, string> = {
  website: 'Website Development',
  saas: 'SaaS Platform',
  integration: 'Integration',
  other: 'Other',
};

/**
 * CORS headers configuration
 */
function getCorsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowedOrigins = env.ALLOWED_ORIGINS 
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['https://cybersoft.az', 'https://www.cybersoft.az'];
  
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate form data
 */
function validateFormData(data: any): { valid: boolean; error?: string } {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { valid: false, error: 'Name is required' };
  }

  if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
    return { valid: false, error: 'Email is required' };
  }

  if (!isValidEmail(data.email)) {
    return { valid: false, error: 'Invalid email address' };
  }

  if (!data.projectType || typeof data.projectType !== 'string') {
    return { valid: false, error: 'Project type is required' };
  }

  if (!data.message || typeof data.message !== 'string' || !data.message.trim()) {
    return { valid: false, error: 'Message is required' };
  }

  // Validate message length (prevent abuse)
  if (data.message.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }

  return { valid: true };
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML email template
 */
function generateEmailHtml(data: ContactFormData): string {
  const projectTypeLabel = PROJECT_TYPES[data.projectType] || data.projectType;
  const sanitizedName = sanitizeHtml(data.name);
  const sanitizedEmail = sanitizeHtml(data.email);
  const sanitizedCompany = data.company ? sanitizeHtml(data.company) : '';
  const sanitizedMessage = sanitizeHtml(data.message).replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .header p {
        margin: 10px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }
      .content {
        padding: 30px;
      }
      .field {
        margin-bottom: 24px;
      }
      .label {
        font-weight: 600;
        color: #4b5563;
        font-size: 14px;
        display: block;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .value {
        color: #1f2937;
        padding: 12px 16px;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        font-size: 15px;
      }
      .value a {
        color: #2563eb;
        text-decoration: none;
      }
      .value a:hover {
        text-decoration: underline;
      }
      .message-box {
        background: #ffffff;
        padding: 16px;
        border-left: 4px solid #2563eb;
        border-radius: 8px;
        margin-top: 8px;
        font-size: 15px;
        line-height: 1.6;
      }
      .footer {
        text-align: center;
        padding: 20px 30px;
        background-color: #f9fafb;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 13px;
      }
      .footer p {
        margin: 5px 0;
      }
      @media only screen and (max-width: 600px) {
        .header {
          padding: 30px 20px;
        }
        .content {
          padding: 20px;
        }
        .footer {
          padding: 15px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✉️ New Contact Form Submission</h1>
        <p>From cybersoft.az</p>
      </div>
      
      <div class="content">
        <div class="field">
          <span class="label">👤 Name</span>
          <div class="value">${sanitizedName}</div>
        </div>
        
        <div class="field">
          <span class="label">📧 Email</span>
          <div class="value">
            <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a>
          </div>
        </div>
        
        ${sanitizedCompany ? `
        <div class="field">
          <span class="label">🏢 Company</span>
          <div class="value">${sanitizedCompany}</div>
        </div>
        ` : ''}
        
        <div class="field">
          <span class="label">📋 Project Type</span>
          <div class="value">${projectTypeLabel}</div>
        </div>
        
        <div class="field">
          <span class="label">💬 Message</span>
          <div class="message-box">${sanitizedMessage}</div>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>This message was sent from the contact form on cybersoft.az</strong></p>
        <p>Reply directly to this email to respond to ${sanitizedName}</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

/**
 * Generate plain text email
 */
function generateEmailText(data: ContactFormData): string {
  const projectTypeLabel = PROJECT_TYPES[data.projectType] || data.projectType;
  
  return `
New Contact Form Submission from cybersoft.az
=============================================

Name: ${data.name}
Email: ${data.email}
${data.company ? `Company: ${data.company}\n` : ''}Project Type: ${projectTypeLabel}

Message:
${data.message}

---
Reply directly to this email to respond to ${data.name}
  `.trim();
}

/**
 * Send email via Resend API
 */
async function sendEmail(data: ContactFormData, env: Env): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const projectTypeLabel = PROJECT_TYPES[data.projectType] || data.projectType;
  
  try {
    const response = await fetch("https://cybersoftbackend.cybersoftmmc.workers.dev/api/contact", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CyberSoft Contact Form <noreply@cybersoft.az>',
        to: ['sales@cybersoft.az'],
        reply_to: data.email,
        subject: `New Contact: ${data.name} - ${projectTypeLabel}`,
        html: generateEmailHtml(data),
        text: generateEmailText(data),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API Error:', errorData);
      return { 
        success: false, 
        error: 'Failed to send email. Please try again later.' 
      };
    }

    const result = await response.json() as { id: string };
    return { 
      success: true, 
      messageId: result.id 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: 'Failed to send email. Please try again later.' 
    };
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin, env);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only accept POST requests to /api/contact
    if (request.method !== 'POST' || url.pathname !== '/api/contact') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Not Found' 
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    try {
      // Parse request body
      const contentType = request.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Content-Type must be application/json' 
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      const data = await request.json() as ContactFormData;

      // Validate form data
      const validation = validateFormData(data);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: validation.error 
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Send email
      const result = await sendEmail(data, env);

      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error 
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Success response
      return new Response(
        JSON.stringify({ 
          success: true,
          messageId: result.messageId,
          message: 'Email sent successfully'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } catch (error) {
      console.error('Error processing request:', error);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Internal server error' 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};
