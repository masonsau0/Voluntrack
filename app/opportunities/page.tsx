"use client"

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  Search,
  ArrowUpDown,
  RotateCcw,
  Users,
  Heart,
  Leaf,
  BookOpen,
  Star,
  Zap,
  Building2,
  Stethoscope,
  Dog,
  Palette,
  GraduationCap,
  HandHeart,
  Play,
  Info,
  Plus,
  SlidersHorizontal,
} from "lucide-react"

// Category colors matching existing scheme
const categoryColors: { [key: string]: { bg: string; text: string; border: string; gradient: string; icon: typeof Leaf; heroGradient: string } } = {
  "Environment": { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", gradient: "from-green-500/30 to-emerald-600/30", heroGradient: "from-green-900/90 via-green-800/60 to-transparent", icon: Leaf },
  "Community Outreach": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", gradient: "from-orange-500/30 to-amber-600/30", heroGradient: "from-orange-900/90 via-orange-800/60 to-transparent", icon: HandHeart },
  "Education": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", gradient: "from-blue-500/30 to-indigo-600/30", heroGradient: "from-blue-900/90 via-blue-800/60 to-transparent", icon: GraduationCap },
  "Healthcare": { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300", gradient: "from-pink-500/30 to-rose-600/30", heroGradient: "from-pink-900/90 via-pink-800/60 to-transparent", icon: Stethoscope },
  "Animal Welfare": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", gradient: "from-amber-500/30 to-yellow-600/30", heroGradient: "from-amber-900/90 via-amber-800/60 to-transparent", icon: Dog },
  "Arts & Culture": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", gradient: "from-purple-500/30 to-violet-600/30", heroGradient: "from-purple-900/90 via-purple-800/60 to-transparent", icon: Palette },
  "Youth Programs": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300", gradient: "from-cyan-500/30 to-teal-600/30", heroGradient: "from-cyan-900/90 via-cyan-800/60 to-transparent", icon: Users },
  "Senior Care": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", gradient: "from-rose-500/30 to-pink-600/30", heroGradient: "from-rose-900/90 via-rose-800/60 to-transparent", icon: Heart },
  "Corporate": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", gradient: "from-slate-500/30 to-gray-600/30", heroGradient: "from-slate-900/90 via-slate-800/60 to-transparent", icon: Building2 },
}

// Commitment level colors for light theme
const commitmentColors: { [key: string]: { bg: string; text: string } } = {
  "One-time": { bg: "bg-green-100", text: "text-green-700" },
  "Weekly": { bg: "bg-blue-100", text: "text-blue-700" },
  "Monthly": { bg: "bg-purple-100", text: "text-purple-700" },
  "Ongoing": { bg: "bg-orange-100", text: "text-orange-700" },
}

// Sample opportunities data
const sampleOpportunities = [
  // ENVIRONMENT - 8 opportunities
  {
    id: 1,
    title: "Trinity Bellwoods Park Clean-Up",
    organization: "Toronto Parks Foundation",
    description: "Join us for a community park clean-up event. Help maintain our beautiful urban green spaces by picking up litter, removing invasive plants, and beautifying the park grounds.",
    date: "Saturday, Jan 25, 2026",
    dateISO: "2026-01-25",
    time: "9:00 AM - 12:00 PM",
    location: "790 Queen St W",
    hours: 3,
    spotsLeft: 12,
    totalSpots: 30,
    category: "Environment",
    commitment: "One-time",
    skills: ["Outdoor Work", "Teamwork"],
    featured: true,
    image: "/event-park-cleanup.png",
  },
  {
    id: 8,
    title: "Community Garden Volunteer",
    organization: "FoodShare Toronto",
    description: "Help grow fresh vegetables for community food programs. Tasks include planting, weeding, watering, and harvesting. Learn urban farming techniques.",
    date: "Spring-Fall Season",
    dateISO: "2025-04-01",
    time: "9:00 AM - 1:00 PM",
    location: "90 Croatia St",
    hours: 4,
    spotsLeft: 10,
    totalSpots: 20,
    category: "Environment",
    commitment: "Monthly",
    skills: ["Gardening", "Physical Work"],
    featured: false,
    image: "/event-volunteer-fair.png",
  },
  {
    id: 13,
    title: "Ravine Restoration Project",
    organization: "Toronto Nature Conservancy",
    description: "Help restore Toronto's ravine ecosystems by planting native species and removing invasive plants. Training provided.",
    date: "Saturday, Jan 31, 2026",
    dateISO: "2026-01-31",
    time: "8:00 AM - 12:00 PM",
    location: "Don Valley",
    hours: 4,
    spotsLeft: 15,
    totalSpots: 25,
    category: "Environment",
    commitment: "Weekly",
    skills: ["Physical Work", "Nature Knowledge"],
    featured: true,
    image: "/event-park-cleanup.png",
  },
  {
    id: 14,
    title: "Beach Cleanup Initiative",
    organization: "Great Lakes Conservation",
    description: "Weekly beach cleanup at Toronto's waterfront. Help protect marine life and keep our beaches beautiful.",
    date: "Sunday, Feb 1, 2026",
    dateISO: "2026-02-01",
    time: "10:00 AM - 1:00 PM",
    location: "Woodbine Beach",
    hours: 3,
    spotsLeft: 20,
    totalSpots: 40,
    category: "Environment",
    commitment: "Weekly",
    skills: ["Outdoor Work"],
    featured: false,
    image: "/event-volunteer-fair.png",
  },
  {
    id: 15,
    title: "Tree Planting Campaign",
    organization: "LEAF Toronto",
    description: "Plant trees across the city to increase urban canopy coverage. No experience needed.",
    date: "Feb 14, 2026",
    dateISO: "2026-02-14",
    time: "9:00 AM - 3:00 PM",
    location: "Various Parks",
    hours: 6,
    spotsLeft: 50,
    totalSpots: 100,
    category: "Environment",
    commitment: "One-time",
    skills: ["Physical Work", "Teamwork"],
    featured: false,
    image: "/event-park-cleanup.png",
  },
  {
    id: 16,
    title: "Urban Wildlife Monitoring",
    organization: "Toronto Zoo Conservation",
    description: "Help track and document urban wildlife populations. Contribute to citizen science.",
    date: "Flexible",
    dateISO: "2025-03-01",
    time: "Various times",
    location: "GTA Region",
    hours: 2,
    spotsLeft: 8,
    totalSpots: 15,
    category: "Environment",
    commitment: "Monthly",
    skills: ["Observation", "Data Entry"],
    featured: false,
    image: "/event-volunteer-fair.png",
  },
  {
    id: 17,
    title: "Pollinator Garden Workshop",
    organization: "David Suzuki Foundation",
    description: "Create pollinator-friendly gardens in public spaces. Learn about native plants.",
    date: "Mar 8, 2025",
    dateISO: "2025-03-08",
    time: "10:00 AM - 2:00 PM",
    location: "High Park",
    hours: 4,
    spotsLeft: 6,
    totalSpots: 20,
    category: "Environment",
    commitment: "One-time",
    skills: ["Gardening", "Nature Knowledge"],
    featured: false,
    image: "/event-park-cleanup.png",
  },
  {
    id: 18,
    title: "River Cleanup & Kayak Tour",
    organization: "Paddle Toronto",
    description: "Combine environmental stewardship with adventure! Clean up the Humber River while kayaking.",
    date: "May 10, 2025",
    dateISO: "2025-05-10",
    time: "8:00 AM - 12:00 PM",
    location: "Humber River",
    hours: 4,
    spotsLeft: 10,
    totalSpots: 20,
    category: "Environment",
    commitment: "One-time",
    skills: ["Swimming", "Physical Fitness"],
    featured: true,
    image: "/event-volunteer-fair.png",
  },
  // COMMUNITY OUTREACH
  {
    id: 2,
    title: "Food Bank Sorting & Distribution",
    organization: "Daily Bread Food Bank",
    description: "Help sort and distribute food donations to families in need. Tasks include organizing donations and packing food hampers.",
    date: "Saturday, Jan 24, 2026",
    dateISO: "2026-01-24",
    time: "10:00 AM - 2:00 PM",
    location: "191 New Toronto St",
    hours: 4,
    spotsLeft: 8,
    totalSpots: 20,
    category: "Community Outreach",
    commitment: "Weekly",
    skills: ["Organization", "Physical Work"],
    featured: true,
    image: "/event-volunteer-fair.png",
  },
  {
    id: 10,
    title: "Habitat for Humanity Build Day",
    organization: "Habitat for Humanity GTA",
    description: "Help build affordable housing for families in need. No construction experience necessary.",
    date: "Feb 7, 2026",
    dateISO: "2026-02-07",
    time: "8:30 AM - 3:30 PM",
    location: "Various GTA",
    hours: 7,
    spotsLeft: 25,
    totalSpots: 40,
    category: "Community Outreach",
    commitment: "One-time",
    skills: ["Physical Work", "Teamwork"],
    featured: true,
    image: "/event-volunteer-fair.png",
  },
  // HEALTHCARE
  {
    id: 3,
    title: "Hospital Patient Companion",
    organization: "Toronto General Hospital",
    description: "Provide friendly companionship to hospital patients. Duties include chatting, reading, and offering emotional support.",
    date: "Flexible Schedule",
    dateISO: "2025-02-15",
    time: "Various shifts",
    location: "200 Elizabeth St",
    hours: 4,
    spotsLeft: 5,
    totalSpots: 15,
    category: "Healthcare",
    commitment: "Weekly",
    skills: ["Communication", "Empathy", "Patience"],
    featured: false,
    image: "/event-hospital-volunteer.png",
  },
  // ANIMAL WELFARE
  {
    id: 4,
    title: "Animal Shelter Dog Walker",
    organization: "Toronto Humane Society",
    description: "Walk and socialize shelter dogs to help keep them healthy and happy while they wait for their forever homes.",
    date: "Daily Opportunities",
    dateISO: "2025-02-10",
    time: "8:00 AM - 6:00 PM",
    location: "11 River St",
    hours: 2,
    spotsLeft: 20,
    totalSpots: 50,
    category: "Animal Welfare",
    commitment: "Weekly",
    skills: ["Animal Handling", "Physical Fitness"],
    featured: true,
    image: "/event-animal-shelter.png",
  },
  // EDUCATION
  {
    id: 5,
    title: "Youth Tutoring Program",
    organization: "Big Brothers Big Sisters",
    description: "Tutor elementary and high school students in various subjects including math, science, and English.",
    date: "Weekday Evenings",
    dateISO: "2025-02-05",
    time: "4:00 PM - 7:00 PM",
    location: "3005 Danforth Ave",
    hours: 3,
    spotsLeft: 6,
    totalSpots: 12,
    category: "Education",
    commitment: "Weekly",
    skills: ["Teaching", "Patience", "Subject Knowledge"],
    featured: false,
    image: "/event-youth-mentorship.png",
  },
  {
    id: 11,
    title: "ESL Conversation Partner",
    organization: "Toronto Public Library",
    description: "Practice English conversation with newcomers to Canada. Help them build confidence and language skills.",
    date: "Twice Weekly",
    dateISO: "2025-02-03",
    time: "6:00 PM - 7:30 PM",
    location: "789 Yonge St",
    hours: 1.5,
    spotsLeft: 8,
    totalSpots: 15,
    category: "Education",
    commitment: "Weekly",
    skills: ["Communication", "Patience"],
    featured: false,
    image: "/event-youth-mentorship.png",
  },
  // ARTS & CULTURE
  {
    id: 6,
    title: "Community Mural Project",
    organization: "Arts for All Toronto",
    description: "Help create a vibrant community mural. No art experience necessary - just enthusiasm!",
    date: "Mar 15-16, 2025",
    dateISO: "2025-03-15",
    time: "10:00 AM - 4:00 PM",
    location: "1550 St Clair Ave W",
    hours: 6,
    spotsLeft: 15,
    totalSpots: 25,
    category: "Arts & Culture",
    commitment: "One-time",
    skills: ["Creativity", "Teamwork"],
    featured: false,
    image: "/event-art-workshop.png",
  },
  {
    id: 12,
    title: "Theatre Production Assistant",
    organization: "Young People's Theatre",
    description: "Support live theatre productions. Roles include ushering, concessions, and backstage support.",
    date: "Show Season",
    dateISO: "2025-03-01",
    time: "Various times",
    location: "165 Front St E",
    hours: 4,
    spotsLeft: 12,
    totalSpots: 20,
    category: "Arts & Culture",
    commitment: "Ongoing",
    skills: ["Customer Service", "Flexibility"],
    featured: false,
    image: "/event-art-workshop.png",
  },
  // SENIOR CARE
  {
    id: 7,
    title: "Senior Tech Support",
    organization: "Reena Foundation",
    description: "Help seniors learn to use smartphones, tablets, and computers. Teach them to video call and use social media.",
    date: "Every Wednesday",
    dateISO: "2025-02-12",
    time: "2:00 PM - 4:00 PM",
    location: "927 Clark Ave W",
    hours: 2,
    spotsLeft: 4,
    totalSpots: 8,
    category: "Senior Care",
    commitment: "Weekly",
    skills: ["Technology", "Patience"],
    featured: false,
    image: "/event-youth-mentorship.png",
  },
  // YOUTH PROGRAMS
  {
    id: 9,
    title: "Youth Coding Workshop Mentor",
    organization: "Ladies Learning Code",
    description: "Mentor young people learning to code at weekend workshops. Technical background required.",
    date: "Monthly Workshops",
    dateISO: "2025-02-22",
    time: "10:00 AM - 3:00 PM",
    location: "483 Queen St W",
    hours: 5,
    spotsLeft: 3,
    totalSpots: 10,
    category: "Youth Programs",
    commitment: "Monthly",
    skills: ["Programming", "Teaching"],
    featured: true,
    image: "/event-youth-mentorship.png",
  },
]

const allCategories = Object.keys(categoryColors)
const commitmentTypes = ["One-time", "Weekly", "Monthly", "Ongoing"]
const sortOptions = [
  { value: "date", label: "Date (Soonest)" },
  { value: "spots", label: "Spots Available" },
  { value: "hours", label: "Hours (Low to High)" },
  { value: "featured", label: "Featured First" },
]

export default function OpportunitiesPage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof sampleOpportunities[0] | null>(null)
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>([])
  const [selectedHours, setSelectedHours] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)

  // Timer ref for resetting on manual navigation
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Featured opportunities for hero carousel
  const featuredOpportunities = useMemo(() =>
    sampleOpportunities.filter(o => o.featured),
    [])

  // Reset and start timer function
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % featuredOpportunities.length)
    }, 5000)
  }, [featuredOpportunities.length])

  // Auto-scroll hero every 5 seconds
  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [resetTimer])

  // Navigate to specific slide and reset timer
  const goToSlide = (index: number) => {
    setCurrentHeroIndex(index)
    resetTimer()
  }

  // Navigate prev/next and reset timer
  const goToPrev = () => {
    setCurrentHeroIndex(prev => prev === 0 ? featuredOpportunities.length - 1 : prev - 1)
    resetTimer()
  }

  const goToNext = () => {
    setCurrentHeroIndex(prev => (prev + 1) % featuredOpportunities.length)
    resetTimer()
  }

  const currentHero = featuredOpportunities[currentHeroIndex]
  const heroColor = categoryColors[currentHero?.category] || categoryColors["Environment"]

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...sampleOpportunities]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(query) ||
        opp.organization.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(opp => selectedCategories.includes(opp.category))
    }

    // Commitment filter
    if (selectedCommitments.length > 0) {
      filtered = filtered.filter(opp => selectedCommitments.includes(opp.commitment))
    }

    // Hours filter
    if (selectedHours.length > 0) {
      filtered = filtered.filter(opp => {
        const hours = opp.hours
        return selectedHours.some(range => {
          if (range === '1-2 hours') return hours >= 1 && hours <= 2
          if (range === '3-4 hours') return hours >= 3 && hours <= 4
          if (range === '5-6 hours') return hours >= 5 && hours <= 6
          if (range === '7+ hours') return hours >= 7
          return false
        })
      })
    }

    // Date filter
    if (selectedDates.length > 0) {
      const now = new Date()
      const endOfWeek = new Date(now)
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)

      filtered = filtered.filter(opp => {
        const oppDate = new Date(opp.dateISO)
        return selectedDates.some(range => {
          if (range === 'This Week') return oppDate >= now && oppDate <= endOfWeek
          if (range === 'This Month') return oppDate >= now && oppDate <= endOfMonth
          if (range === 'Next Month') return oppDate > endOfMonth && oppDate <= endOfNextMonth
          if (range === 'Flexible') return true // Show all for flexible
          return false
        })
      })
    }

    // Sort
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
        break
      case "spots":
        filtered.sort((a, b) => b.spotsLeft - a.spotsLeft)
        break
      case "hours":
        filtered.sort((a, b) => a.hours - b.hours)
        break
      case "featured":
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return filtered
  }, [searchQuery, selectedCategories, selectedCommitments, selectedHours, selectedDates, sortBy])

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: typeof sampleOpportunities } = {}
    filteredOpportunities.forEach((opp) => {
      if (!groups[opp.category]) {
        groups[opp.category] = []
      }
      groups[opp.category].push(opp)
    })
    return groups
  }, [filteredOpportunities])

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Toggle commitment filter
  const toggleCommitment = (commitment: string) => {
    setSelectedCommitments(prev =>
      prev.includes(commitment)
        ? prev.filter(c => c !== commitment)
        : [...prev, commitment]
    )
  }

  // Toggle hours filter
  const toggleHours = (hours: string) => {
    setSelectedHours(prev =>
      prev.includes(hours)
        ? prev.filter(h => h !== hours)
        : [...prev, hours]
    )
  }

  // Toggle date filter
  const toggleDates = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedCommitments([])
    setSelectedHours([])
    setSelectedDates([])
    setSearchQuery("")
    setSortBy("featured")
  }

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedCommitments.length > 0 || selectedHours.length > 0 || selectedDates.length > 0 || searchQuery

  // Opportunity Card - memoized to prevent re-renders from parent state changes
  const OpportunityCard = React.memo(({ opportunity }: { opportunity: typeof sampleOpportunities[0] }) => {
    const [isHovered, setIsHovered] = useState(false)
    const categoryColor = categoryColors[opportunity.category] || categoryColors["Environment"]
    const commitmentColor = commitmentColors[opportunity.commitment]

    return (
      <div
        className="relative flex-shrink-0 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setSelectedOpportunity(opportunity)}
        style={{
          width: isHovered ? '320px' : '200px',
          transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div
          className="relative h-64 bg-white rounded-xl overflow-hidden border border-slate-200"
          style={{
            transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
            boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          {/* Background Image with subtle overlay */}
          <div className="absolute inset-0">
            <Image
              src={opportunity.image}
              alt={opportunity.title}
              fill
              className="object-cover"
            />
            {/* Very subtle color tint - much more transparent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor.gradient}`} />
            {/* Strong dark gradient at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          {/* Featured badge */}
          {opportunity.featured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}

          {/* Spots indicator */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 text-xs font-medium shadow-sm">
            {opportunity.spotsLeft} spots left
          </div>

          {/* Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h3 className="font-bold text-white text-base leading-tight mb-1 drop-shadow-lg">
              {opportunity.title}
            </h3>
            <p className="text-white/90 text-sm mb-2 drop-shadow">{opportunity.organization}</p>

            {/* Quick info */}
            <div className="flex items-center gap-3 text-xs text-white/90 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {opportunity.hours}h
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {opportunity.location.split(',')[0]}
              </span>
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm`}>
                {opportunity.commitment}
              </span>
            </div>

            {/* Expanded content */}
            <div
              className="overflow-hidden"
              style={{
                maxHeight: isHovered ? '100px' : '0',
                opacity: isHovered ? 1 : 0,
                marginTop: isHovered ? '12px' : '0',
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <p className="text-white/90 text-xs leading-relaxed line-clamp-2 mb-3 drop-shadow">
                {opportunity.description}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 bg-white text-slate-800 hover:bg-slate-100 rounded-full text-xs font-bold gap-1"
                  onClick={(e) => { e.stopPropagation(); setSelectedOpportunity(opportunity); }}
                >
                  <Zap className="w-3 h-3" />
                  Apply Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full border-2 border-white/50 bg-transparent hover:bg-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  })

  OpportunityCard.displayName = 'OpportunityCard'

  // Scrollable row component
  const OpportunityRow = ({ title, opportunities, titleColor = "text-slate-800" }: { title: string, opportunities: typeof sampleOpportunities, titleColor?: string }) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -400 : 400,
          behavior: 'smooth'
        })
      }
    }

    if (opportunities.length === 0) return null

    return (
      <div className="mb-10 group/row">
        <h2 className={`text-xl font-bold ${titleColor} mb-4 px-2`}>{title}</h2>

        <div className="relative">
          {/* Left scroll */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-sky-50 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </div>
          </button>

          {/* Cards container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>

          {/* Right scroll */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-sky-50 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-sky-50">
      <Navigation />

      <main className="flex-1 pt-16 md:pt-20">
        {/* Hero Section - Featured Opportunity with fading image */}
        <div className="relative bg-gradient-to-r from-sky-100 via-sky-50 to-transparent overflow-hidden min-h-[430px]">
          {/* Full-width background image with left fade */}
          <div className="absolute inset-0">
            {featuredOpportunities.map((opp, idx) => (
              <div
                key={opp.id}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: idx === currentHeroIndex ? 1 : 0 }}
              >
                <Image
                  src={opp.image}
                  alt={opp.title}
                  fill
                  className="object-cover object-right"
                  priority={idx === 0}
                />
              </div>
            ))}
            {/* Gradient fade from left - matching reference image style */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-100 via-sky-100/95 via-40% to-transparent" />
          </div>

          {/* Left Arrow - Absolutely positioned on left edge */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          {/* Right Arrow - Absolutely positioned on right edge */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-xl">
              {/* Spotlight label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sky-600 text-sm font-medium bg-sky-100/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  #{currentHeroIndex + 1} Spotlight
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${categoryColors[currentHero?.category]?.bg} ${categoryColors[currentHero?.category]?.text}`}>
                  {currentHero?.category}
                </span>
              </div>

              {/* Title with animation */}
              <h1
                key={currentHero?.id}
                className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight animate-fade-in"
              >
                {currentHero?.title}
              </h1>

              {/* Organization */}
              <p className="text-lg text-slate-600 mb-5">
                by <span className="font-semibold text-sky-700">{currentHero?.organization}</span>
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-5 text-slate-600 text-sm">
                <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 text-sky-600" />
                  {currentHero?.hours} hours
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  {currentHero?.date}
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  {currentHero?.location}
                </span>
              </div>

              {/* Description - hidden on smaller screens */}
              <p className="text-slate-600 mb-6 line-clamp-2 text-base leading-relaxed">
                {currentHero?.description}
              </p>

              {/* Action buttons and spots remaining */}
              <div className="flex items-center gap-4 mb-2">
                <Button
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-5 rounded-full text-sm font-semibold gap-2 shadow-lg shadow-sky-200"
                  onClick={() => setSelectedOpportunity(currentHero)}
                >
                  <Zap className="w-4 h-4" />
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-white/80 px-5 py-5 rounded-full text-sm gap-2 bg-white/50 backdrop-blur-sm"
                  onClick={() => setSelectedOpportunity(currentHero)}
                >
                  <Info className="w-4 h-4" />
                  Details
                </Button>
                <span className="text-sm font-semibold text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  {currentHero?.spotsLeft} spots remaining
                </span>
              </div>
            </div>
          </div>

          {/* Carousel dots - Centered at bottom of entire hero card */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredOpportunities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentHeroIndex
                  ? 'w-8 bg-sky-600'
                  : 'w-2 bg-slate-400 hover:bg-slate-500'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Filter/Sort Bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200 rounded-full"
                />
              </div>

              {/* Filter toggle button */}
              <Button
                variant={showFilters ? "default" : "outline"}
                className={`rounded-full gap-2 ${showFilters ? 'bg-sky-600 text-white' : 'border-slate-300'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </Button>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 gap-1"
                  onClick={clearFilters}
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
              )}

              {/* Results count */}
              <span className="text-sm text-slate-500 ml-auto">
                {filteredOpportunities.length} opportunities
              </span>
            </div>

            {/* Expanded filter options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category filters */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedCategories.includes(category)
                          ? `${categoryColors[category].bg} ${categoryColors[category].text} ring-2 ring-offset-1 ring-sky-400`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commitment filters */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Commitment</h4>
                  <div className="flex flex-wrap gap-2">
                    {commitmentTypes.map(commitment => (
                      <button
                        key={commitment}
                        onClick={() => toggleCommitment(commitment)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedCommitments.includes(commitment)
                          ? `${commitmentColors[commitment].bg} ${commitmentColors[commitment].text} ring-2 ring-offset-1 ring-sky-400`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {commitment}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Hours</h4>
                  <div className="flex flex-wrap gap-2">
                    {['1-2 hours', '3-4 hours', '5-6 hours', '7+ hours'].map(hours => (
                      <button
                        key={hours}
                        onClick={() => toggleHours(hours)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedHours.includes(hours)
                          ? 'bg-sky-100 text-sky-700 ring-2 ring-offset-1 ring-sky-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {hours}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Date</h4>
                  <div className="flex flex-wrap gap-2">
                    {['This Week', 'This Month', 'Next Month', 'Flexible'].map(date => (
                      <button
                        key={date}
                        onClick={() => toggleDates(date)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedDates.includes(date)
                          ? 'bg-sky-100 text-sky-700 ring-2 ring-offset-1 ring-sky-400'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Show filtered results or regular rows */}
          {hasActiveFilters ? (
            // Filtered results view
            <OpportunityRow
              title={`Search Results (${filteredOpportunities.length})`}
              opportunities={filteredOpportunities}
            />
          ) : (
            <>
              {/* Experiences for You */}
              <OpportunityRow
                title="Experiences for You"
                opportunities={sampleOpportunities.slice(0, 8)}
              />

              {/* Trending Now */}
              <OpportunityRow
                title="Trending Now"
                opportunities={featuredOpportunities}
              />

              {/* Category Rows */}
              {Object.entries(groupedByCategory).map(([category, opportunities]) => (
                <OpportunityRow
                  key={category}
                  title={category}
                  opportunities={opportunities}
                />
              ))}
            </>
          )}
        </div>
      </main>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-64">
              <Image
                src={selectedOpportunity.image}
                alt={selectedOpportunity.title}
                fill
                className="object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${categoryColors[selectedOpportunity.category]?.heroGradient || 'from-slate-900/80 to-transparent'}`} />
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Featured badge */}
              {selectedOpportunity.featured && (
                <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-sm font-medium shadow-lg">
                  <Star className="w-4 h-4 fill-current" />
                  Featured
                </div>
              )}

              {/* Title overlay */}
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{selectedOpportunity.title}</h2>
                <p className="text-white/90 drop-shadow">{selectedOpportunity.organization}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`text-sm px-3 py-1 rounded-full ${categoryColors[selectedOpportunity.category]?.bg} ${categoryColors[selectedOpportunity.category]?.text}`}>
                  {selectedOpportunity.category}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${commitmentColors[selectedOpportunity.commitment]?.bg} ${commitmentColors[selectedOpportunity.commitment]?.text}`}>
                  {selectedOpportunity.commitment}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-sky-100 text-sky-700">
                  {selectedOpportunity.hours} hours
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                  <p className="text-2xl font-bold text-sky-700">{selectedOpportunity.spotsLeft}</p>
                  <p className="text-sm text-slate-600">Spots Remaining</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-slate-700">{selectedOpportunity.totalSpots}</p>
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
                    <p className="font-medium text-slate-800">{selectedOpportunity.date}</p>
                    <p className="text-sm">{selectedOpportunity.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-rose-600" />
                  </div>
                  <span>{selectedOpportunity.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 mb-2">Helpful Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOpportunity.skills.map((skill) => (
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
                  {selectedOpportunity.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-full py-6 text-lg shadow-lg shadow-sky-200">
                  <Zap className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
                <Button variant="outline" className="px-6 rounded-full py-6 border-slate-300 text-slate-700 hover:bg-slate-100">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
