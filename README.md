# RentEasy - Property Rental Management System

A full-stack web application for managing rental properties with separate interfaces for renters, property owners, and administrators.

## Features

### Core Functionality
- **Authentication & Authorization**: JWT-based authentication with role-based access (Admin, Property Owner, Renter)
- **Property Management**: Add, edit, delete, and browse rental properties
- **Property Search & Discovery**: Filter by location, price range, property type, bedrooms/bathrooms
- **Booking System**: Renters can request bookings, owners can approve/reject
- **Admin Dashboard**: Platform management, user moderation, property approval

### User Roles

#### Admin
- Manage users (activate/deactivate, delete)
- Approve/reject property listings
- View platform statistics
- Monitor all bookings

#### Property Owner
- List and manage rental properties
- View and respond to booking requests
- Upload property images
- View booking statistics

#### Renter
- Browse and search properties
- View property details
- Send booking requests
- Track booking status

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **multer** for file uploads
- **express-validator** for input validation

### Frontend
- **React** with hooks
- **React Router** for navigation
- **React Bootstrap** for UI components
- **Axios** for API calls
- **React Context** for state management

## Project Structure

```
rental-property-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # File upload directory
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API service functions
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (already provided) and update the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rental_property_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

4. Start MongoDB service on your system

5. Run the backend server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Properties
- `GET /api/properties` - Get all approved properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (owner only)
- `PUT /api/properties/:id` - Update property (owner only)
- `DELETE /api/properties/:id` - Delete property (owner only)
- `GET /api/properties/owner/my-properties` - Get owner's properties

### Bookings
- `POST /api/bookings` - Create booking request (renter only)
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status (owner only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (renter only)

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/properties` - Get all properties
- `PUT /api/admin/properties/:id/approval` - Update property approval

## Usage

### Getting Started

1. **Register an Account**: Choose your role (Renter, Property Owner, or create an Admin account)

2. **As a Property Owner**:
   - Add properties through the "Add Property" page
   - Wait for admin approval
   - Manage booking requests from renters

3. **As a Renter**:
   - Browse available properties
   - Filter by location, price, type, etc.
   - Send booking requests for desired properties

4. **As an Admin**:
   - Approve/reject property listings
   - Manage user accounts
   - Monitor platform statistics

### Key Features

- **Secure Authentication**: JWT-based with role-based access control
- **Image Upload**: Property owners can upload multiple images
- **Search & Filter**: Advanced filtering options for property discovery
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Booking status updates and notifications

## Development Notes

- The application uses a proxy in the frontend `package.json` to route API calls to the backend
- File uploads are stored in the `backend/uploads/properties/` directory
- All routes are protected based on user roles
- Input validation is implemented on both client and server sides

## Future Enhancements

- Map integration for property locations
- Payment processing for bookings
- Email notifications for booking updates
- Advanced property search with geolocation
- Property reviews and ratings
- Messaging system between owners and renters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
