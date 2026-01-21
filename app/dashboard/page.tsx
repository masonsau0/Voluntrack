"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HorizontalProgressTracker } from "@/components/horizontal-progress-tracker"

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
} from "lucide-react"

const tabs = [
  { id: "progress", label: "Progress Tracking", icon: TrendingUp },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "forms", label: "My Forms", icon: FolderOpen },
  { id: "news", label: "News/Events", icon: Newspaper },
  { id: "account", label: "My Account", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings },
]

const favouritedOpportunities = [
  {
    id: 1,
    title: "Trinity Bellwoods Park: Park Clean-Up",
    date: "July 30",
    category: "Environment",
    icon: Leaf,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 2,
    title: "Library Reading Program",
    date: "August 4",
    category: "Education",
    icon: BookOpen,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    title: "Beach Dune Restoration",
    date: "August 22",
    category: "Environment",
    icon: Leaf,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 4,
    title: "Habitat Restoration Project",
    date: "August 29",
    category: "Environment",
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

// Category color mapping
const categoryColors: { [key: string]: string } = {
  Environment: "bg-green-50 border-green-200",
  "Community Outreach": "bg-orange-50 border-orange-200",
  Education: "bg-blue-50 border-blue-200",
  Healthcare: "bg-pink-50 border-pink-200",
  "Animal Welfare": "bg-amber-50 border-amber-200",
  "Arts & Culture": "bg-purple-50 border-purple-200",
}

const sampleApplications = [
  {
    id: 1,
    title: "Trinity Bellwoods Park: Park Clean-Up",
    location: "790 Queen St W, Toronto, ON M6J 1G3",
    date: "Saturday, July 30, 2025, 10:00 AM – 12:00 PM",
    hours: "2 Hr",
    category: "Environment",
    status: "pending",
  },
  {
    id: 2,
    title: "Food Bank Sorting",
    location: "125 Main St, Toronto, ON M4C 1A1",
    date: "Saturday, June 14, 2025, 7:00 AM – 9:00 AM",
    hours: "2 Hr",
    category: "Community Outreach",
    status: "approved",
  },
  {
    id: 3,
    title: "Community Garden Planting",
    location: "456 Oak St, Toronto, ON M5H 2N2",
    date: "Sunday, July 13, 2025, 12:00 AM – 2:00 PM",
    hours: "2 Hr",
    category: "Environment",
    status: "approved",
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
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, John!</h1>
                <p className="text-muted-foreground mt-1">Ready to make a difference today?</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 rounded-full">
                <FolderOpen className="w-4 h-4" />
                View All Applications
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent rounded-full">
                <BarChart3 className="w-4 h-4" />
                View Progress
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl mb-6 shadow-sm overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const isLinkTab = tab.id === "news" || tab.id === "applications"
                const isActive = isLinkTab ? false : activeTab === tab.id

                if (isLinkTab) {
                  const href = tab.id === "news" ? "/news" : "/applications"
                  return (
                    <Link
                      key={tab.id}
                      href={href}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
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
            {/* Left side: 3 stat cards in a row */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              {/* Blue Card - Hours Progress with Rocket */}
              <Card className="bg-blue-500 border-0 text-white overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer h-[140px]">
                <CardContent className="p-3 h-full">
                  <HorizontalProgressTracker completedHours={24} goalHours={40} />
                </CardContent>
              </Card>

              {/* Teal Card - Completed Opportunities */}
              <Card className="bg-teal-500 border-0 text-white overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer relative h-[140px]">
                <CardContent className="p-3 h-full flex flex-col">
                  {/* Decorative circles */}
                  <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full" />
                  <div className="absolute top-6 right-6 w-8 h-8 bg-white/10 rounded-full" />

                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>

                  <div className="mt-auto pt-4">
                    <p className="text-xs font-medium text-white">Completed Opportunities</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </CardContent>
              </Card>

              {/* Orange Card - Pending Applications */}
              <Card className="bg-orange-500 border-0 text-white overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer relative h-[140px]">
                <CardContent className="p-3 h-full flex flex-col">
                  {/* Decorative circles */}
                  <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full" />
                  <div className="absolute top-6 right-6 w-8 h-8 bg-white/10 rounded-full" />

                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>

                  <div className="mt-auto pt-4">
                    <p className="text-xs font-medium text-white">Pending Applications</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
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
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        Park Clean-Up
                      </span>
                      <span className="text-muted-foreground">2:00 PM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        Library Reading Program
                      </span>
                      <span className="text-muted-foreground">4:00 PM</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                        Food Bank Sorting
                      </span>
                      <span className="text-muted-foreground">10:00 AM</span>
                    </li>
                  </ul>
                  <Link
                    href="/calendar"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 mt-3"
                  >
                    View Full Calendar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
                            className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-md hover:shadow-lg transition-shadow duration-200 ${categoryColors[app.category] || "bg-gray-50 border-gray-200"}`}
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

            {/* News/Events and Quick Actions Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* News/Events */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Newspaper className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-base font-semibold">News/Events</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-700 rounded-lg px-2 py-1 text-xs font-semibold text-center flex items-center justify-center min-h-[32px]">
                        <div>Jan 20</div>
                      </div>
                      <p className="text-sm">Spring Volunteer Fair — Jan 25 (Register Now)</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 bg-orange-100 text-orange-700 rounded-lg px-2 py-1 text-xs font-semibold text-center flex items-center justify-center min-h-[32px]">
                        <div>Jan 28</div>
                      </div>
                      <p className="text-sm">Reminder: Complete Safety Training by Jan 30</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 bg-teal-100 text-teal-700 rounded-lg px-2 py-1 text-xs font-semibold text-center flex items-center justify-center min-h-[32px]">
                        <div>Feb 01</div>
                      </div>
                      <p className="text-sm">Scholarship Deadline: Youth Leadership Award</p>
                    </div>
                  </div>

                  <Link
                    href="/news"
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 mt-4"
                  >
                    View All News
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>

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
                        className={`rounded-xl p-3 flex items-center gap-3 border shadow-sm ${categoryColors[opp.category] || "bg-gray-50 border-gray-200"}`}
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
