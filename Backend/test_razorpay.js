import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const key_id = (process.env.RAZORPAY_KEY_ID || '').replace(/['"]/g, '').trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').replace(/['"]/g, '').trim();

console.log('Testing Key ID:', key_id);
console.log('Testing Key Secret Length:', key_secret.length);

const rzp = new Razorpay({
  key_id,
  key_secret
});

async function test() {
  try {
    const order = await rzp.orders.create({
      amount: 50000,
      currency: 'INR',
      receipt: 'test_order_1'
    });
    console.log('SUCCESS! Order created:', order);
  } catch (err) {
    console.error('ERROR creating order:', err);
  }
}

test();
