"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
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
    Bookmark,
    Leaf,
    BookOpen,
    ArrowUpDown,
    CheckCircle,
    XCircle,
    Clock3,
} from "lucide-react"

// Color-coded category colors
const categoryColors: { [key: string]: { bg: string; text: string; border: string; cardBg: string } } = {
    "Environment": { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", cardBg: "bg-green-50 border-green-200" },
    "Community Outreach": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", cardBg: "bg-orange-50 border-orange-200" },
    "Education": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", cardBg: "bg-blue-50 border-blue-200" },
    "Healthcare": { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300", cardBg: "bg-pink-50 border-pink-200" },
    "Animal Welfare": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", cardBg: "bg-amber-50 border-amber-200" },
    "Arts & Culture": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", cardBg: "bg-purple-50 border-purple-200" },
    "Youth Programs": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300", cardBg: "bg-cyan-50 border-cyan-200" },
    "Senior Care": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-300", cardBg: "bg-rose-50 border-rose-200" },
    "Fundraising": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300", cardBg: "bg-indigo-50 border-indigo-200" },
}

// Status colors
const statusColors: { [key: string]: { bg: string; text: string; border: string; icon: typeof CheckCircle } } = {
    "approved": { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", icon: CheckCircle },
    "pending": { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", icon: Clock3 },
    "denied": { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", icon: XCircle },
}

// Sample applications data (expanded)
const sampleApplications = [
    {
        id: 1,
        title: "Trinity Bellwoods Park: Park Clean-Up",
        location: "790 Queen St W, Toronto, ON M6J 1G3",
        date: "Saturday, July 30, 2025, 10:00 AM – 12:00 PM",
        dateISO: "2025-07-30",
        appliedDate: "2025-01-15",
        hours: "2 Hr",
        category: "Environment",
        status: "pending",
    },
    {
        id: 2,
        title: "Food Bank Sorting",
        location: "125 Main St, Toronto, ON M4C 1A1",
        date: "Saturday, June 14, 2025, 7:00 AM – 9:00 AM",
        dateISO: "2025-06-14",
        appliedDate: "2025-01-10",
        hours: "2 Hr",
        category: "Community Outreach",
        status: "approved",
    },
    {
        id: 3,
        title: "Community Garden Planting",
        location: "456 Oak St, Toronto, ON M5H 2N2",
        date: "Sunday, July 13, 2025, 12:00 AM – 2:00 PM",
        dateISO: "2025-07-13",
        appliedDate: "2025-01-12",
        hours: "2 Hr",
        category: "Environment",
        status: "approved",
    },
    {
        id: 4,
        title: "Hospital Volunteer Program",
        location: "200 Elizabeth St, Toronto, ON M5G 2C4",
        date: "Monday, August 4, 2025, 9:00 AM – 1:00 PM",
        dateISO: "2025-08-04",
        appliedDate: "2025-01-18",
        hours: "4 Hr",
        category: "Healthcare",
        status: "pending",
    },
    {
        id: 5,
        title: "Youth Mentorship Session",
        location: "100 Queen's Park, Toronto, ON M5S 2C6",
        date: "Wednesday, July 23, 2025, 3:00 PM – 5:00 PM",
        dateISO: "2025-07-23",
        appliedDate: "2025-01-05",
        hours: "2 Hr",
        category: "Education",
        status: "approved",
    },
    {
        id: 6,
        title: "Animal Shelter Helper",
        location: "821 Progress Ave, Toronto, ON M1H 2X4",
        date: "Saturday, August 9, 2025, 10:00 AM – 2:00 PM",
        dateISO: "2025-08-09",
        appliedDate: "2025-01-20",
        hours: "4 Hr",
        category: "Animal Welfare",
        status: "denied",
    },
    {
        id: 7,
        title: "Senior Center Art Class Assistant",
        location: "55 Elm St, Toronto, ON M5G 1H1",
        date: "Thursday, July 17, 2025, 1:00 PM – 3:00 PM",
        dateISO: "2025-07-17",
        appliedDate: "2025-01-08",
        hours: "2 Hr",
        category: "Arts & Culture",
        status: "approved",
    },
    {
        id: 8,
        title: "Beach Cleanup Initiative",
        location: "1561 Lake Shore Blvd W, Toronto, ON M6K 3C1",
        date: "Sunday, August 17, 2025, 8:00 AM – 11:00 AM",
        dateISO: "2025-08-17",
        appliedDate: "2025-01-22",
        hours: "3 Hr",
        category: "Environment",
        status: "pending",
    },
]

// Saved opportunities
const savedOpportunities = [
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

const statusOptions = [
    { id: "approved", label: "Approved", color: statusColors.approved },
    { id: "pending", label: "Pending", color: statusColors.pending },
    { id: "denied", label: "Denied", color: statusColors.denied },
]

const sortOptions = [
    { id: "recent", label: "Most Recent" },
    { id: "oldest", label: "Oldest First" },
    { id: "az", label: "Alphabetical A-Z" },
    { id: "za", label: "Alphabetical Z-A" },
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

export default function ApplicationsPage() {
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [sortBy, setSortBy] = useState("recent")
    const [showMoreCategories, setShowMoreCategories] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const toggleStatus = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        )
    }

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        )
    }

    const clearFilters = () => {
        setSelectedStatuses([])
        setSelectedCategories([])
        setStartDate("")
        setEndDate("")
        setSortBy("recent")
        setSearchQuery("")
    }

    // Filter and sort applications
    const filteredApplications = useMemo(() => {
        let result = sampleApplications.filter((app) => {
            // Filter by status
            if (selectedStatuses.length > 0 && !selectedStatuses.includes(app.status)) {
                return false
            }

            // Filter by category
            if (selectedCategories.length > 0 && !selectedCategories.includes(app.category)) {
                return false
            }

            // Filter by date range (applied date)
            if (startDate) {
                const appDate = new Date(app.appliedDate)
                const filterStartDate = new Date(startDate)
                if (appDate < filterStartDate) return false
            }

            if (endDate) {
                const appDate = new Date(app.appliedDate)
                const filterEndDate = new Date(endDate)
                if (appDate > filterEndDate) return false
            }

            // Filter by search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    app.title.toLowerCase().includes(query) ||
                    app.location.toLowerCase().includes(query) ||
                    app.category.toLowerCase().includes(query) ||
                    app.status.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            return true
        })

        // Sort
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case "recent":
                    return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
                case "oldest":
                    return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
                case "az":
                    return a.title.localeCompare(b.title)
                case "za":
                    return b.title.localeCompare(a.title)
                default:
                    return 0
            }
        })

        return result
    }, [selectedStatuses, selectedCategories, startDate, endDate, sortBy, searchQuery])

    const displayedCategories = showMoreCategories ? eventCategories : eventCategories.slice(0, 4)

    const hasActiveFilters = selectedStatuses.length > 0 || selectedCategories.length > 0 || startDate || endDate || searchQuery || sortBy !== "recent"

    const FilterSidebar = () => (
        <div className="h-full overflow-y-auto pr-2 space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-card py-2 z-10">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-foreground" />
                    <h2 className="font-semibold text-lg">Filter</h2>
                </div>
            </div>

            {/* Clear Filters Button */}
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
                    {sortOptions.map((option) => (
                        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="sortBy"
                                checked={sortBy === option.id}
                                onChange={() => setSortBy(option.id)}
                                className="w-4 h-4 text-blue-500"
                            />
                            <span className="text-sm">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-border" />

            {/* Status Filter */}
            <div>
                <h3 className="font-medium text-sm mb-3">Application Status</h3>
                <div className="space-y-2">
                    {statusOptions.map((status) => (
                        <label key={status.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={selectedStatuses.includes(status.id)}
                                onCheckedChange={() => toggleStatus(status.id)}
                            />
                            <span className={`text-sm px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.color.bg} ${status.color.text} ${status.color.border}`}>
                                <status.color.icon className="w-3 h-3" />
                                {status.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-border" />

            {/* Category Filter */}
            <div>
                <h3 className="font-medium text-sm mb-3">Category</h3>
                <div className="space-y-2">
                    {displayedCategories.map((category) => {
                        const colors = categoryColors[category] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" }
                        return (
                            <label key={category} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedCategories.includes(category)}
                                    onCheckedChange={() => toggleCategory(category)}
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
                        onClick={() => setShowMoreCategories(!showMoreCategories)}
                        className="text-sm text-blue-500 hover:text-blue-600 mt-2 flex items-center gap-1"
                    >
                        {showMoreCategories ? (
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
                <h3 className="font-medium text-sm mb-3">Applied Date Range</h3>
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

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl mb-6 shadow-sm overflow-x-auto">
                        <div className="flex min-w-max">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab.id === "applications"
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
                        <h2 className="text-2xl font-bold text-foreground">My Applications</h2>
                        <p className="text-muted-foreground mt-1">
                            Track all your volunteer applications and their status
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

                    <div className="flex gap-6">
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

                        {/* Applications List */}
                        <div className="flex-1">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search applications by title, location, category, or status..."
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
                                Showing {filteredApplications.length} of {sampleApplications.length} applications
                            </p>

                            {/* Applications Cards */}
                            <div className="space-y-4">
                                {filteredApplications.map((app) => {
                                    const categoryColor = categoryColors[app.category] || { cardBg: "bg-gray-50 border-gray-200" }
                                    const statusColor = statusColors[app.status]
                                    const StatusIcon = statusColor.icon

                                    return (
                                        <div
                                            key={app.id}
                                            className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-md hover:shadow-lg transition-shadow duration-200 ${categoryColor.cardBg}`}
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
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Applied: {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    className="bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 hover:text-orange-800 rounded-full"
                                                >
                                                    View Posting
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Empty State */}
                            {filteredApplications.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                                        <FolderOpen className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">No applications found</h3>
                                    <p className="text-muted-foreground mt-2 mb-6">
                                        Try adjusting your filters to find more applications
                                    </p>
                                    <Button onClick={clearFilters} variant="outline" className="gap-2 rounded-full">
                                        <RotateCcw className="w-4 h-4" />
                                        Reset All Filters
                                    </Button>
                                </div>
                            )}

                            {/* Total Count */}
                            {filteredApplications.length > 0 && (
                                <p className="text-center mt-6 font-semibold">
                                    Total Applications: {filteredApplications.length}
                                </p>
                            )}
                        </div>

                        {/* Saved Opportunities - Right Column */}
                        <aside className="hidden xl:block w-72 flex-shrink-0">
                            <Card className="shadow-sm sticky top-24">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                            <Bookmark className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <h2 className="text-base font-semibold">Saved</h2>
                                    </div>

                                    <div className="space-y-3">
                                        {savedOpportunities.map((opp) => (
                                            <div
                                                key={opp.id}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                            >
                                                <div className={`w-8 h-8 rounded-lg ${opp.iconBg} flex items-center justify-center flex-shrink-0`}>
                                                    <opp.icon className={`w-4 h-4 ${opp.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-medium text-foreground line-clamp-2">
                                                        {opp.title}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {opp.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/opportunities"
                                        className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 mt-4"
                                    >
                                        View All Saved
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    )
}
