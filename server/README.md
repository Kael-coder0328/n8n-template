# SaaS Platform Backend

The backend of our SaaS platform is built with Go, providing a robust, scalable API with authentication, database management, and security features.

## Tech Stack

- **Language**: Go 1.19+
- **Database**: PostgreSQL
- **Authentication**: JWT + OAuth2
- **API**: RESTful endpoints
- **Security**: Rate limiting, CORS, secure headers

## Project Structure

```
server/
├── database/         # Database connection and migrations
├── handlers/         # HTTP request handlers
├── middleware/       # Custom middleware functions
├── models/          # Data models and database schemas
└── main.go          # Application entry point
```

## Key Features

- **Authentication**
  - JWT-based authentication
  - Google OAuth2 integration
  - Password hashing and validation
  - Session management

- **Security**
  - Rate limiting middleware
  - CORS configuration
  - Secure headers
  - Input validation

- **Database**
  - PostgreSQL integration
  - Migration management
  - Efficient queries
  - Data validation

## Getting Started

1. Install dependencies:
```bash
go mod download
```

2. Set up environment variables:
Copy `.env.example` to `.env` and configure:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=saas_db
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

3. Set up the database:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE saas_db;"

# Run migrations
go run database/migrations/*.go
```

4. Start the server:
```bash
go run main.go
```

## API Documentation

### Authentication Endpoints

```
POST /auth/register     # Register new user
POST /auth/login        # Login user
POST /auth/google       # Google OAuth login
POST /auth/refresh      # Refresh JWT token
POST /auth/logout       # Logout user
```

### User Endpoints

```
GET    /user/profile    # Get user profile
PUT    /user/profile    # Update user profile
PUT    /user/password   # Change password
DELETE /user            # Delete account
```

## Development Guidelines

### Code Structure
- Follow Go best practices and idioms
- Use proper error handling
- Implement middleware for common functionality
- Keep handlers focused and maintainable

### Database
- Use prepared statements
- Implement proper transaction handling
- Follow database normalization principles
- Write efficient queries

### Security
- Validate all input data
- Implement proper rate limiting
- Use secure password hashing
- Follow OWASP security guidelines

### Testing
- Write unit tests for handlers
- Implement integration tests
- Use test fixtures and mocks
- Maintain good test coverage

## Error Handling

- Use appropriate HTTP status codes
- Return consistent error responses
- Log errors properly
- Implement graceful error recovery

## Contributing

1. Follow Go coding conventions
2. Write clear commit messages
3. Include tests for new features
4. Document API changes
5. Submit pull requests for review

## Learn More

- [Go Documentation](https://golang.org/doc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Authentication](https://jwt.io/introduction)
- [OAuth 2.0](https://oauth.net/2/)