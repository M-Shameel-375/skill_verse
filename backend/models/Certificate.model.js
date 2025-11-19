// Certificate model
// ============================================
// CERTIFICATE MODEL
// ============================================

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    // ============================================
    // CERTIFICATE IDENTIFIER
    // ============================================
    certificateId: {
      type: String,
      unique: true,
      required: true,
    },

    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // ============================================
    // RECIPIENT
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
    },

    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true,
    },

    // ============================================
    // CERTIFICATE TYPE & SOURCE
    // ============================================
    certificateType: {
      type: String,
      enum: ['course-completion', 'quiz-pass', 'skill-exchange', 'live-session', 'achievement'],
      required: true,
    },

    // Related entities
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },

    liveSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveSession',
    },

    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
    },

    // ============================================
    // COURSE/CONTENT DETAILS
    // ============================================
    courseName: {
      type: String,
      required: [true, 'Course/Content name is required'],
      trim: true,
    },

    instructorName: {
      type: String,
      trim: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // ============================================
    // ACHIEVEMENT DETAILS
    // ============================================
    achievement: {
      title: String,
      description: String,
      criteria: String,
    },

    // ============================================
    // COMPLETION DETAILS
    // ============================================
    completionDate: {
      type: Date,
      required: [true, 'Completion date is required'],
      default: Date.now,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      default: null, // null = never expires
    },

    duration: {
      hours: Number,
      startDate: Date,
      endDate: Date,
    },

    // ============================================
    // PERFORMANCE METRICS
    // ============================================
    performance: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'Pass', 'Fail'],
      },
      rank: Number,
      totalParticipants: Number,
    },

    skills: [
      {
        name: String,
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
      },
    ],

    // ============================================
    // CERTIFICATE FILE
    // ============================================
    certificateFile: {
      url: {
        type: String,
        required: true,
      },
      publicId: String,
      format: {
        type: String,
        enum: ['pdf', 'png', 'jpg'],
        default: 'pdf',
      },
      size: Number,
    },

    // ============================================
    // TEMPLATE & DESIGN
    // ============================================
    template: {
      type: String,
      default: 'default',
    },

    design: {
      backgroundColor: String,
      textColor: String,
      borderColor: String,
      logoUrl: String,
      signature: {
        name: String,
        title: String,
        imageUrl: String,
      },
    },

    // ============================================
    // VERIFICATION
    // ============================================
    verification: {
      verificationCode: {
        type: String,
        required: true,
        unique: true,
      },
      verificationUrl: String,
      qrCodeUrl: String,
      isVerified: {
        type: Boolean,
        default: true,
      },
      verifiedAt: Date,
    },

    // ============================================
    // BLOCKCHAIN (OPTIONAL)
    // ============================================
    blockchain: {
      enabled: {
        type: Boolean,
        default: false,
      },
      transactionHash: String,
      blockNumber: Number,
      network: String,
      smartContractAddress: String,
    },

    // ============================================
    // STATUS
    // ============================================
    status: {
      type: String,
      enum: ['issued', 'revoked', 'suspended', 'expired'],
      default: 'issued',
    },

    // ============================================
    // REVOCATION
    // ============================================
    revocation: {
      isRevoked: {
        type: Boolean,
        default: false,
      },
      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      revokedAt: Date,
      reason: String,
    },

    // ============================================
    // SHARING & VISIBILITY
    // ============================================
    sharing: {
      isPublic: {
        type: Boolean,
        default: true,
      },
      sharedOn: [
        {
          platform: {
            type: String,
            enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'email'],
          },
          sharedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      downloadCount: {
        type: Number,
        default: 0,
      },
      viewCount: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // METADATA
    // ============================================
    metadata: {
      platform: {
        type: String,
        default: 'SkillVerse',
      },
      version: {
        type: String,
        default: '1.0',
      },
      language: {
        type: String,
        default: 'en',
      },
      customFields: mongoose.Schema.Types.Mixed,
    },

    // ============================================
    // CREDENTIALS
    // ============================================
    credentials: [
      {
        type: String,
        description: String,
      },
    ],

    // ============================================
    // ORGANIZATION/ISSUER INFO
    // ============================================
    issuer: {
      name: {
        type: String,
        default: 'SkillVerse',
      },
      logo: String,
      website: String,
      contactEmail: String,
    },

    // ============================================
    // ACCREDITATION (OPTIONAL)
    // ============================================
    accreditation: {
      isAccredited: {
        type: Boolean,
        default: false,
      },
      accreditingBody: String,
      accreditationNumber: String,
      accreditationDate: Date,
    },

    // ============================================
    // NOTES
    // ============================================
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ user: 1, status: 1 });
certificateSchema.index({ course: 1 });
certificateSchema.index({ 'verification.verificationCode': 1 });
certificateSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Check if certificate is valid
certificateSchema.virtual('isValid').get(function () {
  if (this.status !== 'issued') return false;
  if (this.revocation.isRevoked) return false;
  if (this.expiryDate && new Date() > this.expiryDate) return false;
  return true;
});

// Check if certificate is expired
certificateSchema.virtual('isExpired').get(function () {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

// ============================================
// MIDDLEWARE - PRE SAVE
// ============================================

// Generate certificate ID and number
certificateSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate unique certificate ID
    this.certificateId = `CERT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

    // Generate certificate number (format: SV-2024-000001)
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.certificateNumber = `SV-${year}-${String(count + 1).padStart(6, '0')}`;

    // Generate verification code
    this.verification.verificationCode = `VER-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;

    // Generate verification URL
    this.verification.verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${this.verification.verificationCode}`;
  }
  next();
});

// Update status based on expiry
certificateSchema.pre('save', function (next) {
  if (this.expiryDate && new Date() > this.expiryDate && this.status === 'issued') {
    this.status = 'expired';
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Revoke certificate
certificateSchema.methods.revoke = async function (revokedBy, reason) {
  this.status = 'revoked';
  this.revocation = {
    isRevoked: true,
    revokedBy: revokedBy,
    revokedAt: new Date(),
    reason: reason,
  };
  await this.save();
};

// Suspend certificate
certificateSchema.methods.suspend = async function () {
  this.status = 'suspended';
  await this.save();
};

// Reactivate certificate
certificateSchema.methods.reactivate = async function () {
  if (this.revocation.isRevoked) {
    throw new Error('Cannot reactivate a revoked certificate');
  }
  this.status = 'issued';
  await this.save();
};

// Track download
certificateSchema.methods.trackDownload = async function () {
  this.sharing.downloadCount += 1;
  await this.save();
};

// Track view
certificateSchema.methods.trackView = async function () {
  this.sharing.viewCount += 1;
  await this.save();
};

// Share on platform
certificateSchema.methods.shareOn = async function (platform) {
  const existingShare = this.sharing.sharedOn.find((s) => s.platform === platform);
  
  if (!existingShare) {
    this.sharing.sharedOn.push({
      platform: platform,
      sharedAt: new Date(),
    });
    await this.save();
  }
};

// Verify certificate
certificateSchema.methods.verify = function () {
  return {
    isValid: this.isValid,
    certificateNumber: this.certificateNumber,
    recipientName: this.recipientName,
    courseName: this.courseName,
    completionDate: this.completionDate,
    issueDate: this.issueDate,
    status: this.status,
    verification: {
      verificationCode: this.verification.verificationCode,
      isVerified: this.verification.isVerified,
    },
  };
};

// Generate shareable link
certificateSchema.methods.getShareableLink = function () {
  return `${process.env.FRONTEND_URL}/certificates/${this.certificateId}`;
};

// ============================================
// STATIC METHODS
// ============================================

// Get certificates by user
certificateSchema.statics.getCertificatesByUser = function (userId) {
  return this.find({ user: userId, status: 'issued' })
    .sort({ issueDate: -1 })
    .populate('course', 'title')
    .populate('instructor', 'name');
};

// Verify certificate by code
certificateSchema.statics.verifyByCode = async function (verificationCode) {
  const certificate = await this.findOne({
    'verification.verificationCode': verificationCode,
  });

  if (!certificate) {
    return { valid: false, message: 'Certificate not found' };
  }

  if (!certificate.isValid) {
    return {
      valid: false,
      message: 'Certificate is not valid',
      reason: certificate.status,
    };
  }

  return {
    valid: true,
    certificate: certificate.verify(),
  };
};

// Get expiring certificates
certificateSchema.statics.getExpiringCertificates = function (days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: 'issued',
    expiryDate: {
      $gte: new Date(),
      $lte: futureDate,
    },
  }).populate('user', 'name email');
};

// Get statistics
certificateSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await this.countDocuments();
  const byType = await this.aggregate([
    {
      $group: {
        _id: '$certificateType',
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    total,
    byStatus: stats,
    byType,
  };
};

// ============================================
// EXPORT MODEL
// ============================================
module.exports = mongoose.model('Certificate', certificateSchema);