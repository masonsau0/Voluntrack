"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Clock, MapPin, Star, Sparkles } from "lucide-react"
import { Opportunity } from "@/lib/firebase/opportunities"
import { categoryColors, defaultCategoryColor } from "@/lib/ui-config"

interface OpportunityCardProps {
  opportunity: Opportunity
  matchScore?: number
  onClick?: (opportunity: Opportunity) => void
}

export const OpportunityCard = React.memo(({ opportunity, matchScore, onClick }: OpportunityCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const categoryColor = categoryColors[opportunity.category] || defaultCategoryColor

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(opportunity)}
      style={{
        transition: "all 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: isHovered ? 50 : 0,
      }}
    >
      <div
        className="relative inset-x-0 top-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md transition-all duration-500 ease-out flex flex-col h-full"
        style={{
          transform: isHovered ? "scale(1.05)" : "scale(1)",
          transformOrigin: "center center",
          boxShadow: isHovered ? "0 30px 60px -12px rgba(0,0,0,0.25)" : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        {/* Background Image */}
        <div className="relative h-48 w-full flex-shrink-0">
          <Image src={opportunity.image} alt={opportunity.title} fill className="object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor.gradient} mix-blend-multiply opacity-20`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex items-center gap-1">
            {opportunity.featured && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-[10px] font-bold shadow-lg">
                <Star className="w-2.5 h-2.5 fill-current" />
                Featured
              </div>
            )}
            {matchScore !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full text-white text-[10px] font-bold shadow-lg">
                <Sparkles className="w-2.5 h-2.5" />
                {matchScore}% match
              </div>
            )}
          </div>

          <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-medium border border-white/30">
            {opportunity.spotsLeft} left
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 p-4 ${isHovered ? "bg-white" : "bg-white/90 backdrop-blur-sm"}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{opportunity.title}</h3>
          <p className="text-gray-500 text-xs mb-2 line-clamp-1">{opportunity.organization}</p>

          {/* Quick info */}
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {opportunity.hours}h
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {opportunity.location.split(",")[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

OpportunityCard.displayName = "OpportunityCard"
