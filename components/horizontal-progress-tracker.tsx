"use client"

import { useEffect, useState } from "react"
import { Rocket, Clock, Star, Sparkles, Trophy } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

interface HorizontalProgressTrackerProps {
  completedHours: number
  goalHours: number
}

export function HorizontalProgressTracker({ completedHours, goalHours }: HorizontalProgressTrackerProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const progress = Math.min((completedHours / goalHours) * 100, 100)
  const remainingHours = goalHours - completedHours

  // Calculate level based on hours (just a simple mock logic for engagement)
  const currentLevel = Math.floor(completedHours / 10) + 1
  const nextLevelParams = {
    1: "Novice Volunteer",
    2: "Community Helper",
    3: "Impact Maker",
    4: "Change Agent",
    5: "Community Hero"
  }
  const levelTitle = nextLevelParams[currentLevel as keyof typeof nextLevelParams] || "Community Hero"

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 300)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="flex flex-col h-full relative overflow-hidden justify-center">
      {/* Animated background starfield with parallax effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#1a365d]/10">
        <div className="stars-small animate-starfield-slow" />
        <div className="stars-medium animate-starfield-medium" />
        <div className="stars-large animate-starfield-fast" />
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 relative z-10 px-2 pt-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>

          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-white flex items-center gap-2">
                Hours Progress
              </p>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium text-white border border-white/20">
                {levelTitle}
              </span>
            </div>
            <p className="text-sm text-white/80 mt-1">
              <span className="font-bold text-2xl text-white mr-1">{completedHours}</span>
              <span className="text-white/70">/ {goalHours} hours</span>
            </p>
          </div>
        </div>

        {/* Next Level Indicator */}
        <div className="hidden sm:block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-center cursor-help hover:bg-white/30 transition-colors">
                  <p className="text-xs text-white/70">Hours Left</p>
                  <p className="text-sm font-bold text-white flex items-center gap-1 justify-center">
                    {remainingHours}h to Complete
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-blue-900 text-white border-blue-800">
                <p>Complete {remainingHours} more hours to reach your 40-hour goal!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Progress Track - Enhanced */}
      <div className="relative flex-1 flex items-center px-4">
        <div className="relative w-full">
          {/* Track background with glow */}
          <div className="absolute inset-0 h-4 bg-black/20 rounded-full blur-sm" />
          <div className="relative h-4 bg-white/20 rounded-full overflow-visible shadow-inner backdrop-blur-sm border border-white/10">
            {/* Animated shimmer effect on track */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                style={{
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 4s infinite linear'
                }}
              />
            </div>

            {/* Progress Fill with gradient and glow */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.6)]"
              style={{
                width: `${animatedProgress}%`,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.95) 100%)',
              }}
            >
              {/* Internal glow line */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white transform -translate-y-1/2 opacity-50" />
            </div>

            {/* Milestone markers with Tooltips */}
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="absolute top-1/2 -translate-y-1/2 z-10"
                style={{ left: `${milestone}%` }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-white/50 transition-all duration-500 cursor-pointer hover:scale-150 ${animatedProgress >= milestone ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-blue-900/50'
                          }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-blue-950 text-white border-blue-800">
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${animatedProgress >= milestone ? 'text-yellow-400' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-bold text-xs">{milestone}% Milestone</p>
                          <p className="text-[10px] text-white/70">{animatedProgress >= milestone ? 'Unlocked!' : 'Keep going!'}</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}

            {/* Rocket - Enhanced with trail effect */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-20"
              style={{ left: `${animatedProgress}%` }}
            >
              <div className="relative -translate-x-1/2">
                {/* Glow behind rocket */}
                <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-blue-400/30 rounded-full blur-xl animate-pulse" />

                {/* Rocket container */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center shadow-2xl border-2 border-white relative z-10 group overflow-hidden">
                        <div className="absolute inset-0 bg-blue-400/10 group-hover:bg-blue-400/20 transition-colors" />
                        <Rocket className="w-6 h-6 text-blue-600 rotate-90 drop-shadow-sm group-hover:scale-110 transition-transform" />
                      </div>
                      {/* Hours Label above Rocket */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-blue-100 text-xs font-bold text-blue-600 whitespace-nowrap z-30">
                        {completedHours}h
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-blue-100" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-white text-blue-900 font-bold border-blue-200">
                      You are flying! 🚀
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Enhanced flame trail */}
                {animatedProgress > 0 && (
                  <div className="absolute right-full top-1/2 -translate-y-1/2 flex items-center mr-1">
                    <div className="w-6 h-3 bg-gradient-to-l from-orange-500 to-transparent rounded-l-full blur-[1px] animate-pulse" />
                    <div className="w-2 h-2 bg-yellow-300 rounded-full blur-[1px] animate-ping absolute right-0" />
                  </div>
                )}
              </div>
            </div>

            {/* Goal marker - Enhanced */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/40 transition-all duration-500" />
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        <Star className="w-7 h-7 text-white fill-white drop-shadow-md animate-pulse-slow" />
                      </div>
                      {/* Floating particles around star */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-yellow-500 text-white border-yellow-400 font-bold">
                    40 Hour Goal - The Finish Line! 🏆
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for new animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes starfield {
          from { transform: translateX(0); }
          to { transform: translateX(-2000px); }
        }
        .stars-small, .stars-medium, .stars-large {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 10000px;
          height: 100%;
          background-repeat: repeat-x;
        }
        .stars-small {
          background-image: radial-gradient(1px 1px at 20px 30px, #eee, transparent),
                            radial-gradient(1px 1px at 100px 70px, #fff, transparent),
                            radial-gradient(1px 1px at 200px 30px, #ddd, transparent);
          animation: starfield 100s linear infinite;
        }
        .stars-medium {
          background-image: radial-gradient(2px 2px at 50px 160px, #ddd, transparent),
                            radial-gradient(2px 2px at 150px 20px, #fff, transparent);
          animation: starfield 150s linear infinite;
        }
        .stars-large {
          background-image: radial-gradient(3px 3px at 300px 100px, #fff semi-transparent, transparent);
          animation: starfield 200s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
