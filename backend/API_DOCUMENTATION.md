# Wellness360 API Documentation

## Overview

The Wellness360 API provides comprehensive endpoints for managing user profiles, daily goals, wellness plans, and gamification features. This document provides detailed information about all available endpoints, request/response formats, and examples.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

---

## Health Check Endpoints

### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "Health check successful",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": "5 minutes",
    "database": "connected",
    "memory": {
      "used": "45 MB",
      "total": "128 MB",
      "external": "12 MB"
    },
    "environment": "development",
    "version": "1.0.0"
  }
}
```

### GET /health/database
Check database connection status.

**Response:**
```json
{
  "success": true,
  "message": "Database is healthy",
  "data": {
    "status": "connected",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## User Management Endpoints

### POST /users
Create a new user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "gender": "male",
  "weight": 70,
  "height": 175
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile created successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "gender": "male",
    "weight": 70,
    "height": 175,
    "bmi": 22.86,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /users/:email
Get user profile by email.

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "gender": "male",
    "weight": 70,
    "height": 175,
    "bmi": 22.86,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /users/:email
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "weight": 72
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile updated successfully",
  "data": {
    "name": "John Smith",
    "email": "john@example.com",
    "age": 25,
    "gender": "male",
    "weight": 72,
    "height": 175,
    "bmi": 23.51,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /users/:email
Delete user profile.

**Response:**
```json
{
  "success": true,
  "message": "User profile deleted successfully"
}
```

### GET /users
Get all user profiles (admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "User profiles retrieved successfully",
  "data": {
    "userProfiles": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /users/:email/stats
Get user statistics.

**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "userProfile": {...},
    "statistics": {
      "bmi": 22.86,
      "bmiCategory": "Normal weight",
      "age": 25,
      "gender": "male"
    }
  }
}
```

---

## Daily Goals Endpoints

### POST /goals
Create daily goals for a user.

**Request Body:**
```json
{
  "userEmail": "john@example.com",
  "waterIntake": 2.5,
  "sleepHours": 8,
  "dietType": "omnivore",
  "dailyCalorieTarget": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daily goals created successfully",
  "data": {
    "userEmail": "john@example.com",
    "waterIntake": 2.5,
    "sleepHours": 8,
    "dietType": "omnivore",
    "dailyCalorieTarget": 2000,
    "xp": 0,
    "level": 1,
    "date": "2024-01-01T00:00:00.000Z",
    "completedTasks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /goals/:email
Get daily goals for a user.

**Query Parameters:**
- `date` (optional): Specific date (ISO 8601 format)

**Response:**
```json
{
  "success": true,
  "message": "Daily goals retrieved successfully",
  "data": {
    "userEmail": "john@example.com",
    "waterIntake": 2.5,
    "sleepHours": 8,
    "dietType": "omnivore",
    "dailyCalorieTarget": 2000,
    "xp": 40,
    "level": 1,
    "date": "2024-01-01T00:00:00.000Z",
    "completedTasks": ["water", "sleep", "diet", "exercise"],
    "dailyProgress": 100,
    "xpToNextLevel": 60,
    "levelProgress": 40
  }
}
```

### PUT /goals/:email
Update daily goals.

**Request Body:**
```json
{
  "waterIntake": 3.0,
  "sleepHours": 7.5,
  "completedTasks": ["water", "sleep"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Daily goals updated successfully",
  "data": {
    "userEmail": "john@example.com",
    "waterIntake": 3.0,
    "sleepHours": 7.5,
    "dietType": "omnivore",
    "dailyCalorieTarget": 2000,
    "xp": 20,
    "level": 1,
    "date": "2024-01-01T00:00:00.000Z",
    "completedTasks": ["water", "sleep"],
    "dailyProgress": 50,
    "xpToNextLevel": 80,
    "levelProgress": 20
  }
}
```

### POST /goals/:email/tasks
Add a completed task.

**Request Body:**
```json
{
  "taskName": "exercise"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task marked as completed successfully",
  "data": {
    "userEmail": "john@example.com",
    "waterIntake": 2.5,
    "sleepHours": 8,
    "dietType": "omnivore",
    "dailyCalorieTarget": 2000,
    "xp": 50,
    "level": 1,
    "date": "2024-01-01T00:00:00.000Z",
    "completedTasks": ["water", "sleep", "diet", "exercise"],
    "dailyProgress": 100,
    "xpToNextLevel": 50,
    "levelProgress": 50
  }
}
```

### DELETE /goals/:email/tasks
Remove a completed task.

**Request Body:**
```json
{
  "taskName": "exercise"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task removed from completed list successfully",
  "data": {
    "userEmail": "john@example.com",
    "waterIntake": 2.5,
    "sleepHours": 8,
    "dietType": "omnivore",
    "dailyCalorieTarget": 2000,
    "xp": 30,
    "level": 1,
    "date": "2024-01-01T00:00:00.000Z",
    "completedTasks": ["water", "sleep", "diet"],
    "dailyProgress": 75,
    "xpToNextLevel": 70,
    "levelProgress": 30
  }
}
```

### GET /goals/:email/xp-stats
Get user's XP and level statistics.

**Response:**
```json
{
  "success": true,
  "message": "User XP statistics retrieved successfully",
  "data": {
    "xpStats": {
      "currentLevel": 2,
      "currentXP": 150,
      "xpToNextLevel": 50,
      "totalXPForCurrentLevel": 200,
      "progressPercentage": 75
    },
    "completedTasks": ["water", "sleep", "diet", "exercise"]
  }
}
```

### GET /goals/:email/history
Get user's goal history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "Goal history retrieved successfully",
  "data": {
    "goalHistory": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalGoals": 90,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### POST /goals/:email/reset
Reset daily goals.

**Response:**
```json
{
  "success": true,
  "message": "Daily goals reset successfully",
  "data": {
    "userEmail": "john@example.com",
    "waterIntake": 2.5,
    "sleepHours": 8,
    "dietType": "omnivore",
    "dailyCalorieTarget": 2000,
    "xp": 0,
    "level": 1,
    "date": "2024-01-01T00:00:00.000Z",
    "completedTasks": [],
    "dailyProgress": 0,
    "xpToNextLevel": 100,
    "levelProgress": 0
  }
}
```

---

## Wellness & AI Endpoints

### GET /wellness/:email/plan
Generate personalized wellness plan.

**Query Parameters:**
- `date` (optional): Specific date for goals

**Response:**
```json
{
  "success": true,
  "message": "Personalized wellness plan generated successfully",
  "data": {
    "userProfile": {...},
    "dailyGoals": {...},
    "personalizedRecommendations": {
      "diet": [
        "Focus on a balanced omnivore diet with 2000 calories daily",
        "Include plenty of fruits, vegetables, and whole grains",
        "Stay hydrated with adequate water intake"
      ],
      "exercise": [
        "Aim for at least 30 minutes of moderate exercise daily",
        "Include both cardio and strength training",
        "Find activities you enjoy to maintain consistency"
      ],
      "sleep": [
        "Maintain a consistent sleep schedule with 8 hours nightly",
        "Create a relaxing bedtime routine"
      ],
      "hydration": [
        "Drink 2.5 liters of water throughout the day",
        "Carry a water bottle to track intake"
      ],
      "general": [
        "Listen to your body and adjust goals as needed",
        "Celebrate small victories and progress",
        "Stay consistent with your wellness journey"
      ]
    },
    "aiInsights": "Based on your profile, I recommend focusing on building sustainable habits that align with your omnivore dietary preferences and 2000 calorie target. Remember, consistency is key to achieving your wellness goals!",
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /wellness/:email/tips
Get quick wellness tips for a specific category.

**Query Parameters:**
- `category`: Category of tips (diet, exercise, sleep, hydration, general)

**Response:**
```json
{
  "success": true,
  "message": "Quick diet tips generated successfully",
  "data": {
    "category": "diet",
    "tips": [
      "Start your day with a protein-rich breakfast",
      "Include colorful vegetables in every meal",
      "Plan your meals ahead of time"
    ],
    "generatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /wellness/:email/insights
Get wellness insights based on user's progress.

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 7)

**Response:**
```json
{
  "success": true,
  "message": "Wellness insights generated successfully",
  "data": {
    "period": "7 days",
    "totalXP": 280,
    "averageWaterIntake": 2.3,
    "averageSleepHours": 7.5,
    "averageCalories": 1950,
    "totalCompletedTasks": 24,
    "consistencyScore": 85,
    "recommendations": [
      "Great job maintaining consistent habits! Keep it up!",
      "Consider increasing your daily water intake to at least 2 liters"
    ],
    "trends": {
      "waterIntake": "increasing",
      "sleepHours": "stable",
      "xp": "increasing",
      "overall": "improving"
    }
  }
}
```

### GET /wellness/status
Check AI service status.

**Response:**
```json
{
  "success": true,
  "message": "AI service status retrieved successfully",
  "data": {
    "available": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## XP & Achievements Endpoints

### GET /xp/:email/info
Get user's XP and level information.

**Response:**
```json
{
  "success": true,
  "message": "XP information retrieved successfully",
  "data": {
    "currentLevel": 3,
    "currentXP": 250,
    "xpToNextLevel": 50,
    "totalXPForCurrentLevel": 300,
    "progressPercentage": 83
  }
}
```

### GET /xp/:email/progress
Get user's progress summary.

**Response:**
```json
{
  "success": true,
  "message": "Progress summary retrieved successfully",
  "data": {
    "totalXP": 250,
    "currentLevel": 3,
    "xpInfo": {...},
    "streak": 5,
    "achievements": [...],
    "weeklyProgress": 85,
    "monthlyProgress": 78,
    "levelRewards": [...]
  }
}
```

### GET /xp/achievements
Get available achievements.

**Response:**
```json
{
  "success": true,
  "message": "Available achievements retrieved successfully",
  "data": [
    {
      "id": "first_steps",
      "name": "First Steps",
      "description": "Complete your first wellness task",
      "icon": "👶",
      "xpReward": 25
    },
    {
      "id": "water_master",
      "name": "Hydration Master",
      "description": "Drink 2+ liters of water for 7 consecutive days",
      "icon": "💧",
      "xpReward": 100
    }
  ]
}
```

### GET /xp/:email/achievements
Check and unlock achievements for a user.

**Response:**
```json
{
  "success": true,
  "message": "Achievements checked successfully",
  "data": {
    "unlockedAchievements": [
      {
        "id": "first_steps",
        "name": "First Steps",
        "description": "Complete your first wellness task",
        "icon": "👶",
        "xpReward": 25,
        "unlockedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalUnlocked": 1
  }
}
```

### GET /xp/rewards/:level
Get level rewards for a specific level.

**Response:**
```json
{
  "success": true,
  "message": "Level rewards retrieved successfully",
  "data": {
    "level": 5,
    "rewards": [
      {
        "level": 5,
        "title": "Level 5 Master",
        "description": "Congratulations! You've reached level 5!",
        "benefits": [
          "Unlocked advanced wellness tracking",
          "Access to premium AI recommendations",
          "Exclusive achievement badges",
          "Priority support"
        ],
        "xpRequired": 500
      }
    ]
  }
}
```

### GET /xp/leaderboard
Get leaderboard (top users by XP).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "email": "john@example.com",
        "name": "John Doe",
        "totalXP": 1500,
        "currentLevel": 15,
        "lastActive": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### GET /xp/:email/history
Get user's XP history.

**Query Parameters:**
- `days` (optional): Number of days (default: 30)

**Response:**
```json
{
  "success": true,
  "message": "XP history retrieved successfully",
  "data": {
    "xpHistory": [
      {
        "date": "2024-01-01T00:00:00.000Z",
        "dailyXP": 40,
        "cumulativeXP": 40,
        "level": 1,
        "completedTasks": ["water", "sleep", "diet", "exercise"]
      }
    ],
    "period": "30 days",
    "totalXP": 1200
  }
}
```

### POST /xp/:email/bonus
Add bonus XP to user (admin only).

**Request Body:**
```json
{
  "bonusXP": 100,
  "reason": "Special achievement"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bonus XP added successfully",
  "data": {
    "previousXP": 150,
    "newXP": 250,
    "bonusXP": 100,
    "previousLevel": 2,
    "newLevel": 3,
    "reason": "Special achievement"
  }
}
```

---

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages. Common error scenarios:

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed: Name must be between 2 and 50 characters",
  "error": "Invalid input data"
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Access token required",
  "error": "Unauthorized"
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "User profile not found",
  "error": "Resource not found"
}
```

### Rate Limit Errors (429)
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later",
  "error": "Rate limit exceeded"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **AI endpoints**: 10 requests per minute per IP
- **Sensitive endpoints**: 5 requests per 15 minutes per IP
- **User-specific endpoints**: 100 requests per 15 minutes per user

Rate limit headers are included in responses:
- `X-Rate-Limit-Limit`: Maximum requests allowed
- `X-Rate-Limit-Remaining`: Remaining requests
- `X-Rate-Limit-Reset`: Time when limit resets

---

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (starts from 1)
- `limit`: Items per page (1-100)

Pagination information is included in the response:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Examples

### Complete User Journey

1. **Create User Profile**
   ```bash
   curl -X POST http://localhost:5000/api/users \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "age": 25,
       "gender": "male",
       "weight": 70,
       "height": 175
     }'
   ```

2. **Create Daily Goals**
   ```bash
   curl -X POST http://localhost:5000/api/goals \
     -H "Content-Type: application/json" \
     -d '{
       "userEmail": "john@example.com",
       "waterIntake": 2.5,
       "sleepHours": 8,
       "dietType": "omnivore",
       "dailyCalorieTarget": 2000
     }'
   ```

3. **Add Completed Tasks**
   ```bash
   curl -X POST http://localhost:5000/api/goals/john@example.com/tasks \
     -H "Content-Type: application/json" \
     -d '{"taskName": "water"}'
   ```

4. **Get Wellness Plan**
   ```bash
   curl -X GET http://localhost:5000/api/wellness/john@example.com/plan
   ```

5. **Check Progress**
   ```bash
   curl -X GET http://localhost:5000/api/xp/john@example.com/progress
   ```

This comprehensive API documentation covers all available endpoints, request/response formats, and usage examples for the Wellness360 backend API.
