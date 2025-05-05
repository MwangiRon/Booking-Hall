# Sports Hall Booking System

A web application designed to facilitate the reservation and management of sports facilities.

## Features

- View available sports halls
- Check hall availability
- Make bookings for specific times and dates
- Manage your existing bookings
- Admin dashboard for hall management

## Tech Stack

- **Frontend**: SvelteKit with Bootstrap 5
- **Backend**: SvelteKit server endpoints (API routes)
- **Database**: PostgreSQL accessed via Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/bookinghall"
     JWT_SECRET="very-very-secret-key"
     ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── lib/                   # Shared code library
│   ├── components/        # Reusable UI components
│   ├── server/            # Server-side utilities
│   └── stores/            # Svelte stores
├── routes/                # Application routes
│   ├── api/               # Server API endpoints
│   ├── bookings/          # Booking pages
│   ├── halls/             # Hall listing/details pages
│   ├── login/             # Login page
│   └── register/          # Registration page
└── static/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session

### Halls
- `GET /api/halls` - Get list of all sports halls
- `GET /api/halls/:id` - Get hall details
- `POST /api/halls` - Create new hall (admin only)
- `PUT /api/halls/:id` - Update hall (admin only)
- `DELETE /api/halls/:id` - Delete hall (admin only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `DELETE /api/bookings/:id` - Cancel booking

### Time Slots
- `GET /api/timeslots` - Check time slot availability

### Weather
- `GET /api/weather` - Get current weather conditions for sports facilities
- `GET /api/weather/:location` - Get weather forecast for specific location

## Database Models

- **User**: User accounts and authentication
- **Hall**: Sports facility information
- **TimeSlot**: Available booking times
- **Booking**: Reservation records

## Deployment

To deploy this application, you'll need:
1. Node.js environment for running the SvelteKit application
2. PostgreSQL database for storing application data
3. Environment variables for database connection and JWT secret
4. Optional: Reverse proxy like Nginx for production deployment

## Security

The application implements several security best practices including password hashing, JWT authentication with expiration, and server-side validation of all inputs.
