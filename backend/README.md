# Wellness360 Backend API

A comprehensive backend API for the Wellness360 application, built with Node.js, Express, TypeScript, MongoDB, and Google Gemini AI integration.

## 🚀 Features

- **User Management**: Complete user profile management with validation
- **Daily Goals Tracking**: Track water intake, sleep, diet, and calorie goals
- **AI-Powered Wellness Plans**: Personalized recommendations using Google Gemini
- **XP/Level System**: Gamified experience with achievements and rewards
- **Real-time Analytics**: Progress tracking and insights
- **Comprehensive API**: RESTful endpoints with proper error handling
- **Type Safety**: Full TypeScript implementation
- **Database Integration**: MongoDB with Mongoose ODM
- **Rate Limiting**: Built-in protection against abuse
- **Logging**: Comprehensive logging with Winston
- **Validation**: Input validation with express-validator
- **CORS Support**: Cross-origin resource sharing configuration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **AI Integration**: LangChainJS + Google Gemini
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Google Gemini API Key
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wellness360/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/wellness360
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Google Gemini API Configuration
   GOOGLE_API_KEY=your-google-gemini-api-key-here
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Optional
  "error": "Error message" // Optional
}
```

## 🔗 API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint
- `GET /api/health/database` - Database health check
- `GET /api/health/metrics` - Server metrics

### User Management
- `POST /api/users` - Create user profile
- `GET /api/users/:email` - Get user profile
- `PUT /api/users/:email` - Update user profile
- `DELETE /api/users/:email` - Delete user profile
- `GET /api/users` - Get all user profiles (admin)
- `GET /api/users/:email/stats` - Get user statistics

### Daily Goals
- `POST /api/goals` - Create daily goals
- `GET /api/goals/:email` - Get daily goals
- `PUT /api/goals/:email` - Update daily goals
- `POST /api/goals/:email/tasks` - Add completed task
- `DELETE /api/goals/:email/tasks` - Remove completed task
- `GET /api/goals/:email/xp-stats` - Get XP statistics
- `GET /api/goals/:email/history` - Get goal history
- `POST /api/goals/:email/reset` - Reset daily goals

### Wellness & AI
- `GET /api/wellness/:email/plan` - Generate personalized wellness plan
- `GET /api/wellness/:email/tips` - Get quick wellness tips
- `GET /api/wellness/:email/insights` - Get wellness insights
- `GET /api/wellness/status` - Check AI service status

### XP & Achievements
- `GET /api/xp/:email/info` - Get XP information
- `GET /api/xp/:email/progress` - Get progress summary
- `GET /api/xp/achievements` - Get available achievements
- `GET /api/xp/:email/achievements` - Check user achievements
- `GET /api/xp/rewards/:level` - Get level rewards
- `GET /api/xp/leaderboard` - Get leaderboard
- `GET /api/xp/:email/history` - Get XP history
- `POST /api/xp/:email/bonus` - Add bonus XP (admin)

## 📊 Database Schema

### UserProfile Collection
```typescript
{
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  weight: number; // in kg
  height: number; // in cm
  createdAt: Date;
  updatedAt: Date;
}
```

### DailyGoals Collection
```typescript
{
  userEmail: string;
  waterIntake: number; // in liters
  sleepHours: number;
  dietType: 'vegetarian' | 'vegan' | 'omnivore' | 'keto' | 'paleo' | 'mediterranean' | 'other';
  dailyCalorieTarget: number;
  xp: number;
  level: number;
  date: Date;
  completedTasks: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🤖 AI Integration

The API integrates with Google Gemini AI to provide:
- Personalized wellness plans
- Quick tips and recommendations
- Progress insights and analysis
- Motivational messages

### AI Service Configuration
```typescript
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  modelName: 'gemini-1.5-flash',
  temperature: 0.7,
  maxOutputTokens: 2048,
});
```

## 🎮 XP System

The gamification system includes:
- **XP Points**: Earned by completing daily tasks
- **Levels**: Progress through 100 levels
- **Achievements**: Unlock badges and rewards
- **Streaks**: Track consecutive days of progress
- **Leaderboard**: Compare with other users

### XP Calculation
- Base XP: 10 points per completed task
- Bonus XP: 5 points for completing multiple tasks
- Streak Bonus: Up to 20 points for perfect days
- Level Requirement: 100 XP per level

## 🔒 Security Features

- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers
- **JWT Authentication**: Secure token-based auth
- **Error Handling**: Secure error responses

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/wellness360 |
| `JWT_SECRET` | JWT secret key | Required |
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🚀 Deployment

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Using PM2
```bash
npm install -g pm2
pm2 start dist/server.js --name wellness360-api
pm2 save
pm2 startup
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📈 Monitoring

The API includes comprehensive logging and monitoring:
- **Winston Logger**: Structured logging
- **Health Checks**: Database and service status
- **Metrics**: Server performance metrics
- **Error Tracking**: Detailed error logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔄 Changelog

### v1.0.0
- Initial release
- User management system
- Daily goals tracking
- AI-powered wellness plans
- XP/Level gamification system
- Comprehensive API documentation
