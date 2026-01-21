"use client"

import React, { useState, useMemo } from "react"
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
    Users,
    ChevronDown,
    ChevronUp,
    Filter,
    X,
    Sparkles,
    TrendingUp,
    FileText,
    FolderOpen,
    Newspaper,
    User,
    Settings,
    Search,
    ArrowRight,
    BarChart3,
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

// Sample events data with images - Learning & Experience focused (no volunteering)
const sampleEvents = [
    {
        id: 1,
        title: "Volunteer Ontario Annual Conference",
        description: "Join us for the premier volunteer sector conference in Ontario! This two-day event features keynote speakers, networking sessions, and workshops on best practices in volunteer management. Learn from industry experts about volunteer engagement strategies, retention techniques, and emerging trends in the nonprofit sector. Perfect for volunteer coordinators, nonprofit leaders, and anyone looking to enhance their volunteer program.",
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
        description: "Explore hundreds of volunteer opportunities at our annual Spring Volunteer Fair! Meet representatives from over 100 nonprofit organizations, learn about different causes, and find the perfect volunteer match for your interests and schedule. Whether you're interested in environmental work, healthcare, education, or arts and culture, you'll find opportunities that align with your passions. Free admission and refreshments provided.",
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
        description: "Learn how to become an effective environmental advocate in your community! This hands-on workshop covers topics including grassroots organizing, policy advocacy, social media campaigns for environmental causes, and how to engage local government. You'll leave with practical skills and a toolkit for making a real difference in environmental protection. No prior experience required.",
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
        description: "Discover our flagship Youth Leadership Development Program! This info session will cover program details including mentorship opportunities, skill-building workshops, community project planning, and networking with industry leaders. Learn how young people aged 16-25 can develop leadership skills while making a positive impact in their communities. Parents and guardians are welcome to attend.",
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
        description: "Explore the healing power of art in this introductory workshop on art therapy fundamentals! Learn about the principles of art therapy, creative expression techniques, and how art can support mental health and wellbeing. This workshop is ideal for healthcare workers, educators, caregivers, and anyone interested in therapeutic arts. Participants will create their own art pieces and learn facilitation techniques.",
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
        description: "Considering volunteering in a healthcare setting? This comprehensive training session covers everything you need to know! Topics include patient confidentiality, infection control basics, communication skills for healthcare environments, understanding hospital systems, and emotional resilience. Upon completion, you'll receive a certificate that many healthcare facilities recognize for volunteer placement.",
        date: "Feb 10, 2025",
        dateISO: "2025-02-10",
        location: "Toronto General Hospital - Education Centre",
        participants: 40,
        category: "Healthcare",
        contentType: "Training",
        image: "/event-hospital-volunteer.png",
    },
    {
        id: 7,
        title: "Sustainable Gardening & Food Security Seminar",
        description: "Join local experts for an educational seminar on sustainable gardening practices and community food security! Learn about urban agriculture, composting, organic growing methods, and how community gardens contribute to food access and neighborhood resilience. Speakers include representatives from local food banks, urban farmers, and sustainability experts. Light refreshments from local gardens provided.",
        date: "Apr 5, 2025",
        dateISO: "2025-04-05",
        location: "Downsview Park Community Centre",
        participants: 75,
        category: "Environment",
        contentType: "Events",
        image: "/event-park-cleanup.png",
    },
    {
        id: 8,
        title: "Nonprofit Fundraising Strategies Workshop",
        description: "Master the art of fundraising in this intensive workshop designed for nonprofit professionals and board members! Learn about donor cultivation, grant writing basics, crowdfunding campaigns, corporate sponsorships, and event-based fundraising. Real case studies from successful Toronto nonprofits will be shared. Participants will develop a fundraising action plan for their organizations.",
        date: "Mar 20, 2025",
        dateISO: "2025-03-20",
        location: "The Carlu, Toronto",
        participants: 100,
        category: "Fundraising",
        contentType: "Workshops",
        image: "/event-volunteer-fair.png",
    },
    {
        id: 9,
        title: "Literacy Advocacy & Education Forum",
        description: "Join educators, literacy advocates, and community leaders for this important forum on promoting literacy in our communities! Discussions will cover early childhood literacy, adult education programs, digital literacy initiatives, and supporting English language learners. Hear from successful literacy programs and learn how you can advocate for increased literacy funding and resources in your community.",
        date: "Feb 22, 2025",
        dateISO: "2025-02-22",
        location: "Toronto Reference Library",
        participants: 80,
        category: "Education",
        contentType: "Announcements",
        image: "/event-youth-mentorship.png",
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

// Dashboard tabs
const tabs = [
    { id: "progress", label: "Progress Tracking", icon: TrendingUp, href: "/dashboard" },
    { id: "applications", label: "Applications", icon: FileText, href: "/applications" },
    { id: "forms", label: "My Forms", icon: FolderOpen, href: "/dashboard" },
    { id: "news", label: "News/Events", icon: Newspaper, href: "/news" },
    { id: "account", label: "My Account", icon: User, href: "/dashboard" },
    { id: "preferences", label: "Preferences", icon: Settings, href: "/dashboard" },
]

export default function NewsEventsPage() {
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
            // Filter by content type
            if (selectedContentTypes.length > 0 && !selectedContentTypes.includes(event.contentType)) {
                return false
            }

            // Filter by event category
            if (selectedEventCategories.length > 0 && !selectedEventCategories.includes(event.category)) {
                return false
            }

            // Filter by date range
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

            // Filter by search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    event.title.toLowerCase().includes(query) ||
                    event.description.toLowerCase().includes(query) ||
                    event.date.toLowerCase().includes(query) ||
                    event.location.toLowerCase().includes(query) ||
                    event.category.toLowerCase().includes(query) ||
                    event.contentType.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            return true
        })

        // Sort
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
            {/* Filter Header */}
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-card py-2 z-10">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-foreground" />
                    <h2 className="font-semibold text-lg">Filter</h2>
                </div>
            </div>

            {/* Clear Filters Button - Professional Design */}
            {hasActiveFilters && (
                <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-muted-foreground hover:text-foreground border-dashed"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Filters
                </Button>
            )}

            {/* Sorting */}
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

            {/* Content Type */}
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
                            <>
                                Show less <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                Show more <ChevronDown className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>

            <hr className="border-border" />

            {/* Event Categories */}
            <div>
                <h3 className="font-medium text-sm mb-3">Event Category</h3>
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
                            <>
                                Show less <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                Show more <ChevronDown className="w-3 h-3" />
                            </>
                        )}
                    </button>
                )}
            </div>

            <hr className="border-border" />

            {/* Date Range */}
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
                    {/* Welcome Header - Same as Dashboard */}
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

                    {/* Tab Navigation - Same as Dashboard */}
                    <div className="bg-white rounded-xl mb-6 shadow-sm overflow-x-auto">
                        <div className="flex min-w-max">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab.id === "news"
                                        ? "border-blue-500 text-blue-600 bg-blue-50/50"
                                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Page Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-foreground">News & Events</h2>
                        <p className="text-muted-foreground mt-1">
                            Discover volunteer opportunities and stay updated with the latest news
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
                        {/* Filter Sidebar - Desktop with independent scrolling */}
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
                            {/* Search Bar - Rounded */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search events by title, description, date, location, or category..."
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
                                Showing {filteredEvents.length} of {sampleEvents.length} events
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
                                            {/* Event Image Header */}
                                            <div className="h-40 relative overflow-hidden">
                                                <Image
                                                    src={event.image}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                            </div>

                                            {/* Card Content */}
                                            <CardContent className="p-5 bg-white dark:bg-card">
                                                {/* Title and Category Badge */}
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

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                    {event.description}
                                                </p>

                                                {/* Event Details */}
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
                                                        <span>/{event.participants} participants</span>
                                                    </div>
                                                </div>

                                                {/* Content Type Badge */}
                                                <div className="mb-4">
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full border ${contentTypeColor.bg} ${contentTypeColor.text} ${contentTypeColor.border}`}
                                                    >
                                                        {event.contentType}
                                                    </span>
                                                </div>

                                                {/* Register Button - Rounded */}
                                                <Button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white gap-2 rounded-full"
                                                >
                                                    <Users className="w-4 h-4" />
                                                    Register Now
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
                                    <h3 className="text-lg font-medium text-foreground">No events found</h3>
                                    <p className="text-muted-foreground mt-2 mb-6">
                                        Try adjusting your filters or search query to find more events
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
                        {/* Modal Header with Image */}
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

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Category and Content Type Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`text-xs px-3 py-1 rounded-full border ${categoryColors[selectedEvent.category]?.bg || 'bg-gray-100'} ${categoryColors[selectedEvent.category]?.text || 'text-gray-700'} ${categoryColors[selectedEvent.category]?.border || 'border-gray-300'}`}>
                                    {selectedEvent.category}
                                </span>
                                <span className={`text-xs px-3 py-1 rounded-full border ${contentTypeColors[selectedEvent.contentType]?.bg || 'bg-gray-100'} ${contentTypeColors[selectedEvent.contentType]?.text || 'text-gray-700'} ${contentTypeColors[selectedEvent.contentType]?.border || 'border-gray-300'}`}>
                                    {selectedEvent.contentType}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-foreground mb-4">
                                {selectedEvent.title}
                            </h2>

                            {/* Event Details */}
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

                            {/* Full Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-foreground mb-2">About This Event</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            {/* Register Button */}
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
