"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { getAllOpportunities, type Opportunity } from "@/lib/firebase/opportunities"
import { getStudentProfile } from "@/lib/firebase/student-profiles"
import { getFeedEvents, type FeedEvent, getFeedGlobalStats, getOpportunitiesForMap, getOrgCompletedCounts, getCompletedExternalLocations } from "@/lib/firebase/feed"
import { scoreOpportunity } from "@/lib/scoring"
import {
  applyToOpportunity,
  toggleSaveOpportunity,
  getUserApplications,
  getUserSaved
} from "@/lib/firebase/dashboard"
import { getHiddenOpportunityIds } from "@/lib/firebase/hidden-opportunities"
import { toast } from "sonner"
import { ReportOpportunityModal } from "@/components/report-opportunity-modal"
import { formatDistanceToNow, format } from "date-fns"
import { InfoWindow, Marker } from "@react-google-maps/api"
import { OpportunityCard } from "@/components/opportunity-card"
import { categoryColors, commitmentColors, defaultCategoryColor } from "@/lib/ui-config"

import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  HandHelping,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  Zap,
  CheckCircle2,
  Bookmark,
  MessageSquare,
  Quote,
  LayoutGrid,
  List,
  Users,
  X,
  Building2,
  Flag
} from "lucide-react"

const GoogleMapComponent = dynamic(
  () => import("@react-google-maps/api").then(mod => {
    const { GoogleMap, useJsApiLoader, OverlayView } = mod
    function MapWrapper({
      opportunities,
      orgCounts,
      allOpportunities,
      className,
      style
    }: {
      opportunities: Opportunity[]
      orgCounts: Record<string, number>
      allOpportunities: Opportunity[]
      className?: string
      style?: React.CSSProperties
    }) {
      const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      })
      const [selected, setSelected] = useState<{ lat: number; lng: number; opps: Opportunity[] } | null>(null)
      const mapRef = useRef<google.maps.Map | null>(null)
      const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number } | null>(null)

      // Initialize center only once or when data first becomes available
      useEffect(() => {
        if (opportunities.length > 0 && !currentCenter) {
          setCurrentCenter({ lat: opportunities[0].lat!, lng: opportunities[0].lng! })
        }
      }, [opportunities, currentCenter])

      const groups = useMemo(() => {
        const m = new Map<string, Opportunity[]>()
        opportunities.forEach(o => {
          if (o.lat == null || o.lng == null) return
          const key = `${o.lat.toFixed(6)},${o.lng.toFixed(6)}`
          if (!m.has(key)) m.set(key, [])
          m.get(key)!.push(o)
        })
        return Array.from(m.entries()).map(([k, opps]) => ({
          key: k,
          lat: opps[0].lat!,
          lng: opps[0].lng!,
          opps
        }))
      }, [opportunities])

      const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map
      }, [])

      const onMarkerClick = (group: { lat: number, lng: number, opps: Opportunity[] }) => {
        setSelected(group)
        setCurrentCenter({ lat: group.lat, lng: group.lng })
        if (mapRef.current) {
          mapRef.current.panTo({ lat: group.lat, lng: group.lng })
        }
      }

      if (!isLoaded) {
        return (
          <div className={className} style={style}>
            <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )
      }

      const fallbackCenter = { lat: 43.6532, lng: -79.3832 } // Toronto default
      const displayCenter = currentCenter || fallbackCenter

      const sameLocOpps = selected
        ? allOpportunities.filter(o =>
          Math.abs((o.lat ?? 0) - (selected.lat ?? 0)) < 0.0001 &&
          Math.abs((o.lng ?? 0) - (selected.lng ?? 0)) < 0.0001 &&
          o.spotsLeft > 0
        )
        : []

      return (
        <GoogleMap
          mapContainerClassName={className}
          mapContainerStyle={style || { width: "100%", height: "350px" }}
          center={displayCenter}
          zoom={11}
          onLoad={onMapLoad}
          onDragEnd={() => {
            if (mapRef.current) {
              const c = mapRef.current.getCenter()
              if (c) setCurrentCenter({ lat: c.lat(), lng: c.lng() })
            }
          }}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {groups.map((group: { key: string; lat: number; lng: number; opps: Opportunity[] }) => (
            <Marker
              key={group.key}
              position={{ lat: group.lat, lng: group.lng }}
              title={`${group.opps[0].organization} (${group.opps.length})`}
              onClick={() => onMarkerClick(group)}
            />
          ))}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="max-w-[220px] p-0.5">
                <p className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-1.5 mb-2">
                  {selected.opps[0].organization}
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                      Opportunities ({selected.opps.length})
                    </p>
                    <ul className="space-y-1">
                      {selected.opps.slice(0, 5).map(o => (
                        <li key={o.id} className="text-xs text-slate-700 font-medium leading-tight">• {o.title}</li>
                      ))}
                      {selected.opps.length > 5 && (
                        <li className="text-[10px] text-slate-400 italic">+{selected.opps.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                      Progress
                    </p>
                    <p className="text-xs text-slate-600 font-bold">
                      {orgCounts[selected.opps[0].organization] ?? 0} completions
                    </p>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )
    }
    return MapWrapper
  }),
  { ssr: false }
)

export default function FeedPage() {
  const { userProfile } = useAuth()
  const [mapOpportunities, setMapOpportunities] = useState<Opportunity[]>([])
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([])
  const [orgCounts, setOrgCounts] = useState<Record<string, number>>({})
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([])
  const [studentInterests, setStudentInterests] = useState<string[]>([])
  const [studentVolunteerFormat, setStudentVolunteerFormat] = useState("no-preference")
  const [studentAvailability, setStudentAvailability] = useState("any-time")
  const [globalStats, setGlobalStats] = useState({
    studentVolunteers: 0,
    activeOpportunities: 0,
    totalImpactHours: 0,
    completedHours: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [reportTarget, setReportTarget] = useState<Opportunity | null>(null)

  const uid = userProfile?.uid

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [mapOpps, allOpps, counts, events, completedExternal, statsData] = await Promise.all([
          getOpportunitiesForMap(),
          getAllOpportunities(),
          getOrgCompletedCounts(),
          getFeedEvents(30),
          getCompletedExternalLocations(),
          getFeedGlobalStats(),
        ])
        const existingIds = new Set(mapOpps.map((o: Opportunity) => o.id))
        const mergedMapOpps = [...mapOpps, ...completedExternal.filter((o: Opportunity) => !existingIds.has(o.id))]
        setMapOpportunities(mergedMapOpps)
        setAllOpportunities(allOpps)
        setOrgCounts(counts)
        setFeedEvents(events)
        setGlobalStats(statsData)

        if (uid) {
          const profile = await getStudentProfile(uid)
          if (profile) {
            setStudentInterests(profile.interests ?? [])
            setStudentVolunteerFormat(profile.volunteerFormat ?? "no-preference")
            setStudentAvailability(profile.availability ?? "any-time")
          }
        }
      } catch (err) {
        console.error("Feed load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [uid])

  useEffect(() => {
    async function fetchUserData() {
      if (!uid) return
      try {
        const [apps, saved, hidden] = await Promise.all([
          getUserApplications(uid),
          getUserSaved(uid),
          getHiddenOpportunityIds(uid),
        ])
        setAppliedIds(new Set(apps.map(a => a.opportunityId)))
        setSavedIds(new Set(saved.map(s => s.opportunityId)))
        setHiddenIds(hidden)
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }
    fetchUserData()
  }, [uid])

  const handleApply = async (opportunity: Opportunity) => {
    if (!uid) {
      toast.error("Please sign in to apply.")
      return
    }
    if (appliedIds.has(opportunity.id)) return

    setActionLoading(opportunity.id)
    try {
      await applyToOpportunity(uid, opportunity)
      setAppliedIds(prev => new Set([...Array.from(prev), opportunity.id]))
      toast.success("Applied!")
    } catch (err: any) {
      toast.error(err.message || "Failed to apply.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSave = async (opportunity: Opportunity) => {
    if (!uid) {
      toast.error("Please sign in to save opportunities.")
      return
    }

    setActionLoading(`save-${opportunity.id}`)
    try {
      const isSaved = await toggleSaveOpportunity(uid, opportunity)
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

  // Compute featured opportunities — keep score so cards can display it
  const featuredOpportunities: { opp: Opportunity; score?: number }[] = (() => {
    if (allOpportunities.length === 0) return []
    if (!uid) {
      return [...allOpportunities]
        .sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return a.dateISO.localeCompare(b.dateISO)
        })
        .slice(0, 10)
        .map(opp => ({ opp }))
    }
    return [...allOpportunities]
      .map(opp => ({
        opp,
        score: scoreOpportunity(opp, studentInterests, studentVolunteerFormat, studentAvailability),
      }))
      .filter(({ score }) => score >= 85)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        const deadlineA = a.opp.applicationDeadline ?? a.opp.dateISO
        const deadlineB = b.opp.applicationDeadline ?? b.opp.dateISO
        return deadlineA.localeCompare(deadlineB)
      })
      .slice(0, 10)
  })()

  const accomplishments = feedEvents.filter(e => e.type === "badge_earned")
  const activity = feedEvents.filter(e => e.type === "application" || e.type === "completion")

  function relativeTime(event: FeedEvent): string {
    try {
      const ts = event.createdAt
      const date = ts?.toDate ? ts.toDate() : new Date((ts as any).seconds * 1000)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return ""
    }
  }

  const [activeTab, setActiveTab] = useState("feed")

  // Community Stats (Real-time from backend)
  const stats = [
    { label: "Student Volunteers", value: globalStats.studentVolunteers.toLocaleString(), icon: Users },
    { label: "Active Opportunities", value: globalStats.activeOpportunities.toLocaleString(), icon: MapIcon },
    { label: "Total Impact Hours", value: globalStats.totalImpactHours.toLocaleString(), icon: Sparkles },
    { label: "Completed Hours", value: globalStats.completedHours.toLocaleString(), icon: Clock },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navigation />

      <main className="flex-1 pb-20">
        {/* HERO MAP SECTION */}
        <div className="relative w-full h-[750px] overflow-hidden group">
          <GoogleMapComponent
            opportunities={mapOpportunities}
            orgCounts={orgCounts}
            allOpportunities={allOpportunities}
            className="w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Map Overlay Header — Hides on hover for clear map view */}
          <div className="absolute top-0 left-0 right-0 p-8 pt-32 md:pt-40 bg-gradient-to-b from-slate-900/60 to-transparent pointer-events-none group-hover:opacity-0 group-hover:-translate-x-10 transition-all duration-700 ease-in-out">
            <div className="max-w-none px-12 md:px-20 flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mb-2">
                  Community Feed
                </h1>
                <p className="text-slate-100 text-lg font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Real-time updates and volunteer activity near you
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS BAR (Placed below map to avoid blocking controls, No top border/gap) */}
        <div className="w-full bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-blue-400" />
                    <span className="text-3xl font-bold text-white tracking-tighter tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-COLUMN CONTENT SECTION */}
        <div className="max-w-none px-6 md:px-12 lg:px-16 py-16">
          <div className="grid grid-cols-1 gap-16">
            
            {/* COLUMN 1: FEATURED OPPORTUNITIES */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Featured Opportunities
                  </h2>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Personalized for your interests</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                {featuredOpportunities.slice(0, 8).map(({ opp, score }) => (
                  <OpportunityCard key={opp.id} opportunity={opp} matchScore={score} onClick={() => setSelectedOpportunity(opp)} />
                ))}
              </div>
            </div>

            {/* COLUMN 2: ACCOMPLISHMENTS */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100 border border-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-1">Accomplishments</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global progress</p>
                </div>
              </div>

              <div className="space-y-4">
                {accomplishments.length > 0 ? (
                  accomplishments.slice(0, 10).map((event, idx) => (
                    <div key={idx} className="group min-h-[88px] py-4 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
                      <div className="flex gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors shrink-0">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] text-slate-900 font-bold group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
                            <span className="text-slate-500 font-medium italic">A community member earned </span>
                            <span className="inline-block font-black text-slate-900">{event.badgeName ?? event.badgeId}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-semibold uppercase tracking-widest">
                            <Clock className="w-4 h-4" />
                            {relativeTime(event)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-xs font-medium">No recent accomplishments reported.</p>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: ACTIVITY FEED */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-100 border border-indigo-400">
                  <HandHelping className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-1">Activity Feed</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time updates</p>
                </div>
              </div>

              <div className="space-y-4">
                {activity.slice(0, 10).map((item, idx) => {
                  const opp = allOpportunities.find(o => o.id === item.opportunityId)
                  const imgSrc = opp?.image || "/icon.svg"
                  return (
                  <button
                    key={idx}
                    className="w-full text-left group min-h-[96px] py-5 px-5 bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                    onClick={() => {
                      if (opp) setSelectedOpportunity(opp)
                    }}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={item.opportunityTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = "/icon.svg" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] text-slate-900 font-bold transition-colors leading-snug line-clamp-2">
                          <span className="text-slate-500 font-medium italic">A student </span>
                          {item.type === 'completion' ? 'finished' : 'applied for'} <span className="inline-block font-black text-slate-900">{item.opportunityTitle}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-semibold uppercase tracking-widest">
                          <Clock className="w-4 h-4 shrink-0" />
                          {relativeTime(item)}
                        </p>
                      </div>
                    </div>
                  </button>
                )})}

                {activity.length === 0 && (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-xs font-medium">Waiting for activity...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                  onClick={() => handleApply(selectedOpportunity)}
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
                className="w-full mt-4 py-3 px-4 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-full transition-colors flex items-center justify-center gap-2 font-semibold"
                onClick={() => {
                  setReportTarget(selectedOpportunity)
                  setSelectedOpportunity(null)
                }}
              >
                <Flag className="w-4 h-4 shrink-0" />
                Report this opportunity
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}

