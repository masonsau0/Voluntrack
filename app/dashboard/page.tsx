"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HorizontalProgressTracker } from "@/components/horizontal-progress-tracker"
import { CalendarModal } from "@/components/calendar-modal"

import {
  Sparkles,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  Plus,
  Search,
  Calendar,
  FileText,
  Zap,
  BarChart3,
  Settings,
  User,
  Newspaper,
  Award,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  Target,
  Heart,
  MapPin,
  Clock,
  Leaf,
  BookOpen,
  X,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react"

const tabs = [
  { id: "progress", label: "Progress Tracking", icon: TrendingUp },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "account", label: "My Account", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings },
]

const favouritedOpportunities = [
  {
    id: 1,
    title: "Trinity Bellwoods Park: Park Clean-Up",
    organization: "Toronto Parks Foundation",
    location: "790 Queen St W, Toronto, ON M6J 1G3",
    date: "July 30",
    fullDate: "Wednesday, July 30, 2025, 2:00 PM – 4:00 PM",
    appliedDate: "2025-01-20",
    hours: "2 Hr",
    category: "Environment",
    status: "pending",
    description: "Join us for a community park clean-up. Help maintain one of Toronto's most beloved green spaces.",
    skills: ["Outdoor Work", "Teamwork"],
    spotsLeft: 12,
    totalSpots: 25,
    commitment: "One-time",
    image: "/event-park-cleanup.png",
    icon: Leaf,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 2,
    title: "Library Reading Program",
    organization: "Toronto Public Library",
    location: "789 Yonge St, Toronto, ON M4W 2G8",
    date: "August 4",
    fullDate: "Monday, August 4, 2025, 3:00 PM – 5:00 PM",
    appliedDate: "2025-01-18",
    hours: "2 Hr",
    category: "Education",
    status: "pending",
    description: "Read to children and help foster a love of books. Perfect for those who enjoy working with kids.",
    skills: ["Reading", "Communication", "Patience"],
    spotsLeft: 8,
    totalSpots: 15,
    commitment: "Weekly",
    image: "/event-youth-mentorship.png",
    icon: BookOpen,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    title: "Beach Dune Restoration",
    organization: "Lake Ontario Waterkeeper",
    location: "Woodbine Beach, Toronto, ON M4L 3V7",
    date: "August 22",
    fullDate: "Friday, August 22, 2025, 9:00 AM – 12:00 PM",
    appliedDate: "2025-01-22",
    hours: "3 Hr",
    category: "Environment",
    status: "pending",
    description: "Help restore beach dunes and protect native vegetation along Toronto's waterfront.",
    skills: ["Outdoor Work", "Physical Work"],
    spotsLeft: 20,
    totalSpots: 40,
    commitment: "One-time",
    image: "/event-park-cleanup.png",
    icon: Leaf,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 4,
    title: "Habitat Restoration Project",
    organization: "Toronto Wildlife Centre",
    location: "60 Carl Hall Rd, Toronto, ON M3K 2C1",
    date: "August 29",
    fullDate: "Friday, August 29, 2025, 10:00 AM – 1:00 PM",
    appliedDate: "2025-01-25",
    hours: "3 Hr",
    category: "Environment",
    status: "pending",
    description: "Assist with wildlife habitat restoration including planting native species and removing invasive plants.",
    skills: ["Conservation", "Physical Work", "Teamwork"],
    spotsLeft: 15,
    totalSpots: 30,
    commitment: "Monthly",
    image: "/event-park-cleanup.png",
    icon: Leaf,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
]

const badges = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first hour",
    icon: Star,
    color: "bg-yellow-500",
    earned: true,
  },
  {
    id: 2,
    name: "Helping Hand",
    description: "Log 10 volunteer hours",
    icon: Heart,
    color: "bg-pink-500",
    earned: true,
  },
  {
    id: 3,
    name: "Community Hero",
    description: "Complete 5 opportunities",
    icon: Trophy,
    color: "bg-purple-500",
    earned: false,
  },
  { id: 4, name: "Goal Setter", description: "Reach 40 hours", icon: Target, color: "bg-blue-500", earned: false },
  {
    id: 5,
    name: "Team Player",
    description: "Join a group event",
    icon: Award,
    color: "bg-teal-500",
    earned: true,
  },
  {
    id: 6,
    name: "Early Bird",
    description: "Apply within 24 hours",
    icon: Zap,
    color: "bg-orange-500",
    earned: false,
  },
  {
    id: 7,
    name: "Dedicated",
    description: "Volunteer 3 weeks in a row",
    icon: Calendar,
    color: "bg-indigo-500",
    earned: false,
  },
  {
    id: 8,
    name: "Explorer",
    description: "Try 3 different categories",
    icon: Search,
    color: "bg-green-500",
    earned: true,
  },
  {
    id: 9,
    name: "Rising Star",
    description: "Earn 5 badges",
    icon: Sparkles,
    color: "bg-amber-500",
    earned: false,
  },
  {
    id: 10,
    name: "Champion",
    description: "Complete 100 hours",
    icon: Trophy,
    color: "bg-red-500",
    earned: false,
  },
]

// Status colors for application status badges
const statusColors: { [key: string]: { bg: string; text: string; border: string; icon: typeof CheckCircle } } = {
  approved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", icon: CheckCircle },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", icon: Clock3 },
  denied: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", icon: XCircle },
}

// Category color mapping (expanded for popup modal)
const categoryColors: { [key: string]: { bg: string; text: string; border: string; cardBg: string } } = {
  Environment: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", cardBg: "bg-green-50 border-green-200" },
  "Community Outreach": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", cardBg: "bg-orange-50 border-orange-200" },
  Education: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", cardBg: "bg-blue-50 border-blue-200" },
  Healthcare: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300", cardBg: "bg-pink-50 border-pink-200" },
  "Animal Welfare": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", cardBg: "bg-amber-50 border-amber-200" },
  "Arts & Culture": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", cardBg: "bg-purple-50 border-purple-200" },
  "Youth Programs": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300", cardBg: "bg-cyan-50 border-cyan-200" },
  "Senior Care": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", cardBg: "bg-rose-50 border-rose-200" },
}

const sampleApplications = [
  {
    id: 1,
    title: "Trinity Bellwoods Park: Park Clean-Up",
    organization: "Toronto Parks Foundation",
    location: "790 Queen St W, Toronto, ON M6J 1G3",
    date: "Saturday, July 30, 2025, 10:00 AM – 12:00 PM",
    appliedDate: "2025-01-15",
    hours: "2 Hr",
    category: "Environment",
    status: "pending",
    description: "Join us for a community park clean-up at Trinity Bellwoods Park. Help maintain one of Toronto's most beloved green spaces by picking up litter, raking leaves, and keeping pathways clear.",
    skills: ["Outdoor Work", "Teamwork"],
    spotsLeft: 8,
    totalSpots: 20,
    commitment: "One-time",
    image: "/event-park-cleanup.png",
  },
  {
    id: 2,
    title: "Food Bank Sorting",
    organization: "Daily Bread Food Bank",
    location: "125 Main St, Toronto, ON M4C 1A1",
    date: "Saturday, June 14, 2025, 7:00 AM – 9:00 AM",
    appliedDate: "2025-01-10",
    hours: "2 Hr",
    category: "Community Outreach",
    status: "approved",
    description: "Help sort and distribute food donations to families in need. Tasks include organizing donations, checking expiry dates, and packing food hampers for distribution.",
    skills: ["Organization", "Physical Work", "Teamwork"],
    spotsLeft: 15,
    totalSpots: 30,
    commitment: "Weekly",
    image: "/event-volunteer-fair.png",
  },
  {
    id: 3,
    title: "Community Garden Planting",
    organization: "FoodShare Toronto",
    location: "456 Oak St, Toronto, ON M5H 2N2",
    date: "Sunday, July 13, 2025, 12:00 AM – 2:00 PM",
    appliedDate: "2025-01-12",
    hours: "2 Hr",
    category: "Environment",
    status: "approved",
    description: "Help grow fresh vegetables for community food programs. Tasks include planting, weeding, watering, and harvesting. Learn urban farming techniques.",
    skills: ["Gardening", "Physical Work"],
    spotsLeft: 10,
    totalSpots: 20,
    commitment: "Monthly",
    image: "/event-park-cleanup.png",
  },
]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("progress")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const badgesRef = useRef<HTMLDivElement>(null)
  const [hasApplications] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<typeof sampleApplications[0] | null>(null)
  const [selectedSaved, setSelectedSaved] = useState<typeof favouritedOpportunities[0] | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!badgesRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - badgesRef.current.offsetLeft)
    setScrollLeft(badgesRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !badgesRef.current) return
    e.preventDefault()
    const x = e.pageX - badgesRef.current.offsetLeft
    const walk = (x - startX) * 2
    badgesRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    return { daysInMonth, startingDay }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const events: { [key: number]: string } = {
    5: "blue",
    12: "teal",
    18: "orange",
    24: "blue",
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header with Stats */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Welcome Message and Button */}
              <div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, John!</h1>
                    <p className="text-muted-foreground mt-1">Ready to make a difference today?</p>
                  </div>
                </div>

              </div>

              {/* Stats in Banner */}
              <div className="flex flex-wrap gap-4">
                {/* Completed Opportunities Stat */}
                <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-600 font-medium">Completed</p>
                    <p className="text-xl font-bold text-teal-700">5</p>
                  </div>
                </div>

                {/* Pending Applications Stat */}
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Pending</p>
                    <p className="text-xl font-bold text-orange-700">3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl mb-6 shadow-sm overflow-x-auto">
            <div className="flex w-full">
              {tabs.map((tab) => {
                const isLinkTab = tab.id === "applications" || tab.id === "account" || tab.id === "preferences"
                const isActive = isLinkTab ? false : activeTab === tab.id

                if (isLinkTab) {
                  const href = tab.id === "applications" ? "/applications" : tab.id === "account" ? "/account" : "/signup/preferences"
                  return (
                    <Link
                      key={tab.id}
                      href={href}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </Link>
                  )
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
                      ? "border-blue-500 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-4 mb-4">
            {/* Left side: Full-width Hour Progress Card */}
            <div className="lg:col-span-3">
              {/* Blue Card - Hours Progress with Rocket - Now Full Width */}
              <Card className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 border-0 text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer h-[260px] shadow-xl hover:shadow-2xl ring-1 ring-white/10">
                <CardContent className="p-4 h-full relative">
                  <HorizontalProgressTracker completedHours={24} goalHours={40} />
                </CardContent>
              </Card>
            </div>

            {/* Right side: Interactive Calendar */}
            <Card className="shadow-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer row-span-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-sm">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="text-xs font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: currentDate.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-1" />
                  ))}
                  {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const hasEvent = events[day]
                    const isToday =
                      day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()
                    return (
                      <button
                        key={day}
                        className={`p-1 text-xs rounded-full transition-colors relative ${isToday ? "bg-blue-500 text-white font-bold" : "hover:bg-muted"
                          }`}
                      >
                        {day}
                        {hasEvent && !isToday && (
                          <span
                            className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${hasEvent === "blue"
                              ? "bg-blue-500"
                              : hasEvent === "teal"
                                ? "bg-teal-500"
                                : "bg-orange-500"
                              }`}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Upcoming Shifts section below the calendar */}
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm mb-3">Upcoming Shifts</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Park Clean-Up
                      </span>
                      <span className="text-muted-foreground">2:00 PM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        Library Reading Program
                      </span>
                      <span className="text-muted-foreground">4:00 PM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Food Bank Sorting
                      </span>
                      <span className="text-muted-foreground">10:00 AM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Garden Planting
                      </span>
                      <span className="text-muted-foreground">Tomorrow 9:00 AM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Fundraising Workshop
                      </span>
                      <span className="text-muted-foreground">Wed 5:30 PM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Elderly Home Visit
                      </span>
                      <span className="text-muted-foreground">Sat 11:00 AM</span>
                    </li>
                  </ul>
                  <CalendarModal>
                    <button
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 mt-4 w-full justify-center py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Full Calendar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CalendarModal>
                </div>
              </CardContent>
            </Card>

            {/* Badges Container */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">Your Badges</h2>
                      <p className="text-xs text-muted-foreground">Achievements you've earned</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronLeft className="w-3 h-3" />
                      <span>Scroll to explore</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    <div
                      ref={badgesRef}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`flex gap-4 overflow-x-auto pb-2 scrollbar-hide ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {badges.map((badge) => (
                        <div
                          key={badge.id}
                          className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border w-28 select-none ${badge.earned ? "bg-white" : "bg-muted/50 opacity-50"
                            }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mb-2 ${!badge.earned && "grayscale"}`}
                          >
                            <badge.icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-center">{badge.name}</p>
                          <p className="text-xs text-muted-foreground text-center">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Recent Applications */}
            <div className="lg:col-span-3">
              <Card className="shadow-sm h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Recent Applications</h2>
                        <p className="text-sm text-muted-foreground">Your latest volunteer applications</p>
                      </div>
                    </div>
                    <Link
                      href="/applications"
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {hasApplications ? (
                    <div>
                      <div className="space-y-4">
                        {sampleApplications.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.01] ${categoryColors[app.category]?.cardBg || "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-2">{app.title}</h3>
                              <div className="space-y-1 text-sm">
                                <p className="flex items-center gap-2">
                                  <span className="text-red-500 font-medium">Location</span>
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  <span className="text-muted-foreground">: {app.location}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-yellow-600 font-medium">Time</span>
                                  <Clock className="w-3 h-3 text-yellow-600" />
                                  <span className="text-muted-foreground">: {app.date}</span>
                                </p>
                                <p>
                                  <span className="font-medium">Volunteer Hours</span>
                                  <span className="text-muted-foreground"> : {app.hours}</span>
                                </p>
                                <p>
                                  <span className="font-medium">Category:</span>
                                  <span className="text-muted-foreground"> {app.category}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                  : "bg-green-100 text-green-700 border border-green-300"
                                  }`}
                              >
                                {app.status === "pending" ? "Pending" : "Approved"}
                              </span>
                              <Button
                                variant="outline"
                                className="bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 hover:text-orange-800 rounded-full"
                                onClick={(e) => { e.stopPropagation(); setSelectedApplication(app); }}
                              >
                                View Posting
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-center mt-6 font-semibold">
                        Total Applications Submitted: {sampleApplications.length}
                      </p>
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-xl bg-muted mx-auto flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">No applications yet</h3>
                      <p className="text-muted-foreground mt-1 mb-6">
                        Start exploring opportunities to make a difference
                      </p>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
                        <Plus className="w-4 h-4" />
                        Browse Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resources and Quick Actions Column */}
            <div className="lg:col-span-1 space-y-6">


              {/* Favourited */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-pink-600" />
                    </div>
                    <h2 className="text-base font-semibold">Saved</h2>
                  </div>

                  <div className="space-y-3">
                    {favouritedOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedSaved(opp)}
                        className={`rounded-xl p-3 flex items-center gap-3 border shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${categoryColors[opp.category]?.cardBg || "bg-gray-50 border-gray-200"}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${opp.iconBg}`}>
                          <opp.icon className={`w-5 h-5 ${opp.iconColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{opp.title}</p>
                          <p className="text-xs text-muted-foreground">{opp.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/applications"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 mt-4"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-48">
              <Image
                src={selectedApplication.image}
                alt={selectedApplication.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
              <button
                onClick={() => setSelectedApplication(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 border backdrop-blur-sm ${statusColors[selectedApplication.status].bg} ${statusColors[selectedApplication.status].text} ${statusColors[selectedApplication.status].border}`}
                >
                  {(() => { const StatusIcon = statusColors[selectedApplication.status].icon; return <StatusIcon className="w-4 h-4" />; })()}
                  {selectedApplication.status === "pending" ? "Pending" : selectedApplication.status === "approved" ? "Approved" : "Not Approved"}
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{selectedApplication.title}</h2>
                <p className="text-white/90 drop-shadow">{selectedApplication.organization}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`text-sm px-3 py-1 rounded-full ${categoryColors[selectedApplication.category]?.bg} ${categoryColors[selectedApplication.category]?.text}`}>
                  {selectedApplication.category}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {selectedApplication.commitment}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-sky-100 text-sky-700">
                  {selectedApplication.hours}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                  <p className="text-2xl font-bold text-sky-700">{selectedApplication.spotsLeft}</p>
                  <p className="text-sm text-slate-600">Spots Remaining</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-700">{selectedApplication.totalSpots}</p>
                  <p className="text-sm text-slate-600">Total Capacity</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selectedApplication.date.split(',').slice(0, 2).join(',')}</p>
                    <p className="text-sm">{selectedApplication.date.split(',').slice(2).join(',').trim()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-rose-600" />
                  </div>
                  <span>{selectedApplication.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">Helpful Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills.map((skill) => (
                    <span key={skill} className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">About This Opportunity</h3>
                <p className="text-slate-600 leading-relaxed">
                  {selectedApplication.description}
                </p>
              </div>

              {/* Application Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Your Application</h3>
                <p className="text-sm text-blue-600">
                  Applied on: {new Date(selectedApplication.appliedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Status-specific message */}
              {selectedApplication.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Pending Review:</strong> Your application is currently being reviewed by the organization. You will be notified once a decision is made.
                  </p>
                </div>
              )}
              {selectedApplication.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    <strong>Approved!</strong> Congratulations! Your application has been approved. Make sure to arrive on time at the specified location.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedApplication.status === 'pending' && (
                  <Button variant="outline" className="flex-1 rounded-full py-6 border-red-300 text-red-600 hover:bg-red-50">
                    Withdraw Application
                  </Button>
                )}
                {selectedApplication.status === 'approved' && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-6">
                    Add to Calendar
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="px-6 rounded-full py-6 border-slate-300 text-slate-700 hover:bg-slate-100"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Opportunity Detail Modal */}
      {selectedSaved && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSaved(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-48">
              <Image
                src={selectedSaved.image}
                alt={selectedSaved.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
              <button
                onClick={() => setSelectedSaved(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 border backdrop-blur-sm ${categoryColors[selectedSaved.category]?.bg} ${categoryColors[selectedSaved.category]?.text} ${categoryColors[selectedSaved.category]?.border}`}
                >
                  {selectedSaved.category}
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{selectedSaved.title}</h2>
                <p className="text-white/90 drop-shadow">{selectedSaved.organization}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`text-sm px-3 py-1 rounded-full ${categoryColors[selectedSaved.category]?.bg} ${categoryColors[selectedSaved.category]?.text}`}>
                  {selectedSaved.category}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {selectedSaved.commitment}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-sky-100 text-sky-700">
                  {selectedSaved.hours}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                  <p className="text-2xl font-bold text-sky-700">{selectedSaved.spotsLeft}</p>
                  <p className="text-sm text-slate-600">Spots Remaining</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-700">{selectedSaved.totalSpots}</p>
                  <p className="text-sm text-slate-600">Total Capacity</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{selectedSaved.fullDate.split(',').slice(0, 2).join(',')}</p>
                    <p className="text-sm">{selectedSaved.fullDate.split(',').slice(2).join(',').trim()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-rose-600" />
                  </div>
                  <span>{selectedSaved.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">Helpful Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSaved.skills.map((skill) => (
                    <span key={skill} className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">About This Opportunity</h3>
                <p className="text-slate-600 leading-relaxed">
                  {selectedSaved.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6">
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className="px-6 rounded-full py-6 border-slate-300 text-slate-700 hover:bg-slate-100"
                  onClick={() => setSelectedSaved(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
