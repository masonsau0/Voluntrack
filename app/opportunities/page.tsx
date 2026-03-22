"use client"

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
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
  CheckCircle2,
  Flag,
} from "lucide-react"
import { CATEGORIES, INTERESTS } from "@/lib/preferences"
import { getAllOpportunities, type Opportunity } from "@/lib/firebase/opportunities"
import { getStudentProfile } from "@/lib/firebase/student-profiles"
import {
  applyToOpportunity,
  toggleSaveOpportunity,
  getUserApplications,
  getUserSaved
} from "@/lib/firebase/dashboard"
import { toast } from "sonner"
import { categoryColors, commitmentColors, defaultCategoryColor } from "@/lib/ui-config"
import { AddExternalOpportunityModal } from "@/components/add-external-opportunity-modal"
import { ReportOpportunityModal } from "@/components/report-opportunity-modal"
import { getHiddenOpportunityIds } from "@/lib/firebase/hidden-opportunities"
import { OpportunityCard } from "@/components/opportunity-card"

const allCategories = [...CATEGORIES]
const commitmentTypes = ["One-time", "Weekly", "Monthly"]
const sortOptions = [
  { value: "date", label: "Date (Soonest)" },
  { value: "spots", label: "Spots Available" },
  { value: "hours", label: "Hours (Low to High)" },
  { value: "featured", label: "Featured First" },
]

// Scoring weights for "For You" algorithm (max 100 pts total)
const SCORE_WEIGHTS = { interest: 40, format: 30, availability: 20, urgency: 10 } as const

function scoreOpportunity(
  opp: Opportunity,
  interests: string[],
  volunteerFormat: string,
  availability: string
): number {
  let score = 0

  // Factor 1: Category matches student's interests (+40)
  const interestLabels = interests.map((id: string) => {
    const match = INTERESTS.find(i => (i as any).id === id)
    return match ? match.label : ""
  }).filter((label: string) => label !== "")
  if ((interestLabels as string[]).includes(opp.category)) score += SCORE_WEIGHTS.interest

  // Factor 2: Format preference — infer remote/in-person from location string (+0–30)
  const locationLower = opp.location.toLowerCase()
  const isRemote = locationLower.includes("remote") || locationLower.includes("virtual") || locationLower.includes("online")
  if (volunteerFormat === "no-preference") {
    score += Math.round(SCORE_WEIGHTS.format * 0.5)          // +15 neutral
  } else if (volunteerFormat === "hybrid") {
    score += Math.round(SCORE_WEIGHTS.format * 0.67)         // +20 partial
  } else if ((volunteerFormat === "remote" && isRemote) || (volunteerFormat === "in-person" && !isRemote)) {
    score += SCORE_WEIGHTS.format                            // +30 exact match
  }

  // Factor 3: Availability — day-of-week vs. weekends/weekdays preference (+0–20)
  const day = new Date(opp.dateISO + "T12:00:00").getDay()
  const isWeekend = day === 0 || day === 6
  if (availability === "any-time") {
    score += Math.round(SCORE_WEIGHTS.availability * 0.5)    // +10 neutral
  } else if ((availability === "weekends" && isWeekend) || (availability === "weekdays" && !isWeekend)) {
    score += SCORE_WEIGHTS.availability                      // +20 exact match
  }

  // Factor 4: Urgency / scarcity bonus (+0–10)
  if (opp.spotsLeft > 0 && opp.spotsLeft <= 5) score += SCORE_WEIGHTS.urgency
  else if (opp.spotsLeft <= 10) score += Math.round(SCORE_WEIGHTS.urgency * 0.5)

  return score
}

// export default function OpportunitiesPage() {
export default function OpportunitiesPage() {
  const { userProfile } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [studentInterests, setStudentInterests] = useState<string[]>([])
  const [studentVolunteerFormat, setStudentVolunteerFormat] = useState<string>("no-preference")
  const [studentAvailability, setStudentAvailability] = useState<string>("any-time")
  const [forYouActive, setForYouActive] = useState(false)
  const [reportTarget, setReportTarget] = useState<Opportunity | null>(null)
  const [applyTarget, setApplyTarget] = useState<Opportunity | null>(null)
  const [applyMessage, setApplyMessage] = useState("")
  const [applyChecks, setApplyChecks] = useState({ hadSimilarWork: false, hadWorkedWithOrg: false, hadFieldExperience: false })

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")


  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>([])
  const [selectedHours, setSelectedHours] = useState<string[]>([])
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined)
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showExternalOppModal, setShowExternalOppModal] = useState(false)

  // Fetch all opportunities
  const fetchAllOpportunities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const allOpp = await getAllOpportunities()
      setOpportunities(allOpp)
    } catch (err) {
      console.error(err)
      setError("Failed to load opportunities. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchAllOpportunities()

    const handleScroll = () => {
      setScrolled(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fetchAllOpportunities])

  const { user } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return
      try {
        const [apps, saved, studentProfile, hidden] = await Promise.all([
          getUserApplications(user.uid),
          getUserSaved(user.uid),
          getStudentProfile(user.uid),
          getHiddenOpportunityIds(user.uid),
        ])
        setAppliedIds(new Set(apps.map(a => a.opportunityId)))
        setSavedIds(new Set(saved.map(s => s.opportunityId)))
        setHiddenIds(hidden)
        setStudentInterests(studentProfile?.interests ?? [])
        setStudentVolunteerFormat(studentProfile?.volunteerFormat ?? "no-preference")
        setStudentAvailability(studentProfile?.availability ?? "any-time")
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }
    fetchUserData()
  }, [user?.uid])

  const handleApply = async (
    opportunity: Opportunity,
    applicationData?: { message?: string; hadSimilarWork?: boolean; hadWorkedWithOrg?: boolean; hadFieldExperience?: boolean }
  ) => {
    if (!user?.uid) {
      toast.error("Please sign in to apply.")
      return
    }
    if (appliedIds.has(opportunity.id)) return

    setActionLoading(opportunity.id)
    try {
      await applyToOpportunity(user.uid, opportunity, applicationData)
      setAppliedIds(prev => new Set([...Array.from(prev), opportunity.id]))
      setApplyTarget(null)
      toast.success("Application submitted successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to apply.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (opportunity: Opportunity) => {
    if (!user?.uid) {
      toast.error("Please sign in to save opportunities.")
      return
    }

    setActionLoading(`save-${opportunity.id}`)
    try {
      const isSaved = await toggleSaveOpportunity(user.uid, opportunity)
      setSavedIds(prev => {
        const next = new Set(prev)
        if (isSaved) next.add(opportunity.id)
        else next.delete(opportunity.id)
        return next
      })
      toast.success(isSaved ? "Saved to your list" : "Removed from your list")
    } catch (err: any) {
      toast.error(err.message || "Failed to update saved list.")
    } finally {
      setActionLoading(null)
    }
  }

  // Timer ref for resetting on manual navigation
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Featured opportunities for hero carousel
  const featuredOpportunities = useMemo(() => {
    const featured = opportunities.filter(o => o.featured)
    // Fallback if no featured items loaded yet
    return featured.length > 0 ? featured : opportunities.slice(0, 3)
  }, [opportunities])


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


  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities.filter(o => !hiddenIds.has(o.id))


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

    // Hours filter ("Up to X hours" or "8h+")
    if (selectedHours.length > 0) {
      filtered = filtered.filter(opp => {
        return selectedHours.some(h => {
          if (h === '8+') return opp.hours >= 8;
          const maxHours = parseInt(h, 10);
          return opp.hours <= maxHours;
        });
      });
    }

    // Date filter (calendar date range)
    if (selectedDateRange?.from) {
      const rangeStart = new Date(selectedDateRange.from)
      rangeStart.setHours(0, 0, 0, 0)
      const rangeEnd = selectedDateRange.to
        ? new Date(selectedDateRange.to)
        : new Date(selectedDateRange.from)
      rangeEnd.setHours(23, 59, 59, 999)

      filtered = filtered.filter(opp => {
        const oppDate = new Date(opp.dateISO)
        oppDate.setHours(12, 0, 0, 0)
        return oppDate >= rangeStart && oppDate <= rangeEnd
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

    // When hours filter is active and not already sorting by hours, sort by hours descending
    // so opportunities closest to the selected max appear first
    if (selectedHours.length > 0 && sortBy !== "hours") {
      filtered.sort((a, b) => b.hours - a.hours)
    }

    return filtered
  }, [opportunities, hiddenIds, searchQuery, selectedCategories, selectedCommitments, selectedHours, selectedDateRange, sortBy])

  // Personalized "Experiences for You" based on student profile interests
  const personalizedOpportunities = useMemo(() => {
    if (studentInterests.length === 0) return []

    // Map interest IDs to labels used in categories
    const interestLabels = studentInterests.map((id: string) => {
      const match = INTERESTS.find(i => (i as any).id === id)
      return match ? match.label : ""
    }).filter((label: string) => label !== "")

    return opportunities
      .filter(opp => !hiddenIds.has(opp.id))
      .filter(opp => (interestLabels as string[]).includes(opp.category))
  }, [opportunities, hiddenIds, studentInterests])

  // Scored + ranked list for "For You" tab
  const scoredForYou = useMemo(() => {
    if (studentInterests.length === 0) return []

    let list = opportunities.filter(o => !hiddenIds.has(o.id))

    if (selectedCommitments.length > 0) {
      list = list.filter(opp => selectedCommitments.includes(opp.commitment))
    }
    if (selectedHours.length > 0) {
      list = list.filter(opp =>
        selectedHours.some(h => h === "8+" ? opp.hours >= 8 : opp.hours <= parseInt(h, 10))
      )
    }
    if (selectedDateRange?.from) {
      const rangeStart = new Date(selectedDateRange.from)
      rangeStart.setHours(0, 0, 0, 0)
      const rangeEnd = selectedDateRange.to ? new Date(selectedDateRange.to) : new Date(selectedDateRange.from)
      rangeEnd.setHours(23, 59, 59, 999)
      list = list.filter(opp => {
        const d = new Date(opp.dateISO)
        d.setHours(12, 0, 0, 0)
        return d >= rangeStart && d <= rangeEnd
      })
    }

    return list
      .map(opp => ({ opp, score: scoreOpportunity(opp, studentInterests, studentVolunteerFormat, studentAvailability) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [opportunities, hiddenIds, studentInterests, studentVolunteerFormat, studentAvailability, selectedCommitments, selectedHours, selectedDateRange])

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: { [key: string]: Opportunity[] } = {}

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

  // Toggle hours filter (single select for "up to X hours" - click same to clear)
  const toggleHours = (hours: string) => {
    setSelectedHours(prev =>
      prev.includes(hours)
        ? prev.filter(h => h !== hours)
        : [hours]
    )
  }


  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedCommitments([])
    setSelectedHours([])
    setSelectedDateRange(undefined)
    setSearchQuery("")
    setSortBy("featured")
  }

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedCommitments.length > 0 || selectedHours.length > 0 || !!selectedDateRange?.from || searchQuery


  // Scrollable row component
  const OpportunityRow = ({ title, opportunities, titleColor = "text-slate-800" }: { title: string, opportunities: Opportunity[], titleColor?: string }) => {

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
            className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-slate-950 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Cards container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} onClick={setSelectedOpportunity} />
            ))}
          </div>

          {/* Right scroll */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-slate-950 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation forceWhite={scrolled} />

      <main className="flex-1">
        {/* Hero Section - Featured Opportunity with fading image */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/95 to-transparent overflow-hidden" style={{ minHeight: '70vh' }}>
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
            {/* Gradient fade from left - dark theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 via-40% to-slate-900/30" />
          </div>

          {/* Left Arrow - Absolutely positioned on left edge */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Right Arrow - Absolutely positioned on right edge */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="relative w-full px-6 sm:px-10 lg:px-16 pt-24 pb-12 flex flex-col justify-end" style={{ minHeight: '60vh' }}>
            <div className="max-w-xl">
              {/* Spotlight label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-violet-300 text-sm font-medium bg-violet-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-violet-400/30">
                  #{currentHeroIndex + 1} Spotlight
                </span>
                <span className={`text-sm px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm ${categoryColors[currentHero?.category || ""]?.text || defaultCategoryColor.text}`}>
                  {currentHero?.category}
                </span>
              </div>

              {/* Title with animation */}
              <h1
                key={currentHero?.id}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in-up tracking-tight"
               
              >
                {currentHero?.title}
              </h1>

              {/* Organization */}
              <p className="text-lg text-slate-300 mb-5">
                by <span className="font-semibold text-white">{currentHero?.organization}</span>
              </p>

              {/* Description */}
              <p className="text-slate-400 mb-8 line-clamp-3 text-base leading-relaxed max-w-lg">
                {currentHero?.description}
              </p>

              {/* Action buttons - just 2, matching reference */}
              <div className="flex items-center gap-3 mb-2">
                <Button
                  className="bg-white hover:bg-slate-200 text-black px-8 py-5 rounded-md text-sm font-bold gap-2 shadow-lg transition-all"
                  onClick={() => setSelectedOpportunity(currentHero)}
                >
                  <Zap className="w-4 h-4" />
                  Apply Now
                </Button>
                <Button
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-8 py-5 rounded-md text-sm font-semibold gap-2 transition-all"
                  onClick={() => setSelectedOpportunity(currentHero)}
                >
                  <Info className="w-4 h-4" />
                  More Information
                </Button>
              </div>
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredOpportunities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentHeroIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="w-full px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col">
              {/* Top Row: Categories + Search (Right Aligned) */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                  {/* For You tab — only when logged in with interests */}
                  {studentInterests.length > 0 && (
                    <button
                      onClick={() => { setForYouActive(true); setSelectedCategories([]); setSearchQuery(""); }}
                      className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        forYouActive ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      For You
                      {forYouActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-rose-600 z-10" />
                      )}
                    </button>
                  )}
                  {/* All tab */}
                  <button
                    onClick={() => { setForYouActive(false); setSelectedCategories([]); setSearchQuery(''); setSelectedCommitments([]); setSelectedHours([]); setSelectedDateRange(undefined); }}
                    className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200 ${
                      !forYouActive && selectedCategories.length === 0 && !searchQuery
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    All
                    {!forYouActive && selectedCategories.length === 0 && !searchQuery && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-rose-600 z-10" />
                    )}
                  </button>
                  {allCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => { setForYouActive(false); setSelectedCategories([category]); }}
                      className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200 ${
                        !forYouActive && selectedCategories.length === 1 && selectedCategories[0] === category
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                      {!forYouActive && selectedCategories.length === 1 && selectedCategories[0] === category && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-rose-600 z-10" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Search - Aligned with categories */}
                <div
                  className="relative transition-all duration-300 ease-in-out"
                  style={{ width: searchFocused ? '340px' : '200px' }}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="pl-9 bg-gray-100 border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 h-10 text-sm focus:bg-white focus:border-gray-400 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Bottom Row: Flattened Filter Options + Action Buttons */}
              <div className="py-3 flex flex-wrap items-center gap-x-8 gap-y-3">
                {/* Commitment filters */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Commitment</span>
                  <div className="flex gap-1.5">
                    {commitmentTypes.map(commitment => (
                      <button
                        key={commitment}
                        onClick={() => toggleCommitment(commitment)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${selectedCommitments.includes(commitment)
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-300 hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        {commitment}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours filter */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Hours</span>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 max-w-[400px]">
                    <button
                      onClick={() => setSelectedHours([])}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 ${selectedHours.length === 0
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-300 hover:text-gray-900 hover:shadow-sm'
                      }`}
                    >
                      Any
                    </button>
                    {['1', '2', '4', '8', '8+'].map(hours => (
                      <button
                        key={hours}
                        onClick={() => toggleHours(hours)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex-shrink-0 ${selectedHours.includes(hours)
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-300 hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        {hours === '8+' ? '8h+' : `${hours}h`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range picker - integrated next to hours */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`rounded-full h-8 text-xs gap-2 border-gray-200 transition-all duration-200 ${selectedDateRange?.from ? 'border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-200 hover:text-rose-800 hover:border-rose-400' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-300'}`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {selectedDateRange?.from ? (
                          selectedDateRange.to ? (
                            <>
                              {format(selectedDateRange.from, "LLL dd")} - {format(selectedDateRange.to, "LLL dd")}
                            </>
                          ) : (
                            format(selectedDateRange.from, "LLL dd, y")
                          )
                        ) : (
                          "Pick Range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl border-gray-200 shadow-xl" align="end">
                      <CalendarPicker
                        initialFocus
                        mode="range"
                        defaultMonth={selectedDateRange?.from}
                        selected={selectedDateRange}
                        onSelect={setSelectedDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Right side buttons */}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5 text-xs border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400 transition-all duration-200"
                    onClick={() => setShowExternalOppModal(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add External
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-2 py-1 gap-1 text-xs transition-all duration-200"
                      onClick={clearFilters}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="w-full px-6 sm:px-10 lg:px-16 py-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* For You — scored and ranked by student preferences */}
          {forYouActive && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-500" />
                    Matched for You
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Ranked by interests · availability · format preference · urgency</p>
                </div>
                <span className="text-sm text-gray-400">{scoredForYou.length} matches</span>
              </div>
              {scoredForYou.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No matches yet — set interests and preferences during sign-up to see personalized picks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {scoredForYou.map(({ opp, score }) => (
                    <OpportunityCard key={opp.id} opportunity={opp} matchScore={score} onClick={() => setSelectedOpportunity(opp)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Experiences for You - horizontal scroll row */}
          {!forYouActive && personalizedOpportunities.length > 0 && !hasActiveFilters && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-5 tracking-tight">Experiences for You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {personalizedOpportunities.slice(0, 4).map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} onClick={() => setSelectedOpportunity(opp)} />
                ))}
              </div>
            </div>
          )}

          {/* All Opportunities - 4 per row grid with hover expand */}
          {!forYouActive && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  {hasActiveFilters ? `Results (${filteredOpportunities.length})` : "All Opportunities"}
                </h2>
                <span className="text-sm text-gray-400">{(hasActiveFilters ? filteredOpportunities : opportunities).length} total</span>
              </div>
              {(hasActiveFilters ? filteredOpportunities : opportunities).length === 0 && loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[340px] bg-white rounded-xl animate-pulse shadow-md shadow-gray-200/60" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {(hasActiveFilters ? filteredOpportunities : opportunities).map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} onClick={() => setSelectedOpportunity(opp)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-28"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-64 bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedOpportunity.image || "/icon.svg"}
                alt={selectedOpportunity.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/icon.svg"
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${categoryColors[selectedOpportunity.category]?.heroGradient || 'from-slate-900/80 to-transparent'}`} />
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="absolute top-4 right-4 w-11 h-11 bg-white/95 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border border-white hover:border-slate-300 text-slate-800 hover:text-black hover:scale-110 active:scale-95 active:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
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
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg tracking-tight">{selectedOpportunity.title}</h2>
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
                <span className={`text-sm px-3 py-1 rounded-full ${commitmentColors[selectedOpportunity.commitment]?.bg || "bg-gray-100"} ${commitmentColors[selectedOpportunity.commitment]?.text || "text-gray-600"}`}>
                  {selectedOpportunity.commitment}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {selectedOpportunity.hours} hours
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{selectedOpportunity.spotsLeft}</p>
                  <p className="text-sm text-gray-500">Spots Remaining</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{selectedOpportunity.totalSpots}</p>
                  <p className="text-sm text-gray-500">Total Capacity</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedOpportunity.date}</p>
                    <p className="text-sm text-gray-500">{selectedOpportunity.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  <span>{selectedOpportunity.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2 tracking-tight">Helpful Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedOpportunity.skills || []).map((skill) => (
                    <span key={skill} className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2 tracking-tight">About This Opportunity</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedOpportunity.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className={`flex-1 rounded-full py-6 text-base font-medium transition-all hover:scale-[1.02] hover:shadow-xl ${appliedIds.has(selectedOpportunity.id)
                    ? "bg-green-500 hover:bg-green-600 text-white cursor-default"
                    : "bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
                    }`}
                  onClick={() => {
                    if (!appliedIds.has(selectedOpportunity.id)) {
                      setApplyTarget(selectedOpportunity)
                      setApplyMessage("")
                      setApplyChecks({ hadSimilarWork: false, hadWorkedWithOrg: false, hadFieldExperience: false })
                    }
                  }}
                  disabled={actionLoading === selectedOpportunity.id || appliedIds.has(selectedOpportunity.id)}
                >
                  {actionLoading === selectedOpportunity.id ? (
                    "Applying..."
                  ) : appliedIds.has(selectedOpportunity.id) ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Apply Now
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 rounded-full py-6 text-base font-medium transition-all hover:scale-[1.02] ${savedIds.has(selectedOpportunity.id)
                    ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                    : "border-gray-300 text-gray-800 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900"
                    }`}
                  onClick={() => handleSave(selectedOpportunity)}
                  disabled={actionLoading === `save-${selectedOpportunity.id}`}
                >
                  {savedIds.has(selectedOpportunity.id) ? "Saved to List" : "Save for later"}
                </Button>
              </div>
              <button
                className="w-full mt-3 text-xs text-red-600 hover:text-red-700 transition-colors text-center flex items-center justify-center gap-1.5 font-medium"
                onClick={() => {
                  setReportTarget(selectedOpportunity)
                  setSelectedOpportunity(null)
                }}
              >
                <Flag className="w-3.5 h-3.5" />
                Report this opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      <AddExternalOpportunityModal
        open={showExternalOppModal}
        onOpenChange={setShowExternalOppModal}
        onSuccess={() => {
          fetchAllOpportunities()
        }}
      />

      {reportTarget && (
        <ReportOpportunityModal
          open={!!reportTarget}
          onOpenChange={(o) => { if (!o) setReportTarget(null) }}
          opportunityId={reportTarget.id}
          opportunityTitle={reportTarget.title}
          onReportSubmitted={() => {
            setHiddenIds(prev => new Set([...Array.from(prev), reportTarget!.id]))
            setReportTarget(null)
          }}
        />
      )}

      {/* Apply Form Modal */}
      {applyTarget && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !actionLoading && setApplyTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Apply for Opportunity</h2>
                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{applyTarget.title}</p>
              </div>
              <button
                onClick={() => !actionLoading && setApplyTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Message textarea */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Message <span className="normal-case text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Tell this organization why you'd like to volunteer..."
                  className="mt-1.5 w-full min-h-[90px] px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Checkboxes */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">About You</label>
                <div className="mt-2 space-y-2.5">
                  {[
                    { key: "hadSimilarWork" as const, label: "I have done similar work before" },
                    { key: "hadWorkedWithOrg" as const, label: "I have worked with this organization before" },
                    { key: "hadFieldExperience" as const, label: "I have experience in this field" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox
                        checked={applyChecks[key]}
                        onCheckedChange={(checked) =>
                          setApplyChecks((prev) => ({ ...prev, [key]: !!checked }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setApplyTarget(null)}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => handleApply(applyTarget, {
                  message: applyMessage.trim() || undefined,
                  hadSimilarWork: applyChecks.hadSimilarWork || undefined,
                  hadWorkedWithOrg: applyChecks.hadWorkedWithOrg || undefined,
                  hadFieldExperience: applyChecks.hadFieldExperience || undefined,
                })}
                disabled={!!actionLoading}
              >
                {actionLoading === applyTarget.id ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
