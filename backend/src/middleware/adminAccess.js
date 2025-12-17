/**
 * Middleware to restrict admin access to localhost only
 * This ensures admin functions can only be accessed from the host PC
 */

const isLocalhost = (req, res, next) => {
  // Get client IP from various sources
  const clientIp = req.ip || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   '127.0.0.1';
  
  // Normalize IP address (remove IPv6 prefix)
  const normalizedIp = clientIp.replace(/^::ffff:/, '').trim();
  
  // Log for debugging
  console.log('Admin access check - Client IP:', normalizedIp);
  
  // Check if request is from localhost
  const isLocal = 
    normalizedIp === '127.0.0.1' || 
    normalizedIp === 'localhost' || 
    normalizedIp === '::1' ||
    normalizedIp === '1' || // Sometimes appears as just '1'
    normalizedIp === '' ||  // Empty can mean localhost in some configs
    normalizedIp === '::ffff:127.0.0.1';
  
  if (!isLocal) {
    console.log('Admin access denied for IP:', normalizedIp);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin functions are only accessible from the host computer'
    });
  }
  
  console.log('Admin access granted for IP:', normalizedIp);
  next();
};

/**
 * Middleware to check if user is admin (localhost access)
 * Adds isAdmin flag to request object
 */
const checkAdminAccess = (req, res, next) => {
  // Get client IP from various sources
  const clientIp = req.ip || 
                   req.connection?.remoteAddress || 
                   req.socket?.remoteAddress ||
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   '127.0.0.1';
  
  // Normalize IP address (remove IPv6 prefix)
  const normalizedIp = clientIp.replace(/^::ffff:/, '').trim();
  
  // Check if request is from localhost
  req.isAdmin = 
    normalizedIp === '127.0.0.1' || 
    normalizedIp === 'localhost' || 
    normalizedIp === '::1' ||
    normalizedIp === '1' || // Sometimes appears as just '1'
    normalizedIp === '' ||  // Empty can mean localhost in some configs
    normalizedIp === '::ffff:127.0.0.1';
  
  console.log('Admin check - IP:', normalizedIp, 'isAdmin:', req.isAdmin);
  next();
};

module.exports = {
  isLocalhost,
  checkAdminAccess
};
