# AI Setup Guide for Wellness360

To enable AI-generated meal and workout recommendations, you need to set up a Google Gemini API key.

## Step 1: Get a Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

## Step 2: Add the API Key to Your Environment

### Option A: Using .env file (Recommended for Development)

1. Navigate to the `backend` directory
2. Create or edit the `.env` file
3. Add your API key:

```env
GOOGLE_API_KEY=your-api-key-here
```

### Option B: Using Environment Variables (Production)

Set the environment variable directly:

```bash
export GOOGLE_API_KEY=your-api-key-here
```

Or in your deployment platform (Heroku, AWS, etc.), add it as an environment variable.

## Step 3: Restart the Backend Server

After adding the API key, restart your backend server:

```bash
cd backend
npm run dev
# or
npm start
```

## Step 4: Verify AI is Working

1. Check the backend logs - you should see:
   - "Generating AI-powered meal and workout plan for user: ..."
   - NOT "AI service not initialized"

2. Test the AI status endpoint:
   ```bash
   curl http://localhost:5001/api/wellness/status
   ```

3. In the frontend, when you load the Diet & Fitness page:
   - You should see "Loaded AI-generated personalized meal and workout plan! 🎉"
   - The meals and workouts should be personalized based on your profile

## Troubleshooting

### If you see "Using fallback meal/workout plan" in logs:

1. **Check if GOOGLE_API_KEY is set:**
   ```bash
   echo $GOOGLE_API_KEY
   ```

2. **Check backend logs for:**
   - "GOOGLE_API_KEY not set. AIService will run in degraded mode."
   - This means the API key is missing or not loaded

3. **Verify the .env file:**
   - Make sure it's in the `backend` directory
   - Make sure there are no spaces around the `=` sign
   - Make sure the file is named exactly `.env` (not `.env.example`)

4. **Check if environment variables are loaded:**
   - The backend should log when it starts if the API key is missing
   - Check your server startup logs

### If AI calls are timing out:

- The AI service has a 15-second timeout
- If it times out, it will fall back to default meals
- Check your internet connection and Google API status
- Verify your API key has proper quotas/permissions

## Notes

- The AI service uses Google's Gemini 1.5 Flash model
- API calls may take 5-15 seconds depending on network conditions
- If AI is not configured, the app will use personalized fallback data based on your calorie target and diet type
- The fallback data is still personalized to your calorie goals, just not AI-generated

