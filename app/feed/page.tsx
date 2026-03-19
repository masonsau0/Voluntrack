"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Clock, Trophy, Activity, Star, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllOpportunities, type Opportunity } from "@/lib/firebase/opportunities"
import { getStudentProfile } from "@/lib/firebase/student-profiles"
import { getFeedEvents, type FeedEvent } from "@/lib/firebase/feed"
import { getOpportunitiesForMap, getOrgCompletedCounts } from "@/lib/firebase/feed"
import { scoreOpportunity } from "@/lib/scoring"
import { formatDistanceToNow } from "date-fns"
import { InfoWindow, Marker } from "@react-google-maps/api"

const GoogleMapComponent = dynamic(
  () => import("@react-google-maps/api").then(mod => {
    const { GoogleMap, useJsApiLoader } = mod
    function MapWrapper({
      opportunities,
      orgCounts,
      allOpportunities,
    }: {
      opportunities: Opportunity[]
      orgCounts: Record<string, number>
      allOpportunities: Opportunity[]
    }) {
      const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      })
      const [selected, setSelected] = useState<Opportunity | null>(null)

      if (!isLoaded) {
        return (
          <div className="w-full h-[350px] rounded-2xl bg-muted flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      const center = opportunities.length > 0
        ? { lat: opportunities[0].lat!, lng: opportunities[0].lng! }
        : { lat: 43.6532, lng: -79.3832 } // Toronto default

      const sameLocOpps = selected
        ? allOpportunities.filter(o =>
            Math.abs((o.lat ?? 0) - (selected.lat ?? 0)) < 0.0001 &&
            Math.abs((o.lng ?? 0) - (selected.lng ?? 0)) < 0.0001 &&
            o.spotsLeft > 0
          )
        : []

      return (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "350px" }}
          center={center}
          zoom={11}
          options={{ disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false }}
        >
          {opportunities.map(opp => (
            <Marker
              key={opp.id}
              position={{ lat: opp.lat!, lng: opp.lng! }}
              title={opp.title}
              onClick={() => setSelected(opp)}
            />
          ))}
          {selected && selected.lat != null && selected.lng != null && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="max-w-[220px]">
                <p className="font-semibold text-sm text-slate-800">{selected.organization}</p>
                <p className="text-xs text-slate-500 mb-1">
                  {orgCounts[selected.organization] ?? 0} completions
                </p>
                {sameLocOpps.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-slate-700 mt-2 mb-1">Open opportunities:</p>
                    <ul className="space-y-0.5">
                      {sameLocOpps.slice(0, 3).map(o => (
                        <li key={o.id} className="text-xs text-slate-600">• {o.title}</li>
                      ))}
                      {sameLocOpps.length > 3 && (
                        <li className="text-xs text-slate-400">+{sameLocOpps.length - 3} more</li>
                      )}
                    </ul>
                  </>
                )}
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
  const [loading, setLoading] = useState(true)

  const uid = userProfile?.uid

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [mapOpps, allOpps, counts, events] = await Promise.all([
          getOpportunitiesForMap(),
          getAllOpportunities(),
          getOrgCompletedCounts(),
          getFeedEvents(30),
        ])
        setMapOpportunities(mapOpps)
        setAllOpportunities(allOpps)
        setOrgCounts(counts)
        setFeedEvents(events)

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

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 tracking-tight">Feed</h1>
            <p className="text-muted-foreground">Volunteer activity and updates from your community</p>
          </div>

          {/* Community Map */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Community Map
            </h2>
            <div className="rounded-2xl overflow-hidden border shadow-sm">
              {loading ? (
                <div className="w-full h-[350px] bg-muted flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <GoogleMapComponent
                  opportunities={mapOpportunities}
                  orgCounts={orgCounts}
                  allOpportunities={allOpportunities}
                />
              )}
            </div>
            {!loading && mapOpportunities.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">No mapped opportunities yet.</p>
            )}
          </section>

          {/* Accomplishments */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Accomplishments
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : accomplishments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accomplishments yet.</p>
            ) : (
              <div className="space-y-3">
                {accomplishments.map(event => (
                  <Card key={event.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground">
                        A student earned the{" "}
                        <strong>{event.badgeName ?? event.badgeId}</strong> badge completing{" "}
                        <strong>{event.opportunityTitle}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{relativeTime(event)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Activity */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Activity
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.map(event => (
                  <Card key={event.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground">
                        {event.type === "application" ? (
                          <>A student applied to <strong>{event.opportunityTitle}</strong></>
                        ) : (
                          <>A student just completed <strong>{event.opportunityTitle}</strong></>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{relativeTime(event)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Featured Opportunities */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Featured Opportunities
            </h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : featuredOpportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No featured opportunities right now.</p>
            ) : (
              <div className="space-y-4">
                {featuredOpportunities.map(({ opp, score }) => (
                  <Card key={opp.id} className="overflow-hidden shadow-sm">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {opp.featured && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-[10px] font-bold shadow-lg">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Featured
                            </div>
                          )}
                          {score !== undefined && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full text-white text-[10px] font-bold shadow-lg">
                              <Sparkles className="w-2.5 h-2.5" />
                              {score}% match
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-1">{opp.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">by {opp.organization}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {opp.hours} hrs
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {opp.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opp.location}
                          </span>
                        </div>
                        {opp.applicationDeadline && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Deadline: {new Date(opp.applicationDeadline + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                        <p className="text-sm text-foreground mb-4 line-clamp-2">{opp.description}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link href="/opportunities">
                            <Button size="sm" className="rounded-full">Apply Now</Button>
                          </Link>
                          <span className="text-sm font-medium text-foreground">
                            {opp.spotsLeft} spots remaining
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
