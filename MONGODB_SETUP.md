# Personal Finance Tracker - MongoDB Setup

This application now uses MongoDB as its database backend instead of browser-based storage.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** - You can use either:
   - Local MongoDB installation
   - MongoDB Atlas (cloud database)

## Database Setup Options

### Option 1: Local MongoDB

1. **Install MongoDB Community Edition:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: Follow official MongoDB installation guide

2. **Start MongoDB Service:**
   ```bash
   # Windows (as service)
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running:**
   ```bash
   # Connect to MongoDB shell
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Update the `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker
   ```

## Application Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - The `.env` file is already configured for local MongoDB
   - For Atlas, update the `MONGODB_URI` variable

3. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

4. **Start the development servers:**
   ```bash
   # Start both frontend and backend together
   npm run dev:full
   
   # Or start them separately:
   # Terminal 1 - Backend API
   npm run server:dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start frontend development server (Vite)
- `npm run server` - Start backend API server
- `npm run server:dev` - Start backend with auto-restart (nodemon)
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run seed` - Seed database with sample data
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

## API Endpoints

The backend API runs on `http://localhost:5000` with the following endpoints:

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary` - Get expense analytics summary
- `GET /api/expenses/category/:id` - Get expenses by category
- `GET /api/expenses/date-range?startDate=&endDate=` - Get expenses by date range

### Health Check
- `GET /health` - Check API status

## Database Schema

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  icon: String (required),
  color: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  amount: Number (required, min: 0),
  category: ObjectId (ref: 'Category', required),
  date: Date (required),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### MongoDB Connection Issues
1. **Local MongoDB:** Ensure MongoDB service is running
2. **Atlas:** Check connection string and network access settings
3. **Port conflicts:** Default API port is 5000, change in `.env` if needed

### API Not Responding
1. Check if backend server is running on port 5000
2. Verify `.env` file configuration
3. Check console for error messages

### Frontend Not Loading Data
1. Ensure both frontend (5173) and backend (5000) servers are running
2. Check browser console for API errors
3. Verify CORS settings if accessing from different origins

## Development Notes

- The application automatically populates sample data when the database is empty
- All database operations are asynchronous and include proper error handling
- The frontend uses Vue 3 Composition API with reactive state management
- MongoDB ObjectIds are used instead of simple integer IDs

## Next Steps

1. Add user authentication and authorization
2. Implement data export/import functionality  
3. Add more advanced analytics and reporting features
4. Implement real-time notifications
5. Add budget tracking and alerts
