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
        if (data?.status === "ok") {
          toast.success("Connected to backend API");
        } else {
          toast.message("Backend responded", { description: JSON.stringify(data) });
        }
      } catch (e) {
        toast.error("Backend API is not reachable");
      }
    };
    checkHealth();
  }, []);

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
  };

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
        {currentPage === "profile" && <Profile />}
      </div>

      <Toaster />
    </div>
  );
}