// Payment service
// ============================================
// PAYMENT SERVICE
// ============================================

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../config/config');

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
// CREATE PAYMENT INTENT
// ============================================
const createPaymentIntent = async (amount, currency, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
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
// RETRIEVE PAYMENT INTENT
// ============================================
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Retrieve payment intent error:', error);
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
// CREATE TRANSFER (PAYOUT TO INSTRUCTOR)
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
// CREATE CONNECTED ACCOUNT (FOR INSTRUCTORS)
// ============================================
const createConnectedAccount = async (email, country = 'US') => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return account;
  } catch (error) {
    console.error('Create connected account error:', error);
    throw error;
  }
};

// ============================================
// CREATE ACCOUNT LINK (ONBOARDING)
// ============================================
const createAccountLink = async (accountId) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${config.frontend.url}/educator/onboarding/refresh`,
      return_url: `${config.frontend.url}/educator/onboarding/complete`,
      type: 'account_onboarding',
    });
    return accountLink;
  } catch (error) {
    console.error('Create account link error:', error);
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
// GET BALANCE
// ============================================
const getBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    return balance;
  } catch (error) {
    console.error('Get balance error:', error);
    throw error;
  }
};

// ============================================
// LIST TRANSACTIONS
// ============================================
const listTransactions = async (limit = 10) => {
  try {
    const transactions = await stripe.balanceTransactions.list({ limit });
    return transactions;
  } catch (error) {
    console.error('List transactions error:', error);
    throw error;
  }
};

// ============================================
// CALCULATE PLATFORM FEE
// ============================================
const calculatePlatformFee = (amount, feePercentage = 10) => {
  return (amount * feePercentage) / 100;
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  createCustomer,
  createPaymentIntent,
  createCheckoutSession,
  retrievePaymentIntent,
  refundPayment,
  createTransfer,
  createConnectedAccount,
  createAccountLink,
  verifyWebhookSignature,
  getBalance,
  listTransactions,
  calculatePlatformFee,
};