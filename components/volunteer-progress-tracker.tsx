"use client"

import { useEffect, useState } from "react"
import { Target, Star, Sparkles } from "lucide-react"

interface VolunteerProgressTrackerProps {
  completedHours: number
  goalHours: number
}

export function VolunteerProgressTracker({ completedHours, goalHours }: VolunteerProgressTrackerProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const remainingHours = goalHours - completedHours
  const progressPercent = Math.min((completedHours / goalHours) * 100, 100)

  useEffect(() => {
    // Animate the progress on mount
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent)
    }, 300)
    return () => clearTimeout(timer)
  }, [progressPercent])

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-4 right-4 text-blue-200">
        <Star className="w-6 h-6 fill-current" />
      </div>
      <div className="absolute top-12 right-12 text-blue-200">
        <Star className="w-4 h-4 fill-current" />
      </div>
      <div className="absolute top-20 right-6 text-blue-200">
        <Sparkles className="w-5 h-5" />
      </div>

      <h3 className="text-lg font-bold text-center text-foreground mb-2">Volunteer Hours Progress</h3>

      {/* Speech bubble */}
      <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-2 mx-auto w-fit mb-6 relative">
        <p className="text-sm text-green-800 font-medium text-center">
          {completedHours} hours completed.
          <br />
          Only {remainingHours} hours left!
        </p>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-100 border-r border-b border-green-300 rotate-45" />
      </div>

      {/* Progress Track */}
      <div className="relative h-64 flex justify-center">
        {/* Goal badge at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-orange-400 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg border-4 border-orange-300">
            <span className="text-lg font-bold">{goalHours}</span>
            <span className="text-[10px] uppercase tracking-wide">Hours</span>
          </div>
        </div>

        {/* Track line */}
        <div className="absolute top-16 bottom-16 w-1 bg-gray-300 rounded-full">
          {/* Filled progress */}
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out"
            style={{ height: `${animatedProgress}%` }}
          />
        </div>

        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-colors duration-500 ${
              progressPercent >= milestone ? "bg-blue-500 border-blue-400" : "bg-white border-gray-300"
            }`}
            style={{ bottom: `${16 + (milestone / 100) * 64}%` }}
          />
        ))}

        {/* Rocket */}
        <div
          className="absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-20"
          style={{ bottom: `calc(${12 + (animatedProgress / 100) * 64}%)` }}
        >
          <div className="relative">
            {/* Rocket body */}
            <div className="bg-gradient-to-b from-blue-500 to-blue-600 w-10 h-14 rounded-t-full flex items-center justify-center shadow-lg relative">
              <Target className="w-5 h-5 text-white" />
              {/* Rocket window */}
              <div className="absolute top-2 w-4 h-4 bg-blue-300 rounded-full border-2 border-blue-400" />
              {/* Rocket fins */}
              <div className="absolute -left-2 bottom-0 w-3 h-6 bg-blue-600 rounded-bl-lg" />
              <div className="absolute -right-2 bottom-0 w-3 h-6 bg-blue-600 rounded-br-lg" />
            </div>
            {/* Flame */}
            <div className="flex justify-center -mt-1">
              <div className="w-2 h-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-b-full animate-pulse" />
              <div className="w-3 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-b-full animate-pulse mx-0.5" />
              <div className="w-2 h-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-b-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Earth at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="w-24 h-12 bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 rounded-t-full overflow-hidden relative">
            {/* Land masses */}
            <div className="absolute top-2 left-4 w-6 h-4 bg-green-500 rounded-full" />
            <div className="absolute top-3 right-3 w-8 h-5 bg-green-500 rounded-full" />
            <div className="absolute bottom-0 left-8 w-4 h-3 bg-green-500 rounded-t-full" />
          </div>
        </div>
      </div>

      {/* Progress percentage */}
      <div className="text-center mt-4">
        <span className="text-3xl font-bold text-blue-600">{Math.round(progressPercent)}%</span>
        <p className="text-sm text-muted-foreground">of your goal completed</p>
      </div>
    </div>
  )
}
