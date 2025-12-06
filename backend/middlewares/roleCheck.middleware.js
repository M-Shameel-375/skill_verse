// Role check middleware
// ============================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ============================================

const ApiError = require('../utils/ApiError');

// ============================================
// AUTHORIZE ROLES
// ============================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please login to access this resource');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

// ============================================
// CHECK IF USER IS ADMIN
// ============================================
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Please login to access this resource');
  }

  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Access denied. Admin only');
  }

  next();
};

// ============================================
// CHECK IF USER IS EDUCATOR
// ============================================
exports.isEducator = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Please login to access this resource');
  }

  if (req.user.role !== 'educator' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Access denied. Educators only');
  }

  next();
};

// ============================================
// CHECK IF USER IS LEARNER
// ============================================
exports.isLearner = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Please login to access this resource');
  }

  if (req.user.role !== 'learner' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Access denied. Learners only');
  }

  next();
};

// ============================================
// CHECK RESOURCE OWNERSHIP
// ============================================
exports.checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please login to access this resource');
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Get resource from request (could be in body, params, or existing resource)
    const resource = req.resource || req.body;

    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    // Check if user owns the resource
    const resourceUserId = resource[resourceField]?.toString() || resource[resourceField];
    const currentUserId = req.user._id.toString();

    if (resourceUserId !== currentUserId) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }

    next();
  };
};

// ============================================
// CHECK MULTIPLE ROLES OR OWNERSHIP
// ============================================
exports.authorizeOrOwner = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please login to access this resource');
    }

    // Check role
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Check ownership
    const resource = req.resource || req.body;
    if (resource) {
      const resourceUserId = resource.user?.toString() || resource.user;
      const currentUserId = req.user._id.toString();

      if (resourceUserId === currentUserId) {
        return next();
      }
    }

    throw ApiError.forbidden('You do not have permission to access this resource');
  };
};

// ============================================
// REQUIRE ROLE - CHECK IF USER HAS ONE OF THE ROLES
// ============================================
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Please login to access this resource');
    }

    // Support both single role (string) and multiple roles (array)
    const userRoles = Array.isArray(req.user.roles) 
      ? req.user.roles 
      : [req.user.role];
    
    // Also check activeRole if available
    if (req.user.activeRole) {
      userRoles.push(req.user.activeRole);
    }

    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      throw ApiError.forbidden(
        `Access denied. Required role(s): ${roles.join(', ')}`
      );
    }

    next();
  };
};