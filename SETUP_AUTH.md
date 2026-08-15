# ShopSphere Google + Password Reset setup

## Client `.env`
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com

## Server `.env`
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ShopSphere
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-16-character-gmail-app-password
GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com

## Google Cloud
Create an OAuth 2.0 Web client ID. Add `http://localhost:5173` to Authorized JavaScript origins for local development. Put the same client ID into both the client and server environment variables.

## Mail
The backend uses Gmail SMTP through Nodemailer. `EMAIL_PASSWORD` must be a Gmail App Password. On startup the server runs `transporter.verify()` and logs whether the SMTP configuration can connect.

Forgot-password requests now send both a secure reset link and a six-digit OTP. The frontend accepts the OTP and verifies it through `/api/auth/verify-reset-otp`, then continues to the existing `/reset-password/:token` flow.
