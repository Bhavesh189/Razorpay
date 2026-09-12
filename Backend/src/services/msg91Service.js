import axios from 'axios';

export const sendOTP = async (phoneNumber, otp) => {
  // If MSG91 is not configured, we'll log it and mock success (useful for dev)
  if (!process.env.MSG91_AUTH_KEY || process.env.MSG91_AUTH_KEY === 'YOUR_MSG91_AUTH_KEY') {
    console.log(`[MSG91 MOCK] Sending OTP ${otp} to ${phoneNumber}`);
    return { type: 'success', message: 'Mock OTP sent successfully' };
  }

  try {
    // Clean phone number to strictly be 10 digits before prepending country code
    const cleanNumber = phoneNumber.toString().replace(/\D/g, '').slice(-10);

    const templateId = process.env.MSG91_TEMPLATE_ID;
    const authKey = process.env.MSG91_AUTH_KEY;
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${cleanNumber}&otp=${otp}`;

    const response = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      }
    });

    console.log('[MSG91 Response]', response.data);

    if (response.data.type === 'error') {
      throw new Error(`MSG91 Error: ${response.data.message}`);
    }

    return response.data;
  } catch (error) {
    console.error('[MSG91 Error]', error?.response?.status, error?.response?.data || error.message);
    throw new Error('Failed to send OTP via SMS provider');
  }
};
