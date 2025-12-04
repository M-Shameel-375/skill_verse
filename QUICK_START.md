# 🚀 Quick Start Guide - SkillVerse

## ✅ Backend is Now Running!

Your backend server is successfully running at:
- **URL:** http://localhost:5000
- **Database:** MongoDB Atlas (Connected)
- **Status:** ✅ Online

---

## 📝 What Was Fixed

### 1. **Backend Connection**
- ✅ Started backend server on port 5000
- ✅ Connected to MongoDB Atlas

### 2. **Error Handling Improvements**
- ✅ Better error messages in RoleSelection
- ✅ Shows actual backend error (not generic "Please try again")
- ✅ Handles "Role already set" gracefully
- ✅ RootLayout uses cached data if backend unavailable

### 3. **Role Selection Logic**
- ✅ If role already set → shows message and redirects to dashboard
- ✅ Backend prevents role changes once set
- ✅ No more "Failed to set role" for valid requests

---

## 🧪 Test Your App Now

### Step 1: Refresh Your Browser
- Press `Ctrl + Shift + R` (hard refresh)
- This will reload with backend connected

### Step 2: New User Flow
1. Visit http://localhost:5173/select-role
2. Click on "Educator" (or any role)
3. Click "Continue as Educator"
4. Should see: ✅ "Welcome! You're now registered as a educator"
5. Redirects to dashboard

### Step 3: Try to Change Role (Should Fail)
1. Visit http://localhost:5173/select-role again
2. Should immediately redirect to dashboard
3. OR if page loads, role cards should be hidden
4. Shows: "Your Role: Educator 🎯"
5. Button: "Go to Dashboard"

---

## 🔧 How to Keep Backend Running

Your backend is running in the background. To check status:

```powershell
# See backend logs
Get-Process node
```

To stop backend:
```powershell
# Stop all Node processes
Stop-Process -Name node -Force
```

To restart backend:
```powershell
cd D:\GitHub\skill_verse\backend
npm start
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch" or "Connection Refused"
**Solution:** Backend not running
```powershell
cd D:\GitHub\skill_verse\backend
npm start
```

### Issue: "Failed to set role. Please try again"
**Possible Causes:**
1. Backend not running → Start backend
2. MongoDB not connected → Check `.env` file has correct `MONGODB_URI`
3. Role already set → Backend returns specific error, frontend now handles this

**Solution:** Check backend terminal output for actual error

### Issue: Can still access role selection with existing role
**This is now fixed!** 
- RootLayout checks role and redirects
- RoleSelection checks role and hides cards
- Backend rejects role change requests

---

## 📊 Backend Terminal Output (What to Look For)

✅ **Good Output:**
```
🚀 SkillVerse Server is running
📡 Environment: development
🌐 Port: 5000
✅ MongoDB Connected Successfully
```

❌ **Bad Output:**
```
❌ MongoDB Connection Failed
Error: connect ECONNREFUSED
```
→ Fix: Check MongoDB URI in `.env`

---

## 🎯 Expected User Experience

### New User
1. Signs up → redirected to `/select-role`
2. Sees 3 role cards: Learner, Educator, Skill Exchanger
3. Clicks a role → green checkmark appears
4. Clicks "Continue as [Role]"
5. Success toast: "Welcome! You're now registered as a [role]"
6. Redirected to dashboard
7. **Role is now permanent**

### Existing User
1. Signs in → immediately redirected to dashboard
2. **Cannot access landing page** (auto-redirect)
3. **Cannot access `/select-role`** (auto-redirect)
4. If somehow reaches role selection → sees current role + "Go to Dashboard" button
5. Role cards are hidden

### User Tries to Change Role
1. Visits `/select-role` → immediately redirected to dashboard
2. Tries to call API directly → Backend returns error:
   ```json
   {
     "success": false,
     "message": "Role already set to educator. Cannot change role once selected."
   }
   ```

---

## 🔍 Console Messages (What's Normal)

### ✅ Normal Messages
```javascript
✅ User synced with MongoDB: educator
// User role loaded successfully

Clerk: Learn more about deployments at https://clerk.com/docs/deployments/overview
// Just a deprecation warning, ignore it

(node:25104) [DEP0040] DeprecationWarning: The `punycode` module is deprecated
// Harmless warning from dependencies
```

### ❌ Error Messages (Need Action)
```javascript
❌ Failed to sync user: AxiosError
// Backend not running → Start backend

Failed to load resource: net::ERR_CONNECTION_REFUSED
// Backend not running → Start backend

Role selection error: TypeError: Failed to fetch
// Backend not running → Start backend
```

---

## 📱 API Endpoints

### POST `/api/v1/users/sync`
- **Purpose:** Sync Clerk user to MongoDB
- **Called by:** RootLayout automatically
- **Response:** User object with role

### PUT `/api/v1/users/role`
- **Purpose:** Set user role (one-time only)
- **Called by:** RoleSelection on "Continue" button
- **Validation:** Prevents role changes if already set

---

## ✨ Summary

**Current Status:**
- ✅ Backend running on port 5000
- ✅ MongoDB connected
- ✅ Frontend can communicate with backend
- ✅ Role selection should now work
- ✅ Error handling improved
- ✅ Role change prevention working

**Next Steps:**
1. Refresh your browser (Ctrl + Shift + R)
2. Try selecting a role
3. Should work without errors!

**If you still see errors:**
- Check backend terminal is still running
- Check browser console for specific error messages
- Make sure you're on http://localhost:5173 (not 5174 or other port)

---

## 🎉 You're All Set!

Your authentication flow is now complete and working:
- ✅ Backend running
- ✅ Database connected
- ✅ Role selection works
- ✅ Role changes prevented
- ✅ Proper redirects
- ✅ Better error handling

**Enjoy building SkillVerse! 🚀**
