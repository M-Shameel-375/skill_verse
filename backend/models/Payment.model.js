// Payment model
// ============================================
// PAYMENT MODEL
// ============================================

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // ============================================
    // PAYMENT IDENTIFIER
    // ============================================
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },

    paymentIntentId: {
      type: String,
      unique: true,
    },

    // ============================================
    // PAYER & RECEIVER
    // ============================================
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer is required'],
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // PAYMENT TYPE & DETAILS
    // ============================================
    paymentType: {
      type: String,
      enum: ['course-purchase', 'live-session', 'subscription', 'tip', 'refund'],
      required: true,
    },

    // Related entities
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },

    liveSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveSession',
    },

    // ============================================
    // AMOUNT
    // ============================================
    amount: {
      subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative'],
      },
      tax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      platformFee: {
        type: Number,
        default: 0,
        min: [0, 'Platform fee cannot be negative'],
      },
      total: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total cannot be negative'],
      },
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
    },

    // ============================================
    // DISCOUNT/COUPON
    // ============================================
    coupon: {
      code: String,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      discountValue: Number,
    },

    // ============================================
    // PAYMENT METHOD
    // ============================================
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'paypal', 'bank-transfer', 'wallet', 'other'],
        default: 'card',
      },
      card: {
        brand: String, // visa, mastercard, etc.
        last4: String,
        expiryMonth: Number,
        expiryYear: Number,
      },
      bankAccount: {
        accountHolderName: String,
        last4: String,
        bankName: String,
      },
    },

    // ============================================
    // PAYMENT GATEWAY
    // ============================================
    gateway: {
      provider: {
        type: String,
        enum: ['stripe', 'paypal', 'razorpay', 'square', 'other'],
        default: 'stripe',
      },
      transactionId: String,
      receiptUrl: String,
      invoiceUrl: String,
    },

    // ============================================
    // STATUS
    // ============================================
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'succeeded',
        'failed',
        'cancelled',
        'refunded',
        'partially-refunded',
      ],
      default: 'pending',
    },

    // ============================================
    // TIMESTAMPS
    // ============================================
    paidAt: Date,

    failedAt: Date,

    refundedAt: Date,

    // ============================================
    // REFUND DETAILS
    // ============================================
    refund: {
      isRefunded: {
        type: Boolean,
        default: false,
      },
      refundAmount: {
        type: Number,
        default: 0,
      },
      refundReason: String,
      refundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      refundedAt: Date,
      refundTransactionId: String,
    },

    // ============================================
    // PAYOUT (FOR INSTRUCTOR)
    // ============================================
    payout: {
      isPaidOut: {
        type: Boolean,
        default: false,
      },
      payoutAmount: {
        type: Number,
        default: 0,
      },
      paidOutAt: Date,
      payoutTransactionId: String,
      payoutMethod: String,
    },

    // ============================================
    // BILLING DETAILS
    // ============================================
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
    },

    // ============================================
    // INVOICE
    // ============================================
    invoice: {
      invoiceNumber: String,
      invoiceDate: Date,
      dueDate: Date,
      invoiceUrl: String,
    },

    // ============================================
    // METADATA
    // ============================================
    metadata: {
      ipAddress: String,
      userAgent: String,
      platform: String,
      description: String,
      customFields: mongoose.Schema.Types.Mixed,
    },

    // ============================================
    // ERROR HANDLING
    // ============================================
    error: {
      code: String,
      message: String,
      details: String,
    },

    // ============================================
    // NOTES
    // ============================================
    notes: String,

    isTestPayment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ payer: 1, status: 1 });
paymentSchema.index({ receiver: 1, status: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ liveSession: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'gateway.provider': 1, 'gateway.transactionId': 1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Net amount (after platform fee)
paymentSchema.virtual('netAmount').get(function () {
  return this.amount.total - this.amount.platformFee;
});

// Is payment successful
paymentSchema.virtual('isSuccessful').get(function () {
  return this.status === 'succeeded';
});

// Is payment pending
paymentSchema.virtual('isPending').get(function () {
  return this.status === 'pending' || this.status === 'processing';
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Generate transaction ID
paymentSchema.pre('save', function (next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;
  }
  next();
});

// Calculate total amount
paymentSchema.pre('save', function (next) {
  if (this.isModified('amount')) {
    this.amount.total =
      this.amount.subtotal +
      this.amount.tax -
      this.amount.discount +
      this.amount.platformFee;
  }
  next();
});

// Set paidAt timestamp
paymentSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'succeeded' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

// Set failedAt timestamp
paymentSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'failed' && !this.failedAt) {
    this.failedAt = new Date();
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Mark as succeeded
paymentSchema.methods.markAsSucceeded = async function (gatewayTransactionId) {
  this.status = 'succeeded';
  this.paidAt = new Date();
  this.gateway.transactionId = gatewayTransactionId;
  await this.save();
};

// Mark as failed
paymentSchema.methods.markAsFailed = async function (errorCode, errorMessage) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.error = {
    code: errorCode,
    message: errorMessage,
  };
  await this.save();
};

// Process refund
paymentSchema.methods.processRefund = async function (
  refundAmount,
  reason,
  refundedBy
) {
  if (this.status !== 'succeeded') {
    throw new Error('Can only refund successful payments');
  }

  const isPartialRefund = refundAmount < this.amount.total;

  this.refund = {
    isRefunded: true,
    refundAmount: refundAmount,
    refundReason: reason,
    refundedBy: refundedBy,
    refundedAt: new Date(),
  };

  this.status = isPartialRefund ? 'partially-refunded' : 'refunded';
  this.refundedAt = new Date();

  await this.save();
};

// Process payout to instructor
paymentSchema.methods.processPayout = async function (payoutAmount, payoutMethod) {
  if (this.status !== 'succeeded') {
    throw new Error('Can only payout successful payments');
  }

  this.payout = {
    isPaidOut: true,
    payoutAmount: payoutAmount,
    paidOutAt: new Date(),
    payoutMethod: payoutMethod,
  };

  await this.save();
};

// Generate invoice number
paymentSchema.methods.generateInvoice = async function () {
  if (!this.invoice.invoiceNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
      },
    });

    this.invoice.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(
      5,
      '0'
    )}`;
    this.invoice.invoiceDate = new Date();
  }

  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get payments by user
paymentSchema.statics.getPaymentsByUser = function (userId) {
  return this.find({ payer: userId })
    .sort({ createdAt: -1 })
    .populate('course', 'title thumbnail')
    .populate('liveSession', 'title');
};

// Get earnings by instructor
paymentSchema.statics.getEarningsByInstructor = function (instructorId) {
  return this.find({
    receiver: instructorId,
    status: 'succeeded',
  }).sort({ createdAt: -1 });
};

// Calculate total earnings
paymentSchema.statics.calculateTotalEarnings = async function (instructorId) {
  const result = await this.aggregate([
    {
      $match: {
        receiver: instructorId,
        status: 'succeeded',
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$amount.total' },
        totalPlatformFees: { $sum: '$amount.platformFee' },
        netEarnings: { $sum: { $subtract: ['$amount.total', '$amount.platformFee'] } },
        totalPayouts: {
          $sum: {
            $cond: ['$payout.isPaidOut', '$payout.payoutAmount', 0],
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || {
    totalEarnings: 0,
    totalPlatformFees: 0,
    netEarnings: 0,
    totalPayouts: 0,
    count: 0,
  };
};

// Get payment statistics
paymentSchema.statics.getStatistics = async function (startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(0),
      $lte: endDate || new Date(),
    },
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.total' },
      },
    },
  ]);

  const byType = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.total' },
      },
    },
  ]);

  return {
    byStatus: stats,
    byType,
  };
};

// Get pending payouts
paymentSchema.statics.getPendingPayouts = function () {
  return this.find({
    status: 'succeeded',
    'payout.isPaidOut': false,
  }).populate('receiver', 'name email');
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Payment', paymentSchema);