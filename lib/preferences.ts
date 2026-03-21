import {
  TreePine,
  GraduationCap,
  Heart,
  Palette,
  Home,
  Brain,
  CircleDot,
} from "lucide-react"

export const INTERESTS = [
  { id: "environment", label: "Environment", icon: TreePine, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { id: "education", label: "Education", icon: GraduationCap, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { id: "healthcare", label: "Healthcare", icon: Heart, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { id: "arts-culture", label: "Arts & Culture", icon: Palette, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  { id: "senior-care", label: "Senior Care", icon: Home, color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { id: "mental-health", label: "Mental Health", icon: Brain, color: "text-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  { id: "other", label: "No preference", icon: CircleDot, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
] as const

/** Categories used for opportunities and filters - matches INTERESTS labels (excluding "No preference") */
export const CATEGORIES = [
  "Environment",
  "Education",
  "Healthcare",
  "Arts & Culture",
  "Senior Care",
  "Mental Health",
  "Animal Welfare",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

export const VOLUNTEER_OPTIONS = [
  { id: "hybrid", label: "Hybrid" },
  { id: "in-person", label: "In-person" },
  { id: "remote", label: "Remote" },
  { id: "no-preference", label: "No preference" },
] as const

export const AVAILABILITY_OPTIONS = [
  { id: "weekends", label: "Weekends" },
  { id: "weekdays", label: "Weekdays" },
  { id: "any-time", label: "No preference" },
] as const
