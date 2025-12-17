# Admin Access Control - NovaVote

## 🔐 Overview

NovaVote implements **IP-based admin access control** to ensure that administrative functions (creating elections, starting/ending elections) are only accessible from the host computer, while all other devices on the network can only vote, view results, and audit the blockchain.

## How It Works

### Admin Functions (Localhost Only)
The following operations are restricted to `localhost` access only:

- ✅ **Create Election** - Only from host PC
- ✅ **Start Election** - Only from host PC
- ✅ **End Election** - Only from host PC
- ✅ **Admin Dashboard** - Only visible from host PC

### Public Functions (All Devices)
These operations are accessible from any device on the network:

- ✅ **Vote** - Anyone can cast votes
- ✅ **View Elections** - Anyone can view election details
- ✅ **View Results** - Anyone can see vote tallies
- ✅ **Audit Trail** - Anyone can verify blockchain integrity
- ✅ **Receipt Verification** - Anyone can verify their vote was counted

## Implementation Details

### Backend Middleware

**File: `backend/src/middleware/adminAccess.js`**

Two middleware functions are provided:

1. **`isLocalhost`** - Blocks non-localhost requests (403 Forbidden)
2. **`checkAdminAccess`** - Adds `req.isAdmin` flag for conditional logic

```javascript
// Example usage in routes
router.post('/create', isLocalhost, async (req, res) => {
  // Only accessible from localhost
});
```

### IP Address Detection

The middleware checks the following IP addresses:
- `127.0.0.1` (IPv4 localhost)
- `::1` (IPv6 localhost)
- `::ffff:127.0.0.1` (IPv6-mapped IPv4 localhost)
- `localhost` (hostname)

### Protected Routes

**Backend Routes Protected:**
```
POST /api/elections/create        → Admin only (create election)
POST /api/elections/:id/start     → Admin only (start election)
POST /api/elections/:id/end       → Admin only (end election)
```

**Public Routes:**
```
GET  /api/elections               → Anyone (list elections)
GET  /api/elections/:id           → Anyone (view election)
POST /api/votes/submit            → Anyone (submit vote)
GET  /api/votes/:id/results       → Anyone (view results)
GET  /api/audit/:id/trail         → Anyone (audit trail)
POST /api/audit/:id/verify        → Anyone (verify blockchain)
```

### Frontend Access Control

**File: `frontend/src/App.jsx`**

The frontend automatically:
1. Checks admin access on load via `/api/admin/check`
2. Shows/hides Admin menu item based on access level
3. Conditionally renders Admin route
4. Displays "Host Only" badge in navigation

**What Users See:**

**From Host PC (localhost):**
```
Navigation: Home | Admin (Host Only)
Footer: "🔐 Admin Mode - Host Computer Access"
Access: Full admin dashboard available
```

**From Other Devices (remote):**
```
Navigation: Home
Footer: Regular copyright text
Access: Admin menu hidden, /admin route blocked
```

## Testing Admin Access

### From Host Computer

1. Open browser on the host PC
2. Navigate to `http://localhost:5173`
3. You should see "Admin" link in navigation
4. Can access `http://localhost:5173/admin`

### From Remote Device (Phone/Tablet)

1. Open browser on mobile device
2. Navigate to `http://YOUR_IP:5173` (e.g., `http://10.30.72.222:5173`)
3. Admin link is NOT visible in navigation
4. Attempting to access `/admin` directly will fail
5. Can still vote, view results, and audit

## API Endpoint for Access Check

**GET `/api/admin/check`**

Returns current user's admin status:

```json
{
  "isAdmin": true,
  "message": "Admin access granted (localhost)"
}
```

Or:

```json
{
  "isAdmin": false,
  "message": "Regular user access (remote device)"
}
```

## Security Considerations

### Current Implementation ✅

- ✅ IP-based access control (localhost only for admin)
- ✅ Frontend hides admin UI from non-admin users
- ✅ Backend blocks admin API calls from remote IPs
- ✅ Clear error messages for unauthorized access

### Additional Security (For Production) ⚠️

Consider adding these for production deployments:

1. **Authentication Layer**
   - Username/password for admin
   - Session management
   - JWT tokens

2. **Rate Limiting**
   - Prevent brute force attempts
   - Limit API calls per IP

3. **HTTPS/SSL**
   - Encrypt all traffic
   - Prevent MITM attacks

4. **Audit Logging**
   - Log all admin actions
   - Track IP addresses and timestamps

5. **Multi-Factor Authentication**
   - Extra layer for admin access
   - SMS or authenticator app

## Error Messages

### 403 Forbidden (Admin Access Denied)

When a remote device tries to access admin functions:

```json
{
  "error": "Access denied",
  "message": "Admin functions are only accessible from the host computer"
}
```

## Configuration

### Environment Variable

**File: `backend/.env`**

```env
ADMIN_LOCALHOST_ONLY=true
```

Set to `true` to enable localhost-only admin access (recommended).
Set to `false` to allow admin access from any IP (NOT recommended for production).

## Workflow Examples

### Admin Workflow (Host PC Only)

1. Open `http://localhost:5173` on host computer
2. Click "Admin" in navigation
3. Create new election with candidates
4. Set start/end times
5. Start election when ready
6. Monitor participation
7. End election when complete
8. View final results

### Voter Workflow (Any Device)

1. Open `http://YOUR_IP:5173` on any device
2. Browse available elections
3. Click to vote in active election
4. Select candidate and submit vote
5. Receive receipt for verification
6. View results after election ends
7. Verify vote was counted in audit trail

## Troubleshooting

### Problem: Can't access admin from host PC

**Solutions:**
- Ensure you're using `http://localhost:5173` (not your IP)
- Clear browser cache and reload
- Check backend is running and accessible
- Verify `/api/admin/check` returns `isAdmin: true`

### Problem: Admin visible on remote device

**Solutions:**
- Clear browser cache on remote device
- Check backend middleware is properly applied
- Verify `isLocalhost` middleware is on admin routes
- Restart backend server

### Problem: 403 Forbidden errors

**Cause:** Remote device trying to access admin functions

**Expected Behavior:** This is working correctly - admin functions are blocked for non-localhost access

## Testing Commands

### Check Admin Access from Host

```bash
curl http://localhost:3000/api/admin/check
```

Expected response:
```json
{"isAdmin": true, "message": "Admin access granted (localhost)"}
```

### Check Admin Access from Remote

```bash
curl http://YOUR_IP:3000/api/admin/check
```

Expected response:
```json
{"isAdmin": false, "message": "Regular user access (remote device)"}
```

### Test Admin Endpoint from Remote (Should Fail)

```bash
curl -X POST http://YOUR_IP:3000/api/elections/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

Expected response:
```json
{"error": "Access denied", "message": "Admin functions are only accessible from the host computer"}
```

## File Changes Summary

### Backend Files Created/Modified

- ✅ `backend/src/middleware/adminAccess.js` - New middleware
- ✅ `backend/src/routes/admin.js` - New admin check endpoint
- ✅ `backend/src/routes/elections.js` - Added `isLocalhost` middleware
- ✅ `backend/src/server.js` - Registered admin routes
- ✅ `backend/.env` - Added admin config

### Frontend Files Modified

- ✅ `frontend/src/App.jsx` - Admin access check and conditional routing
- ✅ `frontend/src/components/Layout.jsx` - Conditional admin menu
- ✅ `frontend/src/services/api.js` - Added admin API

## Best Practices

1. **Always access admin from localhost** - Use `http://localhost:5173`
2. **Share network URL for voters** - Give users `http://YOUR_IP:5173`
3. **Monitor admin actions** - Check backend logs for admin operations
4. **Keep backend secure** - Don't expose admin credentials
5. **Use HTTPS in production** - Encrypt all traffic

## Future Enhancements

Potential improvements for production:

- [ ] Add password-based authentication for admin
- [ ] Implement role-based access control (RBAC)
- [ ] Add audit logging for all admin actions
- [ ] Support multiple admin users with permissions
- [ ] Add email notifications for admin actions
- [ ] Implement 2FA for admin access
- [ ] Add IP whitelist for additional security

---

**Status:** ✅ Implemented and Active

**Security Level:** Medium (IP-based) - Suitable for local network deployments

**Recommended For:** Testing, demos, small private elections on trusted networks

**Not Recommended For:** Public internet deployments without additional security

---

*For questions or security concerns, review the middleware implementation in `backend/src/middleware/adminAccess.js`*
