// ============================================
// STRIPE PAYMENT CONFIGURATION
// ============================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('./config');

// ============================================
// CREATE PAYMENT INTENT
// ============================================
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    throw error;
  }
};

// ============================================
// CREATE CHECKOUT SESSION
// ============================================
const createCheckoutSession = async (lineItems, customerId, metadata = {}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer: customerId,
      success_url: `${config.stripe.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: config.stripe.cancelUrl,
      metadata,
    });
    return session;
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    throw error;
  }
};

// ============================================
// CREATE CUSTOMER
// ============================================
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return customer;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw error;
  }
};

// ============================================
// RETRIEVE CUSTOMER
// ============================================
const retrieveCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Stripe retrieve customer error:', error);
    throw error;
  }
};

// ============================================
// CREATE TRANSFER (FOR EDUCATOR PAYOUTS)
// ============================================
const createTransfer = async (amount, destination, metadata = {}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: config.stripe.currency,
      destination,
      metadata,
    });
    return transfer;
  } catch (error) {
    console.error('Stripe transfer error:', error);
    throw error;
  }
};

// ============================================
// REFUND PAYMENT
// ============================================
const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }
    
    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error('Stripe refund error:', error);
    throw error;
  }
};

// ============================================
// VERIFY WEBHOOK SIGNATURE
// ============================================
const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  stripe,
  createPaymentIntent,
  createCheckoutSession,
  createCustomer,
  retrieveCustomer,
  createTransfer,
  refundPayment,
  verifyWebhookSignature,
};