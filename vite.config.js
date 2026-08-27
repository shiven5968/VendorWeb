import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sendOtpEmail, verifyOtpCode } from './api/_otpService.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.RESEND_API_KEY) {
    process.env.RESEND_API_KEY = env.RESEND_API_KEY;
  }
  if (env.RESEND_FROM_EMAIL) {
    process.env.RESEND_FROM_EMAIL = env.RESEND_FROM_EMAIL;
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
