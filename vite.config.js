import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sendOtpEmail, verifyOtpCode } from './api/_otpService.js';
import createRazorpayOrderHandler from './api/create-razorpay-order.js';
import verifyRazorpayPaymentHandler from './api/verify-razorpay-payment.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.RESEND_API_KEY) {
    process.env.RESEND_API_KEY = env.RESEND_API_KEY;
  }
  if (env.RESEND_FROM_EMAIL) {
    process.env.RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;
  }
  if (env.RAZORPAY_KEY_ID) {
    process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
  }
  if (env.RAZORPAY_KEY_SECRET) {
    process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;
  }

  return {
    plugins: [
      react(),
      {
        name: 'dev-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/send-otp') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body || '{}');
                  const result = await sendOtpEmail(parsed);
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(result));
                } catch (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 400;
                  res.end(JSON.stringify({ message: err.message || 'Error sending OTP' }));
                }
              });
              return;
            }

            if (req.url?.startsWith('/api/verify-otp') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsed = JSON.parse(body || '{}');
                  const result = await verifyOtpCode(parsed);
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 200;
                  res.end(JSON.stringify(result));
                } catch (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 400;
                  res.end(JSON.stringify({ message: err.message || 'Error verifying OTP' }));
                }
              });
              return;
            }

            if (req.url?.startsWith('/api/create-razorpay-order') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                const mockReq = { method: 'POST', body: JSON.parse(body || '{}') };
                const mockRes = {
                  setHeader: (k, v) => res.setHeader(k, v),
                  status: (code) => {
                    res.statusCode = code;
                    return {
                      json: (data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                      },
                      end: () => res.end()
                    };
                  }
                };
                await createRazorpayOrderHandler(mockReq, mockRes);
              });
              return;
            }

            if (req.url?.startsWith('/api/verify-razorpay-payment') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                const mockReq = { method: 'POST', body: JSON.parse(body || '{}') };
                const mockRes = {
                  setHeader: (k, v) => res.setHeader(k, v),
                  status: (code) => {
                    res.statusCode = code;
                    return {
                      json: (data) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(data));
                      },
                      end: () => res.end()
                    };
                  }
                };
                await verifyRazorpayPaymentHandler(mockReq, mockRes);
              });
              return;
            }

            next();
          });
        }
      }
    ],
    server: {
      port: 3000,
      open: true
    }
  };
});
