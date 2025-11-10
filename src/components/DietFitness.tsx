import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Apple, Dumbbell, Home, Building2, Flame, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ProgressRing } from './ProgressRing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

interface Meal {
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
}

interface Workout {
  name: string;
  sets: number;
  reps: number | string;
  icon: string;
  description?: string;
}

interface Macros {
  protein: number;
  carbs: number;
  fats: number;
  proteinPercent: number;
  carbsPercent: number;
  fatsPercent: number;
}

// Get today's date string (YYYY-MM-DD) - helper function
const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export function DietFitness() {
  // Load cache synchronously on component initialization - use useMemo to only compute once
  const initialCache = useMemo(() => {
    try {
      const cached = localStorage.getItem('mealWorkoutPlan');
      const cachedDate = localStorage.getItem('mealWorkoutPlanDate');
      const today = getTodayDateString();
      
      if (cached && cachedDate === today) {
        const data = JSON.parse(cached);
        return {
          meals: data.meals || [],
          homeWorkouts: data.homeWorkouts || [],
          gymWorkouts: data.gymWorkouts || [],
          macros: data.macros || {
            protein: 110,
            carbs: 180,
            fats: 55,
            proteinPercent: 40,
            carbsPercent: 35,
            fatsPercent: 25,
          },
          targetCalories: data.targetCalories || 2000,
          hasCache: true
        };
      }
    } catch (error) {
      console.error('Error loading cached meal plan:', error);
    }
    return {
      meals: [],
      homeWorkouts: [],
      gymWorkouts: [],
      macros: {
        protein: 110,
        carbs: 180,
        fats: 55,
        proteinPercent: 40,
        carbsPercent: 35,
        fatsPercent: 25,
      },
      targetCalories: 2000,
      hasCache: false
    };
  }, []); // Only compute once on mount
  
  const [location, setLocation] = useState<'home' | 'gym'>('home');
  const [meals, setMeals] = useState<Meal[]>(initialCache.meals);
  const [homeWorkouts, setHomeWorkouts] = useState<Workout[]>(initialCache.homeWorkouts);
  const [gymWorkouts, setGymWorkouts] = useState<Workout[]>(initialCache.gymWorkouts);
  const [macros, setMacros] = useState<Macros>(initialCache.macros);
  const [targetCalories, setTargetCalories] = useState(initialCache.targetCalories);
  const [isLoading, setIsLoading] = useState(!initialCache.hasCache);

  // Get user email from localStorage
  const getUserEmail = (): string | null => {
    try {
      return localStorage.getItem('userEmail');
    } catch {
      return null;
    }
  };

  // Fetch meal and workout plan from backend
  const fetchMealWorkoutPlan = async (forceRefresh: boolean = false) => {
    const email = getUserEmail();
    if (!email) {
      // Fallback to default data if no email
      console.log('No user email found, using default data');
      setDefaultData();
      setIsLoading(false);
      return;
    }

    // If forcing refresh, clear cache first
    if (forceRefresh) {
      try {
        localStorage.removeItem('mealWorkoutPlan');
        localStorage.removeItem('mealWorkoutPlanDate');
        console.log('Cache cleared for fresh meal plan generation');
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    setIsLoading(true);
    try {
      const url = `/api/wellness/${encodeURIComponent(email)}/meal-workout-plan`;
      console.log('Fetching meal/workout plan from:', url);
      
      // Add timeout to prevent hanging (backend can take up to 25s for direct API, so we use 35s here)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout to allow for AI generation
      
      const res = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const json = await res.json();
        console.log('API response:', json);
        console.log('isAIGenerated flag:', json?.data?.isAIGenerated);
        console.log('First meal name:', json?.data?.meals?.[0]?.name);
        const data = json?.data;
        if (data && data.meals && data.meals.length > 0) {
          setMeals(data.meals || []);
          setHomeWorkouts(data.homeWorkouts || []);
          setGymWorkouts(data.gymWorkouts || []);
          if (data.macros) {
            setMacros(data.macros);
          }
          // Calculate target calories from meals
          const totalCals = data.meals?.reduce((sum: number, meal: Meal) => sum + meal.calories, 0) || 2000;
          setTargetCalories(totalCals);
          
          // Cache the data for today (exclude isAIGenerated flag from cache)
          const today = getTodayDateString();
          try {
            localStorage.setItem('mealWorkoutPlan', JSON.stringify({
              meals: data.meals,
              homeWorkouts: data.homeWorkouts,
              gymWorkouts: data.gymWorkouts,
              macros: data.macros,
              targetCalories: totalCals
            }));
            localStorage.setItem('mealWorkoutPlanDate', today);
          } catch (e) {
            // Ignore localStorage errors
          }
          
          // Show success toast only for AI-generated plans
          console.log('Checking isAIGenerated:', data.isAIGenerated, typeof data.isAIGenerated);
          if (data.isAIGenerated === true) {
            console.log('Showing success toast for AI-generated plan');
            toast.success('AI-generated meal and workout plan loaded successfully! 🎉✨');
          } else {
            console.log('Not showing toast - isAIGenerated is:', data.isAIGenerated);
          }
        } else {
          console.warn('API returned empty or invalid data, using defaults');
          setDefaultData();
        }
      } else {
        // Get error details
        let errorText: string;
        try {
          errorText = await res.text();
        } catch {
          errorText = `HTTP ${res.status}: ${res.statusText}`;
        }
        let errorMessage = 'Failed to load personalized plan';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || `HTTP ${res.status}: ${res.statusText}`;
        }
        console.error('API error:', res.status, errorMessage);
        setDefaultData();
        // Silently use defaults without showing error message
      }
    } catch (error: any) {
      console.error('Error fetching meal/workout plan:', error);
      // Check if it's a timeout error
      if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
        console.warn('Request timed out - backend may still be processing. Try refreshing again.');
        toast.error('Request timed out. The AI is taking longer than expected. Please try refreshing again.');
      }
      // Silently use defaults without showing error messages for other errors
      setDefaultData();
    } finally {
      // Always set loading to false, even if there's an error
      setIsLoading(false);
    }
  };

  // Set default data as fallback
  const setDefaultData = () => {
    setMeals([
      { time: 'Breakfast', name: 'Oatmeal with berries & almonds', calories: 350, protein: 12 },
      { time: 'Snack', name: 'Greek yogurt with honey', calories: 180, protein: 15 },
      { time: 'Lunch', name: 'Grilled chicken salad', calories: 450, protein: 35 },
      { time: 'Snack', name: 'Apple & peanut butter', calories: 200, protein: 8 },
      { time: 'Dinner', name: 'Salmon with quinoa & veggies', calories: 520, protein: 40 },
    ]);
    setHomeWorkouts([
      { name: 'Push-ups', sets: 3, reps: 15, icon: '💪' },
      { name: 'Squats', sets: 3, reps: 20, icon: '🦵' },
      { name: 'Plank', sets: 3, reps: '60s', icon: '🧘' },
      { name: 'Jumping Jacks', sets: 3, reps: 30, icon: '🏃' },
    ]);
    setGymWorkouts([
      { name: 'Bench Press', sets: 4, reps: 10, icon: '🏋️' },
      { name: 'Deadlifts', sets: 4, reps: 8, icon: '💪' },
      { name: 'Lat Pulldown', sets: 3, reps: 12, icon: '🔥' },
      { name: 'Leg Press', sets: 4, reps: 12, icon: '🦵' },
    ]);
    setTargetCalories(2000);
  };

  // Only fetch if we don't have cached data for today
  useEffect(() => {
    // Check localStorage directly to see if we have valid cache for today
    try {
      const cached = localStorage.getItem('mealWorkoutPlan');
      const cachedDate = localStorage.getItem('mealWorkoutPlanDate');
      const today = getTodayDateString();
      
      // If we have valid cache for today, don't fetch
      if (cached && cachedDate === today) {
        console.log('Using cached meal plan, skipping fetch');
        return;
      }
    } catch (error) {
      console.error('Error checking cache:', error);
    }
    
    // Only fetch if no valid cache exists
    console.log('No cache found, fetching meal plan...');
    fetchMealWorkoutPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if date changed - ONLY when date actually changes, not on tab switches
  useEffect(() => {
    // Only set up date checking if we have valid cache
    if (!initialCache.hasCache) {
      return;
    }

    const checkDateChange = () => {
      const today = getTodayDateString();
      const cachedDate = localStorage.getItem('mealWorkoutPlanDate');
      
      // Only refresh if date changed AND we have cached data
      if (cachedDate && cachedDate !== today && meals.length > 0) {
        console.log('Date changed, refreshing meal plan...');
        fetchMealWorkoutPlan();
      }
    };

    // Check on mount only (not on every render)
    checkDateChange();
    
    // Set up interval to check date change once per minute (not on every focus)
    // This is more efficient than listening to focus events
    const intervalId = setInterval(() => {
      checkDateChange();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  const workouts = location === 'home' ? homeWorkouts : gymWorkouts;
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieProgress = Math.round((totalCalories / targetCalories) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl text-white mb-2">
            Diet & Fitness Planner 🥗
          </h1>
          <p className="text-white/60">Your personalized nutrition and workout plan</p>
        </motion.div>

        {/* Calorie Ring and Macros */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white mb-4 flex items-center gap-2">
                <Flame className="text-orange-400" size={20} />
                Daily Calories
              </h3>
              <div className="flex justify-center">
                <ProgressRing 
                  progress={calorieProgress} 
                  size={180}
                  strokeWidth={14}
                  color="#f59e0b"
                  value={`${totalCalories}`}
                  label="kcal"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-white/60 text-sm">Target: {targetCalories} kcal</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm h-full">
              <h3 className="text-white mb-4">Macronutrients</h3>
              <div className="grid grid-cols-3 gap-4 h-[calc(100%-2rem)]">
                <div className="bg-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center border border-emerald-400/30">
                  <div className="text-3xl mb-2">🍗</div>
                  <p className="text-white/60 text-sm mb-1">Protein</p>
                  <p className="text-white text-2xl">{macros.protein}g</p>
                  <p className="text-emerald-400 text-sm">{macros.proteinPercent}%</p>
                </div>
                <div className="bg-blue-500/20 rounded-xl p-4 flex flex-col items-center justify-center border border-blue-400/30">
                  <div className="text-3xl mb-2">🍞</div>
                  <p className="text-white/60 text-sm mb-1">Carbs</p>
                  <p className="text-white text-2xl">{macros.carbs}g</p>
                  <p className="text-blue-400 text-sm">{macros.carbsPercent}%</p>
                </div>
                <div className="bg-amber-500/20 rounded-xl p-4 flex flex-col items-center justify-center border border-amber-400/30">
                  <div className="text-3xl mb-2">🥑</div>
                  <p className="text-white/60 text-sm mb-1">Fats</p>
                  <p className="text-white text-2xl">{macros.fats}g</p>
                  <p className="text-amber-400 text-sm">{macros.fatsPercent}%</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Meal Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Apple className="text-red-400" size={24} />
                <h3 className="text-white">Today's Meal Plan</h3>
              </div>
              <Button
                onClick={() => fetchMealWorkoutPlan(true)}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-emerald-400/50 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-400"
              >
                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-white/60">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
                <p>Loading personalized meal plan...</p>
              </div>
            ) : meals.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <p>No meal plan available. Please save your profile first.</p>
                <Button
                  onClick={fetchMealWorkoutPlan}
                  size="sm"
                  variant="outline"
                  className="mt-4 border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {meals.map((meal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div>
                    <p className="text-emerald-400 text-sm mb-1">{meal.time}</p>
                    <p className="text-white">{meal.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{meal.calories} cal</p>
                    <p className="text-white/60 text-sm">{meal.protein}g protein</p>
                  </div>
                </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Workout Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Dumbbell className="text-purple-400" size={24} />
                <h3 className="text-white">Workout Recommendations</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={location === 'home' ? 'default' : 'outline'}
                  onClick={() => setLocation('home')}
                  className={location === 'home' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-400'}
                >
                  <Home size={16} className="mr-2" />
                  Home
                </Button>
                <Button
                  variant={location === 'gym' ? 'default' : 'outline'}
                  onClick={() => setLocation('gym')}
                  className={location === 'gym' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-400'}
                >
                  <Building2 size={16} className="mr-2" />
                  Gym
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-white/60">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-400" />
                <p>Loading workout recommendations...</p>
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <p>No workout recommendations available.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {workouts.map((workout, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30"
                >
                  <div className="text-4xl">{workout.icon}</div>
                  <div className="flex-1">
                    <p className="text-white mb-1">{workout.name}</p>
                    <p className="text-white/60 text-sm">
                      {workout.sets} sets × {workout.reps} reps
                    </p>
                  </div>
                </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
