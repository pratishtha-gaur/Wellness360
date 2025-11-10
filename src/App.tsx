import React, { useEffect, useState } from "react";
import { Home, Activity, BarChart3, User } from "lucide-react";
import { OnboardingPage } from "./components/OnboardingPage";
import { Dashboard } from "./components/Dashboard";
import { DietFitness } from "./components/DietFitness";
import { Analytics } from "./components/Analytics";
import { Profile } from "./components/Profile";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type Page = "dashboard" | "diet" | "analytics" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("Health check failed");
        const data = await res.json();
        if (data?.data?.status === "healthy" || data?.status === "ok") {
          // Only show success, don't show errors
          console.log("✅ Backend API is connected");
        }
      } catch (e) {
        // Silently fail - don't show error toast
        // Backend might not be running in development, which is okay
        console.warn("⚠️ Backend API health check failed (this is okay if backend is not running)");
      }
    };
    checkHealth();
  }, []);

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
    // Store the name in localStorage for persistence
    try {
      localStorage.setItem('userName', name);
      // Also set a session flag to indicate user is logged in
      localStorage.setItem('isLoggedIn', 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  const handleLogout = () => {
    setUserName(null);
    try {
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isLoggedIn');
      // Clear meal plan cache on logout
      localStorage.removeItem('mealWorkoutPlan');
      localStorage.removeItem('mealWorkoutPlanDate');
      toast.success('Logged out successfully');
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  // Load userName from localStorage on mount only if logged in
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const storedName = localStorage.getItem('userName');
      // Only auto-login if both isLoggedIn flag and userName exist
      if (isLoggedIn === 'true' && storedName) {
        setUserName(storedName);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  if (!userName) {
    return (
      <OnboardingPage onComplete={handleOnboardingComplete} />
    );
  }

  const navigation = [
    { id: "dashboard" as Page, label: "Dashboard", icon: Home },
    {
      id: "diet" as Page,
      label: "Diet & Fitness",
      icon: Activity,
    },
    {
      id: "analytics" as Page,
      label: "Analytics",
      icon: BarChart3,
    },
    { id: "profile" as Page, label: "Profile", icon: User },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around md:justify-center md:gap-8 py-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs md:text-sm">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pb-20 md:pb-0 md:pt-16">
        {currentPage === "dashboard" && (
          <Dashboard userName={userName} />
        )}
        {currentPage === "diet" && <DietFitness />}
        {currentPage === "analytics" && <Analytics />}
        {currentPage === "profile" && <Profile userName={userName} onLogout={handleLogout} />}
      </div>

      <Toaster />
    </div>
  );
}