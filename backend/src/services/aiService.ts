import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { logger } from '@/utils/logger';
import { IUserProfile, IDailyGoals, IWellnessPlan, IMealWorkoutPlan, IMeal, IWorkout } from '@/types';

export class AIService {
  private model: ChatGoogleGenerativeAI | null = null;
  private wellnessPrompt: PromptTemplate;
  private wellnessChain: LLMChain;
  private initialized: boolean = false;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    logger.info(`AI Service initialization - GOOGLE_API_KEY exists: ${!!apiKey}`);
    logger.info(`AI Service initialization - GOOGLE_API_KEY length: ${apiKey ? apiKey.length : 0}`);
    logger.info(`AI Service initialization - GOOGLE_API_KEY starts with: ${apiKey ? apiKey.substring(0, 10) + '...' : 'N/A'}`);
    
    if (apiKey && apiKey.trim().length > 0) {
      try {
        // Initialize Google Gemini model
        // LangChain uses different model identifiers - try without version prefix
        this.model = new ChatGoogleGenerativeAI({
          apiKey: apiKey.trim(),
          modelName: 'gemini-2.0-flash', // Direct model name
          temperature: 0.7,
          maxOutputTokens: 2048,
        });
        logger.info(`Model initialized with: gemini-2.0-flash`);
        this.initialized = true;
        logger.info('✅ AI Service initialized successfully with Google Gemini API');
      } catch (error) {
        logger.error('❌ Failed to initialize AI Service:', error);
        this.initialized = false;
      }
    } else {
      logger.warn('⚠️ GOOGLE_API_KEY not set or empty. AIService will run in degraded mode.');
      logger.warn('⚠️ To enable AI features, add GOOGLE_API_KEY to your .env file');
    }

    // Create wellness plan prompt template
    this.wellnessPrompt = new PromptTemplate({
      template: `You are a professional wellness coach and nutritionist with expertise in personalized health recommendations. 

Based on the following user profile and daily goals, create a comprehensive, personalized wellness plan:

**User Profile:**
- Name: {name}
- Age: {age} years
- Gender: {gender}
- Weight: {weight} kg
- Height: {height} cm
- BMI: {bmi}

**Daily Goals:**
- Water Intake: {waterIntake} liters
- Sleep Hours: {sleepHours} hours
- Diet Type: {dietType}
- Daily Calorie Target: {dailyCalorieTarget} calories
- Current Level: {level}
- Current XP: {xp}

**Instructions:**
1. Provide specific, actionable recommendations for each category
2. Consider the user's age, gender, BMI, and dietary preferences
3. Make recommendations realistic and achievable
4. Include both immediate and long-term goals
5. Provide motivational and encouraging language
6. Consider the user's current fitness level and experience

**Response Format:**
Please provide your response in the following JSON format:
{{
  "personalizedRecommendations": {{
    "diet": ["recommendation1", "recommendation2", "recommendation3"],
    "exercise": ["recommendation1", "recommendation2", "recommendation3"],
    "sleep": ["recommendation1", "recommendation2"],
    "hydration": ["recommendation1", "recommendation2"],
    "general": ["recommendation1", "recommendation2", "recommendation3"]
  }},
  "aiInsights": "A comprehensive analysis and motivational message for the user based on their profile and goals"
}}

Focus on creating a plan that is:
- Personalized to their specific needs
- Realistic and achievable
- Motivating and encouraging
- Based on current health and wellness best practices
- Considerate of their dietary preferences and lifestyle`,
      inputVariables: [
        'name', 'age', 'gender', 'weight', 'height', 'bmi',
        'waterIntake', 'sleepHours', 'dietType', 'dailyCalorieTarget',
        'level', 'xp'
      ],
    });

    // Create LLM chain (only if model is initialized)
    this.wellnessChain = new LLMChain({
      // @ts-expect-error: llm can be null at runtime if not configured; guarded before use
      llm: this.model,
      prompt: this.wellnessPrompt,
    });
  }

  // Generate personalized wellness plan
  public async generateWellnessPlan(
    userProfile: IUserProfile,
    dailyGoals: IDailyGoals
  ): Promise<IWellnessPlan> {
    try {
      if (!this.initialized || !this.model) {
        throw new Error('AI service is not configured');
      }
      logger.info(`Generating wellness plan for user: ${userProfile.email}`);

      // Calculate BMI
      const heightInMeters = userProfile.height / 100;
      const bmi = Math.round((userProfile.weight / (heightInMeters * heightInMeters)) * 100) / 100;

      // Prepare input for the AI model
      const input = {
        name: userProfile.name,
        age: userProfile.age.toString(),
        gender: userProfile.gender,
        weight: userProfile.weight.toString(),
        height: userProfile.height.toString(),
        bmi: bmi.toString(),
        waterIntake: dailyGoals.waterIntake.toString(),
        sleepHours: dailyGoals.sleepHours.toString(),
        dietType: dailyGoals.dietType,
        dailyCalorieTarget: dailyGoals.dailyCalorieTarget.toString(),
        level: dailyGoals.level.toString(),
        xp: dailyGoals.xp.toString(),
      };

      // Generate wellness plan using LangChain
      const response = await this.wellnessChain.call(input);
      
      // Parse the AI response
      let aiResponse;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in AI response');
        }
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);
        // Fallback to a default response structure
        aiResponse = {
          personalizedRecommendations: {
            diet: [
              `Focus on a balanced ${dailyGoals.dietType} diet with ${dailyGoals.dailyCalorieTarget} calories daily`,
              'Include plenty of fruits, vegetables, and whole grains',
              'Stay hydrated with adequate water intake'
            ],
            exercise: [
              'Aim for at least 30 minutes of moderate exercise daily',
              'Include both cardio and strength training',
              'Find activities you enjoy to maintain consistency'
            ],
            sleep: [
              `Maintain a consistent sleep schedule with ${dailyGoals.sleepHours} hours nightly`,
              'Create a relaxing bedtime routine'
            ],
            hydration: [
              `Drink ${dailyGoals.waterIntake} liters of water throughout the day`,
              'Carry a water bottle to track intake'
            ],
            general: [
              'Listen to your body and adjust goals as needed',
              'Celebrate small victories and progress',
              'Stay consistent with your wellness journey'
            ]
          },
          aiInsights: `Based on your profile, I recommend focusing on building sustainable habits that align with your ${dailyGoals.dietType} dietary preferences and ${dailyGoals.dailyCalorieTarget} calorie target. Remember, consistency is key to achieving your wellness goals!`
        };
      }

      // Create the wellness plan
      const wellnessPlan: IWellnessPlan = {
        userProfile,
        dailyGoals,
        personalizedRecommendations: aiResponse.personalizedRecommendations,
        aiInsights: aiResponse.aiInsights,
        generatedAt: new Date()
      };

      logger.info(`Wellness plan generated successfully for user: ${userProfile.email}`);
      return wellnessPlan;

    } catch (error) {
      logger.error('Error generating wellness plan:', error);
      throw new Error('Failed to generate personalized wellness plan');
    }
  }

  // Generate quick wellness tips
  public async generateQuickTips(
    userProfile: IUserProfile,
    dailyGoals: IDailyGoals,
    category: 'diet' | 'exercise' | 'sleep' | 'hydration' | 'general'
  ): Promise<string[]> {
    try {
      if (!this.initialized || !this.model) {
        return [
          'AI service not configured. Set GOOGLE_API_KEY to enable tips.',
          'In the meantime, maintain consistency with your goals.',
          'Drink water, sleep well, and stay active.'
        ];
      }
      const categoryPrompts = {
        diet: `Provide 3 quick, actionable diet tips for a ${userProfile.age}-year-old ${userProfile.gender} following a ${dailyGoals.dietType} diet with a ${dailyGoals.dailyCalorieTarget} calorie target.`,
        exercise: `Provide 3 quick, actionable exercise tips for a ${userProfile.age}-year-old ${userProfile.gender} with a BMI of ${Math.round((userProfile.weight / Math.pow(userProfile.height / 100, 2)) * 100) / 100}.`,
        sleep: `Provide 3 quick, actionable sleep tips for someone aiming for ${dailyGoals.sleepHours} hours of sleep nightly.`,
        hydration: `Provide 3 quick, actionable hydration tips for someone aiming to drink ${dailyGoals.waterIntake} liters of water daily.`,
        general: `Provide 3 quick, actionable general wellness tips for a ${userProfile.age}-year-old ${userProfile.gender} on a wellness journey.`
      };

      const prompt = new PromptTemplate({
        template: categoryPrompts[category] + ' Format as a simple list with brief, actionable tips.',
        inputVariables: [],
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: prompt,
      });

      const response = await chain.call({});
      
      // Parse the response into an array of tips
      const tips = response.text
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3);

      return tips;

    } catch (error) {
      logger.error(`Error generating ${category} tips:`, error);
      return [
        'Stay consistent with your wellness goals',
        'Listen to your body and adjust as needed',
        'Celebrate small victories along the way'
      ];
    }
  }

  // Generate personalized meal and workout plan
  public async generateMealWorkoutPlan(
    userProfile: IUserProfile,
    dailyCalorieTarget?: number,
    dietType?: string
  ): Promise<IMealWorkoutPlan> {
    try {
      const targetCalories = dailyCalorieTarget || userProfile.dailyCalorieTarget || 2000;
      const userDietType = dietType || userProfile.dietType || 'balanced';

      // Check API key at runtime in case it was added after server start
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!this.initialized || !this.model || !apiKey || apiKey.trim().length === 0) {
        // Return fallback plan if AI is not available
        logger.warn(`AI service not initialized. Initialized: ${this.initialized}, Model exists: ${!!this.model}, API Key exists: ${!!apiKey}`);
        logger.info(`Using fallback meal/workout plan for user: ${userProfile.email}`);
        if (!apiKey || apiKey.trim().length === 0) {
          logger.warn('⚠️ GOOGLE_API_KEY is missing or empty in environment variables');
        }
        return this.getFallbackMealWorkoutPlan(targetCalories, userDietType);
      }

      logger.info(`Generating AI-powered meal and workout plan for user: ${userProfile.email}`);
      logger.info(`User profile: age=${userProfile.age}, gender=${userProfile.gender}, weight=${userProfile.weight}kg, height=${userProfile.height}cm, dietType=${userDietType}, calories=${targetCalories}`);

      // Calculate BMI
      const heightInMeters = userProfile.height / 100;
      const bmi = Math.round((userProfile.weight / (heightInMeters * heightInMeters)) * 100) / 100;

      // Create meal and workout prompt template
      const mealWorkoutPrompt = new PromptTemplate({
        template: `You are a professional nutritionist and fitness trainer. Create a personalized daily meal plan and workout routines for the following user:

**User Profile:**
- Age: {age} years
- Gender: {gender}
- Weight: {weight} kg
- Height: {height} cm
- BMI: {bmi}
- Diet Type: {dietType}
- Daily Calorie Target: {dailyCalorieTarget} calories

**Requirements:**
1. Create 5 meals: Breakfast, Snack, Lunch, Snack, Dinner
2. Total calories should be approximately {dailyCalorieTarget} calories
3. Meals must be appropriate for {dietType} diet
4. Include protein, carbs, and fats for each meal
5. Create 4 home workouts (bodyweight exercises)
6. Create 4 gym workouts (with equipment)
7. Workouts should be appropriate for the user's fitness level

**Response Format (JSON only):**
{{
  "meals": [
    {{"time": "Breakfast", "name": "meal name", "calories": 350, "protein": 15, "carbs": 45, "fats": 10}},
    {{"time": "Snack", "name": "meal name", "calories": 180, "protein": 8, "carbs": 25, "fats": 5}},
    {{"time": "Lunch", "name": "meal name", "calories": 450, "protein": 30, "carbs": 50, "fats": 15}},
    {{"time": "Snack", "name": "meal name", "calories": 200, "protein": 10, "carbs": 25, "fats": 8}},
    {{"time": "Dinner", "name": "meal name", "calories": 520, "protein": 35, "carbs": 55, "fats": 18}}
  ],
  "homeWorkouts": [
    {{"name": "Push-ups", "sets": 3, "reps": 15, "icon": "💪", "description": "Full body strength exercise"}},
    {{"name": "Squats", "sets": 3, "reps": 20, "icon": "🦵", "description": "Lower body strength"}},
    {{"name": "Plank", "sets": 3, "reps": "60s", "icon": "🧘", "description": "Core strength"}},
    {{"name": "Jumping Jacks", "sets": 3, "reps": 30, "icon": "🏃", "description": "Cardio exercise"}}
  ],
  "gymWorkouts": [
    {{"name": "Bench Press", "sets": 4, "reps": 10, "icon": "🏋️", "description": "Chest and triceps"}},
    {{"name": "Deadlifts", "sets": 4, "reps": 8, "icon": "💪", "description": "Full body compound"}},
    {{"name": "Lat Pulldown", "sets": 3, "reps": 12, "icon": "🔥", "description": "Back and biceps"}},
    {{"name": "Leg Press", "sets": 4, "reps": 12, "icon": "🦵", "description": "Lower body strength"}}
  ]
}}

Ensure the total calories sum to approximately {dailyCalorieTarget} and all meals fit the {dietType} diet.`,
        inputVariables: ['age', 'gender', 'weight', 'height', 'bmi', 'dietType', 'dailyCalorieTarget'],
      });

      const mealWorkoutChain = new LLMChain({
        // @ts-expect-error: llm can be null at runtime if not configured; guarded before use
        llm: this.model,
        prompt: mealWorkoutPrompt,
      });

      const input = {
        age: userProfile.age.toString(),
        gender: userProfile.gender,
        weight: userProfile.weight.toString(),
        height: userProfile.height.toString(),
        bmi: bmi.toString(),
        dietType: userDietType,
        dailyCalorieTarget: targetCalories.toString(),
      };

      // Add timeout to AI call to prevent hanging
      logger.info('Calling AI service to generate meal/workout plan...');
      logger.info(`API Key configured: ${!!process.env.GOOGLE_API_KEY}, Model initialized: ${!!this.model}`);
      
      let response;
      try {
        // Try calling with a shorter timeout first to catch errors faster
        // Increase timeout to 30 seconds as API calls can be slow
        response = await Promise.race([
          mealWorkoutChain.call(input),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('AI generation timeout after 30 seconds')), 30000)
          )
        ]);
        logger.info('✅ AI service responded successfully');
      } catch (error: any) {
        // Log detailed error information
        logger.error('❌ AI service call failed:', {
          message: error.message,
          name: error.name,
          stack: error.stack?.substring(0, 500) // First 500 chars of stack
        });
        
        if (error.message?.includes('timeout')) {
          logger.error('⏱️ AI generation timed out after 15 seconds');
          logger.error('💡 Possible causes:');
          logger.error('   1. Network connectivity issues');
          logger.error('   2. Invalid or expired API key');
          logger.error('   3. API quota exceeded');
          logger.error('   4. Google API service temporarily unavailable');
        } else if (error.message?.includes('API key') || error.message?.includes('authentication')) {
          logger.error('🔑 API key authentication error');
          logger.error('   Please verify your GOOGLE_API_KEY is correct and active');
        } else {
          logger.error('❓ Unknown error from AI service');
        }
        
        throw error;
      }

      // Parse the AI response
      let aiResponse;
      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in AI response');
        }
      } catch (parseError) {
        logger.error('Failed to parse AI meal/workout response:', parseError);
        return this.getFallbackMealWorkoutPlan(targetCalories, userDietType);
      }

      // Calculate macros
      const totalProtein = aiResponse.meals.reduce((sum: number, meal: IMeal) => sum + (meal.protein || 0), 0);
      const totalCarbs = aiResponse.meals.reduce((sum: number, meal: IMeal) => sum + (meal.carbs || 0), 0);
      const totalFats = aiResponse.meals.reduce((sum: number, meal: IMeal) => sum + (meal.fats || 0), 0);
      const totalCalories = aiResponse.meals.reduce((sum: number, meal: IMeal) => sum + meal.calories, 0);

      // Calculate percentages
      const proteinCalories = totalProtein * 4;
      const carbsCalories = totalCarbs * 4;
      const fatsCalories = totalFats * 9;

      const proteinPercent = Math.round((proteinCalories / totalCalories) * 100);
      const carbsPercent = Math.round((carbsCalories / totalCalories) * 100);
      const fatsPercent = Math.round((fatsCalories / totalCalories) * 100);

      const mealWorkoutPlan: IMealWorkoutPlan = {
        meals: aiResponse.meals,
        homeWorkouts: aiResponse.homeWorkouts,
        gymWorkouts: aiResponse.gymWorkouts,
        macros: {
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fats: Math.round(totalFats),
          proteinPercent,
          carbsPercent,
          fatsPercent,
        },
        generatedAt: new Date(),
      };

      logger.info(`Meal and workout plan generated successfully for user: ${userProfile.email}`);
      return mealWorkoutPlan;

    } catch (error: any) {
      // Catch timeout or other errors
      if (error.message?.includes('timeout')) {
        logger.warn('AI generation timed out, using fallback plan');
      } else {
        logger.error('Error generating meal and workout plan:', error);
      }
      const targetCalories = dailyCalorieTarget || userProfile.dailyCalorieTarget || 2000;
      const userDietType = dietType || userProfile.dietType || 'balanced';
      return this.getFallbackMealWorkoutPlan(targetCalories, userDietType);
    }
  }

  // Fallback meal and workout plan when AI is unavailable
  private getFallbackMealWorkoutPlan(calories: number, dietType: string): IMealWorkoutPlan {
    const baseMeals: IMeal[] = [
      { time: 'Breakfast', name: 'Oatmeal with berries & almonds', calories: 350, protein: 12, carbs: 55, fats: 8 },
      { time: 'Snack', name: 'Greek yogurt with honey', calories: 180, protein: 15, carbs: 20, fats: 5 },
      { time: 'Lunch', name: 'Grilled chicken salad', calories: 450, protein: 35, carbs: 30, fats: 15 },
      { time: 'Snack', name: 'Apple & peanut butter', calories: 200, protein: 8, carbs: 25, fats: 10 },
      { time: 'Dinner', name: 'Salmon with quinoa & veggies', calories: 520, protein: 40, carbs: 50, fats: 18 },
    ];

    // Adjust meals based on calorie target
    const calorieRatio = calories / 2000;
    const adjustedMeals = baseMeals.map(meal => ({
      ...meal,
      calories: Math.round(meal.calories * calorieRatio),
      protein: Math.round(meal.protein * calorieRatio),
      carbs: Math.round(meal.carbs * calorieRatio),
      fats: Math.round(meal.fats * calorieRatio),
    }));

    const totalProtein = adjustedMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = adjustedMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFats = adjustedMeals.reduce((sum, meal) => sum + meal.fats, 0);
    const totalCalories = adjustedMeals.reduce((sum, meal) => sum + meal.calories, 0);

    const proteinCalories = totalProtein * 4;
    const carbsCalories = totalCarbs * 4;
    const fatsCalories = totalFats * 9;

    const proteinPercent = Math.round((proteinCalories / totalCalories) * 100);
    const carbsPercent = Math.round((carbsCalories / totalCalories) * 100);
    const fatsPercent = Math.round((fatsCalories / totalCalories) * 100);

    return {
      meals: adjustedMeals,
      homeWorkouts: [
        { name: 'Push-ups', sets: 3, reps: 15, icon: '💪', description: 'Full body strength exercise' },
        { name: 'Squats', sets: 3, reps: 20, icon: '🦵', description: 'Lower body strength' },
        { name: 'Plank', sets: 3, reps: '60s', icon: '🧘', description: 'Core strength' },
        { name: 'Jumping Jacks', sets: 3, reps: 30, icon: '🏃', description: 'Cardio exercise' },
      ],
      gymWorkouts: [
        { name: 'Bench Press', sets: 4, reps: 10, icon: '🏋️', description: 'Chest and triceps' },
        { name: 'Deadlifts', sets: 4, reps: 8, icon: '💪', description: 'Full body compound' },
        { name: 'Lat Pulldown', sets: 3, reps: 12, icon: '🔥', description: 'Back and biceps' },
        { name: 'Leg Press', sets: 4, reps: 12, icon: '🦵', description: 'Lower body strength' },
      ],
      macros: {
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fats: Math.round(totalFats),
        proteinPercent,
        carbsPercent,
        fatsPercent,
      },
      generatedAt: new Date(),
    };
  }

  // Check if AI service is available
  public async isAvailable(): Promise<boolean> {
    try {
      if (!this.initialized || !this.model) {
        logger.warn('AI service not initialized - cannot check availability');
        return false;
      }
      
      logger.info('Testing AI service availability...');
      const testPrompt = new PromptTemplate({
        template: 'Say "AI service is working"',
        inputVariables: [],
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: testPrompt,
      });

      // Add timeout to availability check
      await Promise.race([
        chain.call({}),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Availability check timeout')), 5000)
        )
      ]);
      
      logger.info('✅ AI service is available');
      return true;
    } catch (error: any) {
      logger.error('❌ AI service availability check failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
