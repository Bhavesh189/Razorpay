import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  try {
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const authKey = process.env.MSG91_AUTH_KEY;
    const url = 'https://control.msg91.com/api/v5/otp';

    const response = await axios.post(url, {
      template_id: templateId,
      mobile: '919999999999',
      otp: '123456'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      }
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error Status:", error?.response?.status);
    console.error("Data:", error?.response?.data);
  }
};

test();
