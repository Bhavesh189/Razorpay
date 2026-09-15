import axios from 'axios';
import { logger } from '../utils/logger.js';

export const sendOTP = async (phoneNumber, otp) => {
  const authKey = String(process.env.MSG91_AUTH_KEY || '').replace(/["']/g, '').trim();
  const templateId = String(process.env.MSG91_TEMPLATE_ID || '').replace(/["']/g, '').trim();
  const mockMode = String(process.env.OTP_MOCK_MODE || '').toLowerCase() === 'true';

  if (mockMode) {
    logger.info('otp.mock.sent', { phoneLast4: String(phoneNumber).slice(-4) });
    return { type: 'success', message: 'Mock OTP sent successfully' };
  }

  if (!authKey || authKey === 'YOUR_MSG91_AUTH_KEY' || !templateId || templateId === 'YOUR_MSG91_TEMPLATE_ID') {
    throw new Error('MSG91 is not configured. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID, or enable OTP_MOCK_MODE for local testing.');
  }

  try {
    // Clean phone number to strictly be 10 digits before prepending country code
    const cleanNumber = phoneNumber.toString().replace(/\D/g, '').slice(-10);

    if (!/^[6-9]\d{9}$/.test(cleanNumber)) {
      throw new Error('Invalid Indian mobile number');
    }

    const url = 'https://control.msg91.com/api/v5/otp';

    const response = await axios.post(url, {
      template_id: templateId,
      mobile: `91${cleanNumber}`,
      otp: String(otp)
    }, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      }
    });

    logger.info('otp.provider.accepted', { provider: 'msg91', requestId: response.data?.request_id, type: response.data?.type });

    if (response.data.type === 'error') {
      throw new Error(`MSG91 Error: ${response.data.message}`);
    }

    return response.data;
  } catch (error) {
    const providerData = error?.response?.data;
    const providerMessage = providerData?.message || providerData?.error || error.message;
    logger.error('otp.provider.failed', {
      provider: 'msg91',
      statusCode: error?.response?.status,
      providerMessage,
      phoneLast4: String(phoneNumber).slice(-4)
    });
    const wrappedError = new Error(`MSG91 OTP failed${error?.response?.status ? ` (${error.response.status})` : ''}: ${providerMessage}`);
    wrappedError.statusCode = error?.response?.status || 502;
    throw wrappedError;
  }
};
