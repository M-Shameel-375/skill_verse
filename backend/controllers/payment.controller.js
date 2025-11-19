// Payment controller
// ============================================
// PAYMENT CONTROLLER
// ============================================

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Payment = require('../models/Payment.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const {
  createPaymentIntent,
  createCheckoutSession,
  verifyWebhookSignature,
} = require('../config/stripe');
const { getPagination } = require('../utils/helpers');

// ============================================
// @desc    Create payment intent
// @route   POST /api/v1/payments/create-intent
// @access  Private
// ============================================
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency, courseId, liveSessionId } = req.body;

  // Create payment intent with Stripe
  const paymentIntent = await createPaymentIntent(amount, currency, {
    userId: req.user._id.toString(),
    courseId,
    liveSessionId,
  });

  // Create payment record
  const payment = await Payment.create({
    payer: req.user._id,
    paymentType: courseId ? 'course-purchase' : 'live-session',
    course: courseId,
    liveSession: liveSessionId,
    amount: {
      subtotal: amount,
      total: amount,
    },
    currency: currency || 'USD',
    paymentIntentId: paymentIntent.id,
    gateway: {
      provider: 'stripe',
      transactionId: paymentIntent.id,
    },
    status: 'pending',
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  ApiResponse.success(
    res,
    {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    },
    'Payment intent created successfully'
  );
});

// ============================================
// @desc    Create checkout session
// @route   POST /api/v1/payments/create-checkout
// @access  Private
// ============================================
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  // Create line items
  const lineItems = [
    {
      price_data: {
        currency: course.currency.toLowerCase(),
        product_data: {
          name: course.title,
          description: course.shortDescription,
          images: [course.thumbnail?.url],
        },
        unit_amount: Math.round(course.price * 100), // Convert to cents
      },
      quantity: 1,
    },
  ];

  // Get or create Stripe customer
  let stripeCustomerId = req.user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await createCustomer(req.user.email, req.user.name, {
      userId: req.user._id.toString(),
    });
    stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(req.user._id, {
      stripeCustomerId: customer.id,
    });
  }

  // Create checkout session
  const session = await createCheckoutSession(lineItems, stripeCustomerId, {
    courseId: course._id.toString(),
    userId: req.user._id.toString(),
  });

  // Create payment record
  const payment = await Payment.create({
    payer: req.user._id,
    receiver: course.instructor,
    paymentType: 'course-purchase',
    course: courseId,
    amount: {
      subtotal: course.price,
      platformFee: course.price * 0.1, // 10% platform fee
      total: course.price,
    },
    currency: course.currency,
    paymentIntentId: session.payment_intent,
    gateway: {
      provider: 'stripe',
      transactionId: session.id,
    },
    status: 'pending',
  });

  ApiResponse.success(
    res,
    {
      sessionId: session.id,
      url: session.url,
      paymentId: payment._id,
    },
    'Checkout session created successfully'
  );
});

// ============================================
// @desc    Handle Stripe webhook
// @route   POST /api/v1/payments/webhook
// @access  Public (Stripe)
// ============================================
exports.handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = verifyWebhookSignature(req.body, sig);
  } catch (err) {
    throw ApiError.badRequest(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;

    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper function to handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  const payment = await Payment.findOne({
    paymentIntentId: paymentIntent.id,
  });

  if (payment) {
    await payment.markAsSucceeded(paymentIntent.id);

    // Enroll user in course if it's a course purchase
    if (payment.course) {
      const course = await Course.findById(payment.course);
      if (course && !course.isUserEnrolled(payment.payer)) {
        course.enrolledStudents.push({
          user: payment.payer,
          enrolledAt: new Date(),
        });
        await course.updateStudentCount();

        // Update user's enrolled courses
        await User.findByIdAndUpdate(payment.payer, {
          $addToSet: { 'learnerProfile.enrolledCourses': course._id },
        });

        // Update instructor earnings
        await User.findByIdAndUpdate(course.instructor, {
          $inc: {
            'educatorProfile.earnings.total': payment.amount.total - payment.amount.platformFee,
            'educatorProfile.earnings.pending': payment.amount.total - payment.amount.platformFee,
          },
        });
      }
    }
  }
};

// Helper function to handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  const payment = await Payment.findOne({
    paymentIntentId: paymentIntent.id,
  });

  if (payment) {
    await payment.markAsFailed(
      paymentIntent.last_payment_error?.code,
      paymentIntent.last_payment_error?.message
    );
  }
};

// Helper function to handle checkout complete
const handleCheckoutComplete = async (session) => {
  const payment = await Payment.findOne({
    'gateway.transactionId': session.id,
  });

  if (payment) {
    await payment.markAsSucceeded(session.payment_intent);
  }
};

// ============================================
// @desc    Get payment by ID
// @route   GET /api/v1/payments/:id
// @access  Private
// ============================================
exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('payer', 'name email')
    .populate('receiver', 'name email')
    .populate('course', 'title thumbnail');

  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  // Check authorization
  if (
    payment.payer.toString() !== req.user._id.toString() &&
    payment.receiver?.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view this payment');
  }

  ApiResponse.success(res, payment, 'Payment retrieved successfully');
});

// ============================================
// @desc    Get user's payment history
// @route   GET /api/v1/payments/my-payments
// @access  Private
// ============================================
exports.getMyPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const payments = await Payment.getPaymentsByUser(req.user._id);

  const paginatedPayments = payments.slice((page - 1) * limit, page * limit);
  const total = payments.length;

  const pagination = getPagination(page, limit, total);

  ApiResponse.paginated(res, paginatedPayments, pagination, 'Payments retrieved successfully');
});

// ============================================
// @desc    Get instructor earnings
// @route   GET /api/v1/payments/my-earnings
// @access  Private (Educator)
// ============================================
exports.getMyEarnings = asyncHandler(async (req, res) => {
  const earnings = await Payment.calculateTotalEarnings(req.user._id);

  const recentPayments = await Payment.getEarningsByInstructor(req.user._id);

  ApiResponse.success(
    res,
    {
      summary: earnings,
      recentPayments: recentPayments.slice(0, 10),
    },
    'Earnings retrieved successfully'
  );
});

// ============================================
// @desc    Request refund
// @route   POST /api/v1/payments/:id/refund
// @access  Private
// ============================================
exports.requestRefund = asyncHandler(async (req, res) => {
  const { reason, amount } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  // Check authorization
  if (payment.payer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to request refund');
  }

  if (payment.status !== 'succeeded') {
    throw ApiError.badRequest('Can only refund successful payments');
  }

  // Process refund (simplified - actual implementation would use Stripe API)
  await payment.processRefund(amount || payment.amount.total, reason, req.user._id);

  ApiResponse.success(res, null, 'Refund processed successfully');
});

// ============================================
// @desc    Get payment statistics (Admin)
// @route   GET /api/v1/payments/statistics
// @access  Private (Admin)
// ============================================
exports.getPaymentStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const stats = await Payment.getStatistics(
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  );

  ApiResponse.success(res, stats, 'Statistics retrieved successfully');
});

// ============================================
// @desc    Process payout to instructor
// @route   POST /api/v1/payments/:id/payout
// @access  Private (Admin)
// ============================================
exports.processPayout = asyncHandler(async (req, res) => {
  const { payoutMethod } = req.body;

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  if (payment.payout.isPaidOut) {
    throw ApiError.conflict('Payout already processed');
  }

  const payoutAmount = payment.amount.total - payment.amount.platformFee;

  await payment.processPayout(payoutAmount, payoutMethod);

  // Update instructor earnings
  await User.findByIdAndUpdate(payment.receiver, {
    $inc: {
      'educatorProfile.earnings.pending': -payoutAmount,
      'educatorProfile.earnings.withdrawn': payoutAmount,
    },
  });

  ApiResponse.success(res, null, 'Payout processed successfully');
});