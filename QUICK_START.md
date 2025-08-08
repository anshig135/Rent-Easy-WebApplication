# 🚀 Quick Start Guide - RentEasy

## ✅ Application is Now Running!

### 🌐 Access URLs
- **Frontend (React App)**: http://localhost:3000
- **Backend (API)**: http://localhost:5000

### 👥 Demo Accounts

#### 🛠️ Admin Account
- **Email**: `admin@renteasy.com`
- **Password**: `admin123`
- **Features**: User management, property approval, platform statistics

#### 🏡 Property Owner Account
- **Email**: `sarah@example.com`  
- **Password**: `admin123`
- **Features**: Add/manage properties, respond to booking requests

#### 🔍 Renter Account
- **Email**: `john@example.com`
- **Password**: `admin123`
- **Features**: Browse properties, send booking requests

### 🎯 What to Try

1. **Visit the Homepage**: http://localhost:3000
   - See the hero section with beautiful gradient
   - Browse featured properties
   - View statistics cards

2. **Test Authentication**:
   - Click "Login" or "Sign Up" 
   - Try logging in with any demo account
   - Notice role-based navigation changes

3. **Browse Properties**:
   - Click "Properties" in navigation
   - See the property listing page (currently shows placeholder)
   - Properties API endpoint works: http://localhost:5000/api/properties

4. **Role-based Dashboards**:
   - Login and visit Dashboard
   - See different options based on user role
   - Each role has customized quick actions

### 🛠️ Manual Startup (Alternative)

If you need to restart manually:

```bash
# Terminal 1 - Backend
cd backend
node demo-server.js

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 🔧 API Testing

Test the API directly:
```bash
# Get properties
curl http://localhost:5000/api/properties

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"admin123"}'
```

### 📋 Current Features Working
- ✅ Authentication system (register/login/logout)
- ✅ Role-based access control
- ✅ JWT token management
- ✅ Property listing API with filters
- ✅ Responsive React UI with Bootstrap
- ✅ Professional styling and animations
- ✅ In-memory data store (2 sample properties)

### 🚧 Demo Limitations
- Uses in-memory data storage (resets on restart)
- Some pages show placeholders (Properties, Bookings, etc.)
- Image uploads not fully implemented in demo
- No actual database persistence

### 🎨 UI Preview
The application features:
- Modern gradient design (blue/purple theme)
- Responsive Bootstrap layout
- Animated cards with hover effects
- Role-based navigation menus
- Professional typography and spacing
- Toast notifications for user feedback

**Enjoy exploring your RentEasy application!** 🏠✨
