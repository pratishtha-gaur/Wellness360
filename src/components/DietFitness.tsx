import React, { useState, useEffect } from 'react';
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

export function DietFitness() {
  const [location, setLocation] = useState<'home' | 'gym'>('home');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [homeWorkouts, setHomeWorkouts] = useState<Workout[]>([]);
  const [gymWorkouts, setGymWorkouts] = useState<Workout[]>([]);
  const [macros, setMacros] = useState<Macros>({
    protein: 110,
    carbs: 180,
    fats: 55,
    proteinPercent: 40,
    carbsPercent: 35,
    fatsPercent: 25,
  });
  const [targetCalories, setTargetCalories] = useState(2000);
  const [isLoading, setIsLoading] = useState(true);

  // Get user email from localStorage
  const getUserEmail = (): string | null => {
    try {
      return localStorage.getItem('userEmail');
    } catch {
      return null;
    }
  };

  // Fetch meal and workout plan from backend
  const fetchMealWorkoutPlan = async () => {
    const email = getUserEmail();
    if (!email) {
      // Fallback to default data if no email
      console.log('No user email found, using default data');
      setDefaultData();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const url = `/api/wellness/${encodeURIComponent(email)}/meal-workout-plan`;
      console.log('Fetching meal/workout plan from:', url);
      
      // Add timeout to prevent hanging (backend has 15s timeout, so we use 20s here)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const res = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const json = await res.json();
        console.log('API response:', json);
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
          
          // Check if it's AI-generated or fallback (simple heuristic)
          const isAIGenerated = !data.meals.some((meal: Meal) => 
            meal.name === 'Oatmeal with berries & almonds' || 
            meal.name === 'Greek yogurt with honey'
          );
          
          if (isAIGenerated) {
            toast.success('Loaded AI-generated personalized meal and workout plan! 🎉');
          } else {
            toast.success('Loaded meal and workout plan (using defaults - AI not configured)');
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
        toast.error('Using default recommendations. ' + errorMessage);
      }
    } catch (error: any) {
      console.error('Error fetching meal/workout plan:', error);
      if (error.name === 'AbortError') {
        console.error('Request timed out');
        toast.error('Request timed out. Using default recommendations.');
      } else {
        toast.error('Failed to load personalized plan. Using default recommendations.');
      }
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

  useEffect(() => {
    fetchMealWorkoutPlan();
  }, []);

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
                onClick={fetchMealWorkoutPlan}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
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
                  className={location === 'home' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  <Home size={16} className="mr-2" />
                  Home
                </Button>
                <Button
                  variant={location === 'gym' ? 'default' : 'outline'}
                  onClick={() => setLocation('gym')}
                  className={location === 'gym' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-white/20 text-white hover:bg-white/10'}
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
