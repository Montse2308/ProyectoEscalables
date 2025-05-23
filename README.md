# FuerzApp

FuerzApp is a web application focused on tracking strength training progress for gym-goers, with advanced features for predicting maximum lifts, monitoring metrics, and using customized routines.

## Features

- User authentication and authorization with JWT
- Public calculators (1RM, Wilks, strength level)
- Workout tracking and history
- Custom routine templates
- Progress visualization
- Admin panel for exercise and standards management

## Tech Stack

- MongoDB: Database
- Express: Backend framework
- Angular: Frontend framework
- Node.js: Runtime environment

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Angular CLI

## Installation

### Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/fuerzapp.git
cd fuerzapp
\`\`\`

### Backend Setup

1. Navigate to the backend directory:

\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the backend directory with the following variables:

\`\`\`
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fuerzapp
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
\`\`\`

4. Start the backend server:

\`\`\`bash
npm start
\`\`\`

### Frontend Setup

1. Navigate to the frontend directory:

\`\`\`bash
cd ../frontend
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Start the Angular development server:

\`\`\`bash
ng serve
\`\`\`

4. Open your browser and navigate to `http://localhost:4200`

## Project Structure

### Backend

- `server.js`: Entry point for the Express server
- `models/`: MongoDB schemas
- `controllers/`: Request handlers
- `routes/`: API endpoints
- `middleware/`: Custom middleware functions

### Frontend

- `src/app/core/`: Core functionality (services, guards, interceptors)
- `src/app/features/`: Feature modules (auth, dashboard, calculators, etc.)
- `src/app/shared/`: Shared components and utilities

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get current user

### Users

- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user

### Workouts

- `GET /api/workouts`: Get all workouts for current user
- `GET /api/workouts/:id`: Get workout by ID
- `POST /api/workouts`: Create a new workout
- `PUT /api/workouts/:id`: Update workout
- `DELETE /api/workouts/:id`: Delete workout

### Templates

- `GET /api/templates`: Get all templates for current user
- `GET /api/templates/:id`: Get template by ID
- `POST /api/templates`: Create a new template
- `PUT /api/templates/:id`: Update template
- `DELETE /api/templates/:id`: Delete template

### Exercises

- `GET /api/exercises`: Get all exercises
- `GET /api/exercises/:id`: Get exercise by ID
- `POST /api/exercises`: Create a new exercise (admin only)
- `PUT /api/exercises/:id`: Update exercise (admin only)
- `DELETE /api/exercises/:id`: Delete exercise (admin only)

### Standards

- `GET /api/standards`: Get all strength standards
- `GET /api/standards/:id`: Get standard by ID
- `POST /api/standards`: Create a new standard (admin only)
- `PUT /api/standards/:id`: Update standard (admin only)
- `DELETE /api/standards/:id`: Delete standard (admin only)

### Calculators

- `POST /api/calculators/one-rm`: Calculate 1RM
- `POST /api/calculators/wilks`: Calculate Wilks score
- `POST /api/calculators/strength-level`: Calculate strength level

## License

This project is licensed under the MIT License.
