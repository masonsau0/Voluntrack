"use client"

import { useEffect, useState } from "react"
import { Rocket, Clock } from "lucide-react"

interface HorizontalProgressTrackerProps {
  completedHours: number
  goalHours: number
}

export function HorizontalProgressTracker({ completedHours, goalHours }: HorizontalProgressTrackerProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const progress = Math.min((completedHours / goalHours) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 300)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Hours Progress</p>
          <p className="text-xs text-white/70">{completedHours} hours completed</p>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative flex-1 flex items-center pr-6">
        <div className="relative w-full h-3 bg-white/20 rounded-full overflow-visible">
          {/* Progress Fill */}
          <div
            className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />

          {/* Rocket */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ left: `${animatedProgress}%` }}
          >
            <div className="relative -translate-x-1/2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Rocket className="w-4 h-4 text-blue-500 rotate-90" />
              </div>
              {/* Flame trail */}
              {animatedProgress > 0 && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 flex">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse -ml-1" />
                </div>
              )}
            </div>
          </div>

          <div className="absolute -right-6 top-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-300">
              <span className="text-xs font-bold text-blue-600">{goalHours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
