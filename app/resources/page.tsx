"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Calendar,
    MapPin,
    Users,
    ChevronDown,
    ChevronUp,
    Filter,
    X,
    Search,
    RotateCcw,
    ArrowUpDown,
} from "lucide-react"

// Color-coded category tags matching posting colors
const categoryColors: { [key: string]: { bg: string; text: string; border: string } } = {
    "Environment": { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    "Community Outreach": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
    "Education": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
    "Healthcare": { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
    "Animal Welfare": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
    "Arts & Culture": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
    "Youth Programs": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
    "Senior Care": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300" },
    "Fundraising": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
}

// Color-coded content type colors
const contentTypeColors: { [key: string]: { bg: string; text: string; border: string } } = {
    "Announcements": { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
    "Events": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
    "Tips": { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
    "Scholarships": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
    "Workshops": { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-300" },
    "Training": { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" },
}

// Sample events data with images
const sampleEvents = [
    {
        id: 1,
        title: "Volunteer Ontario Annual Conference",
        description: "Join us for the premier volunteer sector conference in Ontario! This two-day event features keynote speakers, networking sessions, and workshops on best practices in volunteer management.",
        date: "Jan 25, 2025",
        dateISO: "2025-01-25",
        location: "Metro Toronto Convention Centre",
        participants: 500,
        category: "Community Outreach",
        contentType: "Events",
        image: "/event-volunteer-fair.png",
    },
    {
        id: 2,
        title: "Spring Volunteer Fair 2025",
        description: "Explore hundreds of volunteer opportunities at our annual Spring Volunteer Fair! Meet representatives from over 100 nonprofit organizations.",
        date: "Feb 15, 2025",
        dateISO: "2025-02-15",
        location: "Metro Toronto Convention Centre",
        participants: 200,
        category: "Community Outreach",
        contentType: "Events",
        image: "/event-volunteer-fair.png",
    },
    {
        id: 3,
        title: "Environmental Advocacy Workshop",
        description: "Learn how to become an effective environmental advocate in your community! This hands-on workshop covers grassroots organizing and policy advocacy.",
        date: "Mar 8, 2025",
        dateISO: "2025-03-08",
        location: "Toronto Environmental Alliance Office",
        participants: 50,
        category: "Environment",
        contentType: "Workshops",
        image: "/event-park-cleanup.png",
    },
    {
        id: 4,
        title: "Youth Leadership Development Program Info Session",
        description: "Discover our flagship Youth Leadership Development Program! Learn how young people aged 16-25 can develop leadership skills.",
        date: "Feb 1, 2025",
        dateISO: "2025-02-01",
        location: "Toronto Public Library - North York Branch",
        participants: 30,
        category: "Youth Programs",
        contentType: "Announcements",
        image: "/event-youth-mentorship.png",
    },
    {
        id: 5,
        title: "Art Therapy Fundamentals Workshop",
        description: "Explore the healing power of art in this introductory workshop on art therapy fundamentals!",
        date: "Jan 30, 2025",
        dateISO: "2025-01-30",
        location: "Fairview Community Centre",
        participants: 25,
        category: "Arts & Culture",
        contentType: "Workshops",
        image: "/event-art-workshop.png",
    },
    {
        id: 6,
        title: "Healthcare Volunteering 101 Training",
        description: "Considering volunteering in a healthcare setting? This comprehensive training session covers everything you need to know!",
        date: "Feb 10, 2025",
        dateISO: "2025-02-10",
        location: "Toronto General Hospital - Education Centre",
        participants: 40,
        category: "Healthcare",
        contentType: "Training",
        image: "/event-hospital-volunteer.png",
    },
]

// Filter categories
const contentTypes = [
    "Announcements",
    "Events",
    "Tips",
    "Scholarships",
    "Workshops",
    "Training",
]

const eventCategories = [
    "Environment",
    "Community Outreach",
    "Education",
    "Healthcare",
    "Animal Welfare",
    "Arts & Culture",
    "Youth Programs",
    "Senior Care",
    "Fundraising",
]

export default function ResourcesPage() {
    const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
    const [selectedEventCategories, setSelectedEventCategories] = useState<string[]>([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [showMoreContentTypes, setShowMoreContentTypes] = useState(false)
    const [showMoreEventCategories, setShowMoreEventCategories] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("newest")
    const [selectedEvent, setSelectedEvent] = useState<typeof sampleEvents[0] | null>(null)

    const toggleContentType = (type: string) => {
        setSelectedContentTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        )
    }

    const toggleEventCategory = (category: string) => {
        setSelectedEventCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        )
    }

    const clearFilters = () => {
        setSelectedContentTypes([])
        setSelectedEventCategories([])
        setStartDate("")
        setEndDate("")
        setSearchQuery("")
        setSortBy("newest")
    }

    // Filter and sort events
    const filteredEvents = useMemo(() => {
        let result = sampleEvents.filter((event) => {
            if (selectedContentTypes.length > 0 && !selectedContentTypes.includes(event.contentType)) {
                return false
            }
            if (selectedEventCategories.length > 0 && !selectedEventCategories.includes(event.category)) {
                return false
            }
            if (startDate) {
                const eventDate = new Date(event.dateISO)
                const filterStartDate = new Date(startDate)
                if (eventDate < filterStartDate) return false
            }
            if (endDate) {
                const eventDate = new Date(event.dateISO)
                const filterEndDate = new Date(endDate)
                if (eventDate > filterEndDate) return false
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    event.title.toLowerCase().includes(query) ||
                    event.description.toLowerCase().includes(query) ||
                    event.location.toLowerCase().includes(query) ||
                    event.category.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }
            return true
        })

        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
                case "oldest":
                    return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
                case "az":
                    return a.title.localeCompare(b.title)
                default:
                    return 0
            }
        })

        return result
    }, [selectedContentTypes, selectedEventCategories, startDate, endDate, searchQuery, sortBy])

    const displayedContentTypes = showMoreContentTypes ? contentTypes : contentTypes.slice(0, 4)
    const displayedEventCategories = showMoreEventCategories ? eventCategories : eventCategories.slice(0, 4)
    const hasActiveFilters = selectedContentTypes.length > 0 || selectedEventCategories.length > 0 || startDate || endDate || searchQuery || sortBy !== "newest"

    const FilterSidebar = () => (
        <div className="h-full overflow-y-auto pr-2 space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-card py-2 z-10">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-foreground" />
                    <h2 className="font-semibold text-lg">Filter</h2>
                </div>
            </div>

            {/* Active Filters Section */}
            {hasActiveFilters && (
                <div className="pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm text-foreground">Active filters</h3>
                        <span className="text-xs text-muted-foreground">{filteredEvents.length} results</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Content Type Tags */}
                        {selectedContentTypes.map(type => {
                            const colors = contentTypeColors[type] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleContentType(type)}
                                    className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 hover:opacity-80 transition-opacity ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                    {type}
                                    <X className="w-3 h-3 ml-1" />
                                </button>
                            )
                        })}

                        {/* Category Tags */}
                        {selectedEventCategories.map(cat => {
                            const colors = categoryColors[cat] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                            return (
                                <button
                                    key={cat}
                                    onClick={() => toggleEventCategory(cat)}
                                    className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 hover:opacity-80 transition-opacity ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                    {cat}
                                    <X className="w-3 h-3 ml-1" />
                                </button>
                            )
                        })}

                        {/* Date Tags */}
                        {startDate && (
                            <button
                                onClick={() => setStartDate("")}
                                className="text-xs px-2 py-1 rounded-full border bg-secondary text-secondary-foreground border-border flex items-center gap-1 hover:bg-secondary/80"
                            >
                                After: {startDate} <X className="w-3 h-3 ml-1" />
                            </button>
                        )}
                        {endDate && (
                            <button
                                onClick={() => setEndDate("")}
                                className="text-xs px-2 py-1 rounded-full border bg-secondary text-secondary-foreground border-border flex items-center gap-1 hover:bg-secondary/80"
                            >
                                Before: {endDate} <X className="w-3 h-3 ml-1" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground mt-3 underline decoration-dotted underline-offset-4"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            <div>
                <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Sort By
                </h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="sortBy"
                            checked={sortBy === "newest"}
                            onChange={() => setSortBy("newest")}
                            className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-sm">Newest First</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="sortBy"
                            checked={sortBy === "oldest"}
                            onChange={() => setSortBy("oldest")}
                            className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-sm">Oldest First</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="sortBy"
                            checked={sortBy === "az"}
                            onChange={() => setSortBy("az")}
                            className="w-4 h-4 text-blue-500"
                        />
                        <span className="text-sm">Alphabetical A-Z</span>
                    </label>
                </div>
            </div>

            <hr className="border-border" />

            <div>
                <h3 className="font-medium text-sm mb-3">Content Type</h3>
                <div className="space-y-2">
                    {displayedContentTypes.map((type) => {
                        const colors = contentTypeColors[type] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                        return (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedContentTypes.includes(type)}
                                    onCheckedChange={() => toggleContentType(type)}
                                />
                                <span className={`text-sm px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                    {type}
                                </span>
                            </label>
                        )
                    })}
                </div>
                {contentTypes.length > 4 && (
                    <button
                        onClick={() => setShowMoreContentTypes(!showMoreContentTypes)}
                        className="text-sm text-blue-500 hover:text-blue-600 mt-2 flex items-center gap-1"
                    >
                        {showMoreContentTypes ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                            <>Show more <ChevronDown className="w-3 h-3" /></>
                        )}
                    </button>
                )}
            </div>

            <hr className="border-border" />

            <div>
                <h3 className="font-medium text-sm mb-3">Category</h3>
                <div className="space-y-2">
                    {displayedEventCategories.map((category) => {
                        const colors = categoryColors[category] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                        return (
                            <label key={category} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedEventCategories.includes(category)}
                                    onCheckedChange={() => toggleEventCategory(category)}
                                />
                                <span className={`text-sm px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                                    {category}
                                </span>
                            </label>
                        )
                    })}
                </div>
                {eventCategories.length > 4 && (
                    <button
                        onClick={() => setShowMoreEventCategories(!showMoreEventCategories)}
                        className="text-sm text-blue-500 hover:text-blue-600 mt-2 flex items-center gap-1"
                    >
                        {showMoreEventCategories ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                            <>Show more <ChevronDown className="w-3 h-3" /></>
                        )}
                    </button>
                )}
            </div>

            <hr className="border-border" />

            <div>
                <h3 className="font-medium text-sm mb-3">Date Range</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
            <Navigation />

            <main className="flex-1 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Resources</h1>
                        <p className="text-muted-foreground mt-1">
                            Discover events, workshops, and resources to support your volunteer journey
                        </p>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="gap-2 rounded-full"
                        >
                            <Filter className="w-4 h-4" />
                            {showMobileFilters ? "Hide Filters" : "Show Filters"}
                        </Button>
                    </div>

                    <div className="flex gap-8">
                        {/* Filter Sidebar - Desktop */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <Card className="shadow-sm sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden">
                                <CardContent className="p-5 h-full max-h-[calc(100vh-160px)] overflow-y-auto">
                                    <FilterSidebar />
                                </CardContent>
                            </Card>
                        </aside>

                        {/* Mobile Filter Drawer */}
                        {showMobileFilters && (
                            <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
                                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-card p-6 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-semibold text-lg">Filters</h2>
                                        <button onClick={() => setShowMobileFilters(false)}>
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <FilterSidebar />
                                </div>
                            </div>
                        )}

                        {/* Events Grid */}
                        <div className="flex-1">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search resources by title, description, or category..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 py-6 text-base bg-white dark:bg-card rounded-full border-2 focus:border-blue-400 shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Results count */}
                            <p className="text-sm text-muted-foreground mb-4">
                                Showing {filteredEvents.length} of {sampleEvents.length} resources
                            </p>

                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredEvents.map((event) => {
                                    const categoryColor = categoryColors[event.category] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                                    const contentTypeColor = contentTypeColors[event.contentType] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }

                                    return (
                                        <Card
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 rounded-xl"
                                        >
                                            <div className="h-40 relative overflow-hidden">
                                                <Image
                                                    src={event.image}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                            </div>

                                            <CardContent className="p-5 bg-white dark:bg-card">
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                                                        {event.title}
                                                    </h3>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
                                                    >
                                                        {event.category}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {event.description}
                                                </p>

                                                <div className="space-y-2 text-sm mb-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                        <span>{event.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="w-4 h-4 text-red-500" />
                                                        <span className="line-clamp-1">{event.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="w-4 h-4 text-teal-500" />
                                                        <span>{event.participants} participants</span>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full border ${contentTypeColor.bg} ${contentTypeColor.text} ${contentTypeColor.border}`}
                                                    >
                                                        {event.contentType}
                                                    </span>
                                                </div>

                                                <Button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 rounded-full"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    Learn More
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>

                            {/* Empty State */}
                            {filteredEvents.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                                        <Calendar className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No resources found</h3>
                                    <p className="text-muted-foreground mt-2 mb-6">
                                        Try adjusting your filters or search query
                                    </p>
                                    <Button onClick={clearFilters} variant="outline" className="gap-2 rounded-full">
                                        <RotateCcw className="w-4 h-4" />
                                        Reset All Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-white dark:bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-48">
                            <Image
                                src={selectedEvent.image}
                                alt={selectedEvent.title}
                                fill
                                className="object-cover rounded-t-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl" />
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`text-xs px-3 py-1 rounded-full border ${categoryColors[selectedEvent.category]?.bg || 'bg-gray-100'} ${categoryColors[selectedEvent.category]?.text || 'text-gray-700'} ${categoryColors[selectedEvent.category]?.border || 'border-gray-300'}`}>
                                    {selectedEvent.category}
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full border ${contentTypeColors[selectedEvent.contentType]?.bg || 'bg-gray-100'} ${contentTypeColors[selectedEvent.contentType]?.text || 'text-gray-700'} ${contentTypeColors[selectedEvent.contentType]?.border || 'border-gray-300'}`}>
                                    {selectedEvent.contentType}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mb-4">
                                {selectedEvent.title}
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span>{selectedEvent.date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span>{selectedEvent.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-teal-500" />
                                    </div>
                                    <span>{selectedEvent.participants} participants expected</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-foreground mb-2">About This Resource</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 rounded-full py-6 text-lg">
                                <Users className="w-5 h-5" />
                                Register Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
