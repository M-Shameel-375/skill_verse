// API Response utility
// ============================================
// STANDARDIZED API RESPONSE HANDLER
// ============================================

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  // ============================================
  // SUCCESS RESPONSES
  // ============================================

  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  static created(res, data, message = 'Resource created successfully') {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  static noContent(res, message = 'No content') {
    return res.status(204).json(new ApiResponse(204, null, message));
  }

  // ============================================
  // CUSTOM RESPONSES
  // ============================================

  static custom(res, statusCode, data, message) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  }

  // ============================================
  // PAGINATION RESPONSE
  // ============================================

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    });
  }
}

module.exports = ApiResponse;