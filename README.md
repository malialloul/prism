# Full-Stack Project: React Vite + Express Backend

This is a complete full-stack application with a modern React frontend and Express backend, supporting both PostgreSQL and MySQL databases.

## Project Structure

```
prism/
├── frontend/                 # React Vite TypeScript application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── backend/                  # Express TypeScript API
    ├── src/
    │   └── server.ts        # Main server file
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── dist/               # Compiled output
```

## Features

### Frontend
- **React 18** with Vite for fast development
- **TypeScript** for type safety
- **Material-UI (MUI)** for beautiful components
- **Vite configuration** for optimal performance

### Backend
- **Express.js** for REST API
- **PostgreSQL** support via `pg` driver
- **MySQL** support via `mysql2` driver
- **TypeScript** for type safety
- **CORS** enabled for frontend communication
- **Dotenv** for environment configuration

## Prerequisites

- Node.js 16+ and npm/yarn
- PostgreSQL (optional, if using PostgreSQL)
- MySQL (optional, if using MySQL)

## Installation

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update the `.env` file with your database credentials.

## Development

### Start the Backend

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3001`

### Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The app will start on `http://localhost:5173`

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Build

```bash
cd backend
npm run build
npm start
```

## Database Configuration

### PostgreSQL

Update your `.env` file:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=your_database
```

### MySQL

Update your `.env` file:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript

## Technologies

### Frontend
- React 18
- Vite
- TypeScript
- Material-UI
- Axios or Fetch API

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL (pg)
- MySQL (mysql2)
- Cors
- Dotenv

## Next Steps

1. Set up your databases (PostgreSQL or MySQL)
2. Update environment variables in `.env` files
3. Create database models and API routes
4. Build out your React components and pages
5. Deploy to your preferred hosting platform

## License

ISC
