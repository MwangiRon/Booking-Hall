# Sports Hall Booking System Documentation

## Project Purpose

The Sports Hall Booking System is a web application designed to facilitate the reservation and management of sports facilities. It allows users to:

- View available sports halls
- Check hall availability
- Make bookings for specific times and dates
- Manage their existing bookings
- Administrators can manage halls and view all bookings

The system provides a streamlined interface for sports enthusiasts, teams, and facility managers to efficiently coordinate the use of sports venues, reducing scheduling conflicts and maximizing facility utilization.

## Implementation

The Sports Hall Booking System is built using modern web technologies:

- **Frontend**: SvelteKit with Bootstrap 5 for responsive UI components
- **Backend**: SvelteKit server endpoints (API routes)
- **Database**: PostgreSQL accessed via Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) for secure user sessions

The application follows a component-based architecture with SvelteKit, separating concerns between UI components, server endpoints, and data management. It implements a responsive design that works well on desktop and mobile devices.

## Codebase Structure

The project follows a standard SvelteKit structure with the following organization:

```
src/
├── app.html               # Main HTML template
├── app-theme.css          # Global CSS styles
├── lib/                   # Shared code library
│   ├── components/        # Reusable UI components
│   │   ├── BookingForm.svelte
│   │   ├── BookingList.svelte
│   │   ├── HallDetail.svelte
│   │   ├── HallForm.svelte
│   │   ├── HallList.svelte
│   │   ├── Login.svelte
│   │   ├── Navbar.svelte
│   │   ├── Register.svelte
│   │   └── WeatherWidget.svelte
│   ├── server/            # Server-side utilities
│   │   ├── jwt.ts         # JWT authentication helpers
│   │   └── prisma.ts      # Database connection
│   └── stores/            # Svelte stores
│       └── auth.ts        # Authentication state management
├── routes/                # Application routes
│   ├── +layout.svelte     # Main layout template
│   ├── +page.svelte       # Homepage
│   ├── api/               # Server API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bookings/      # Booking management endpoints
│   │   ├── halls/         # Hall management endpoints
│   │   └── timeslots/     # Timeslot availability endpoints
│   ├── bookings/          # Booking pages
│   │   ├── +page.server.ts # Server load function
│   │   └── +page.svelte   # Booking UI
│   ├── halls/             # Hall listing/details pages
│   │   ├── +page.server.ts # Server load function
│   │   └── +page.svelte   # Halls UI
│   ├── login/             # Login page
│   │   └── +page.svelte
│   └── register/          # Registration page
│       └── +page.svelte
└── static/                # Static assets
    ├── favicon.png
    └── css/
        └── app-theme.css  # Compiled CSS
```

## API Description

The system provides the following REST API endpoints:

### Authentication APIs

- `POST /api/auth/register`: Create a new user account
  - Body: `{ username, email, password }`
  - Returns: Success message

- `POST /api/auth/login`: Authenticate a user
  - Body: `{ username, password }`
  - Returns: JWT token

- `POST /api/auth/logout`: End a user session
  - Returns: Success message

### Hall Management APIs

- `GET /api/halls`: Get a list of all sports halls
  - Returns: Array of hall objects

- `GET /api/halls/:id`: Get details of a specific hall
  - Returns: Hall object with details

- `POST /api/halls`: Create a new hall (admin only)
  - Body: `{ name, location, description, openingHours, imageUrl }`
  - Returns: Created hall object

- `PUT /api/halls/:id`: Update a hall (admin only)
  - Body: Hall data to update
  - Returns: Updated hall object

- `DELETE /api/halls/:id`: Delete a hall (admin only)
  - Returns: Success message

### Booking Management APIs

- `GET /api/bookings`: Get user's bookings
  - Headers: Authorization with JWT
  - Returns: Array of booking objects

- `POST /api/bookings`: Create a new booking
  - Headers: Authorization with JWT
  - Body: `{ hallId, startTime, endTime, purpose, notes }`
  - Returns: Created booking object

- `GET /api/bookings/:id`: Get a specific booking
  - Headers: Authorization with JWT
  - Returns: Booking object with details

- `DELETE /api/bookings/:id`: Cancel a booking
  - Headers: Authorization with JWT
  - Returns: Success message

### Time Slot APIs

- `GET /api/timeslots`: Check availability for a time slot
  - Headers: Authorization with JWT
  - Query params: `hallId, date, startTime, endTime`
  - Returns: Array of available time slots

## Database Schema

The application uses a PostgreSQL database with the following main entities:

### User
- `id`: Unique identifier (Int, auto-increment)
- `username`: User's username (String, unique)
- `email`: User's email address (String, unique)
- `password`: Hashed password (String)
- `role`: User role (String, e.g., "user" or "admin")
- `createdAt`: Account creation timestamp
- Relations: One-to-many with Booking

### Hall
- `id`: Unique identifier (Int, auto-increment)
- `name`: Hall name (String)
- `description`: Description of the hall (String)
- `location`: Physical location (String)
- `imageUrl`: URL to hall image (String, optional)
- `openingHours`: Operating hours (String, format: "HH:MM-HH:MM")
- `createdAt`: Creation timestamp
- Relations: One-to-many with TimeSlot

### TimeSlot
- `id`: Unique identifier (Int, auto-increment)
- `startTime`: Start time of slot (DateTime)
- `endTime`: End time of slot (DateTime)
- `isAvailable`: Availability status (Boolean)
- `sportsHallId`: Reference to hall (Int, foreign key)
- Relations: One-to-one with Booking, Many-to-one with Hall

### Booking
- `id`: Unique identifier (Int, auto-increment)
- `userId`: Reference to user (Int, foreign key)
- `timeSlotId`: Reference to time slot (Int, foreign key)
- `purpose`: Reason for booking (String)
- `notes`: Additional information (String, optional)
- `createdAt`: Booking creation timestamp
- Relations: Many-to-one with User, One-to-one with TimeSlot

## Component Communication

The application uses several methods for communication between components:

1. **Svelte Stores**: 
   - `auth` store manages authentication state across components
   - Components subscribe to the store to react to authentication changes

2. **Component Props**:
   - Parent components pass data to child components via props
   - Example: BookingList receives bookings data from parent page

3. **Event Dispatching**:
   - Child components emit events that parent components listen for
   - Example: BookingForm dispatches 'save' event when booking is created

4. **SvelteKit Page Data**:
   - Server-side data loading with `+page.server.ts` fetches data
   - Components access this data via the `data` prop
   - Enables server-side rendering of data

5. **Fetch API**:
   - Components directly call backend APIs using fetch
   - JWT token is included in Authorization header for authenticated requests

6. **URL Parameters and Query Strings**:
   - Components access and modify URL parameters for navigation
   - Example: Using hallId query parameter to pre-select hall in booking form

7. **Session Storage**:
   - Used for temporary data that persists between page navigations
   - Example: Storing success messages that display after redirect

## Application Flow

1. Users register or log in to access the system
2. Upon successful authentication, a JWT token is stored in localStorage
3. Users can view available halls and their details
4. To make a booking:
   - User navigates to the booking page
   - Selects a hall, date, and time slot
   - System checks availability in real-time
   - User submits booking details
   - System creates booking if slot is available
5. Users can view and manage their bookings
6. Admin users have additional privileges for hall management

## Deployment Considerations

To deploy this application, you'll need:

1. Node.js environment for running the SvelteKit application
2. PostgreSQL database for storing application data
3. Environment variables for database connection and JWT secret
4. Optional: Reverse proxy like Nginx for production deployment

## Security Measures

The application implements several security best practices:

1. Password hashing using bcrypt
2. JWT authentication with expiration
3. API authorization checks
4. Form validation on both client and server
5. CSRF protection via SvelteKit
6. Server-side validation of all inputs

## Future Enhancements

Potential future improvements include:

1. Implementing recurring bookings
2. Adding payment processing for paid bookings
3. Integrating with calendar systems (Google Calendar, iCal)
4. Enhancing admin dashboard with analytics
5. Adding user notifications via email or SMS
6. Implementing a review/rating system for halls