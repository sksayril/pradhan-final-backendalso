const Razorpay = require('razorpay');
require('dotenv').config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Verify payment signature
const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');
  
  return generated_signature === razorpay_signature;
};

// Create order
const createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt,
      notes: notes
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      order: order
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Capture payment
const capturePayment = async (paymentId, amount) => {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount * 100, 'INR');
    return {
      success: true,
      payment: payment
    };
  } catch (error) {
    console.error('Error capturing payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment: payment
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount, notes = {}) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Convert to paise
      notes: notes
    });
    return {
      success: true,
      refund: refund
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  razorpay,
  verifyPaymentSignature,
  createOrder,
  capturePayment,
  getPaymentDetails,
  refundPayment
};

