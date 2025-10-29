import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { logger } from '@/utils/logger';
import { IUserProfile, IDailyGoals, IWellnessPlan } from '@/types';

export class AIService {
  private model: ChatGoogleGenerativeAI | null = null;
  private wellnessPrompt: PromptTemplate;
  private wellnessChain: LLMChain;
  private initialized: boolean = false;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (apiKey) {
      // Initialize Google Gemini model
      this.model = new ChatGoogleGenerativeAI({
        apiKey,
        modelName: 'gemini-1.5-flash',
        temperature: 0.7,
        maxOutputTokens: 2048,
      });
      this.initialized = true;
    } else {
      logger.warn('GOOGLE_API_KEY not set. AIService will run in degraded mode.');
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

  // Check if AI service is available
  public async isAvailable(): Promise<boolean> {
    try {
      if (!this.initialized || !this.model) return false;
      const testPrompt = new PromptTemplate({
        template: 'Say "AI service is working"',
        inputVariables: [],
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: testPrompt,
      });

      await chain.call({});
      return true;
    } catch (error) {
      logger.error('AI service availability check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
