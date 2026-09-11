import axios from 'axios';

export const sendOTP = async (phoneNumber, otp) => {
  // If MSG91 is not configured, we'll log it and mock success (useful for dev)
  if (!process.env.MSG91_AUTH_KEY || process.env.MSG91_AUTH_KEY === 'YOUR_MSG91_AUTH_KEY') {
    console.log(`[MSG91 MOCK] Sending OTP ${otp} to ${phoneNumber}`);
    return { type: 'success', message: 'Mock OTP sent successfully' };
  }

  try {
    const response = await axios.post('https://control.msg91.com/api/v5/otp', {
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: `91${phoneNumber}`,
      authkey: process.env.MSG91_AUTH_KEY,
      otp: otp
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('[MSG91 Error]', error?.response?.data || error.message);
    throw new Error('Failed to send OTP via SMS provider');
  }
};
