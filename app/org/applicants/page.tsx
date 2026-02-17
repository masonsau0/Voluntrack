"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
    ArrowLeft,
    Users,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    Mail,
    Calendar,
    MapPin,
    ChevronDown,
    Eye,
    X,
    FileText,
    User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Sample applicant data
const sampleApplicants = [
    {
        id: 1,
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "(416) 555-0101",
        appliedDate: "2025-07-15",
        status: "pending" as const,
        opportunity: "Trinity Bellwoods Park Clean-Up",
        category: "Environment",
        message: "I'm passionate about environmental conservation and have participated in several clean-up events before. I'd love to contribute to maintaining Trinity Bellwoods Park!",
        skills: ["Outdoor Work", "Teamwork"],
    },
    {
        id: 2,
        name: "Marcus Johnson",
        email: "marcus.j@email.com",
        phone: "(647) 555-0202",
        appliedDate: "2025-07-14",
        status: "approved" as const,
        opportunity: "Trinity Bellwoods Park Clean-Up",
        category: "Environment",
        message: "Looking to gain volunteer experience and contribute to the community.",
        skills: ["Physical Fitness", "Teamwork"],
    },
    {
        id: 3,
        name: "Priya Patel",
        email: "priya.p@email.com",
        phone: "(416) 555-0303",
        appliedDate: "2025-07-13",
        status: "pending" as const,
        opportunity: "Food Bank Sorting",
        category: "Community Outreach",
        message: "I have experience volunteering at food banks and sorting events. I'm available every Saturday morning!",
        skills: ["Organization", "Communication"],
    },
    {
        id: 4,
        name: "David Kim",
        email: "david.kim@email.com",
        phone: "(905) 555-0404",
        appliedDate: "2025-07-12",
        status: "rejected" as const,
        opportunity: "Community Garden Planting",
        category: "Environment",
        message: "Interested in gardening and sustainability. Would love to learn more about community gardens.",
        skills: ["Gardening", "Outdoor Work"],
    },
    {
        id: 5,
        name: "Emily Rodriguez",
        email: "emily.r@email.com",
        phone: "(416) 555-0505",
        appliedDate: "2025-07-11",
        status: "approved" as const,
        opportunity: "Beach Cleanup Drive",
        category: "Environment",
        message: "Environmental science student eager to make a real impact. I bring my own reusable gloves and bags!",
        skills: ["Teamwork", "Environmental Science"],
    },
    {
        id: 6,
        name: "Jordan Lee",
        email: "jordan.lee@email.com",
        phone: "(647) 555-0606",
        appliedDate: "2025-07-10",
        status: "pending" as const,
        opportunity: "Food Bank Sorting",
        category: "Community Outreach",
        message: "I want to help address food insecurity in our community. I can lift heavy boxes and have my own transportation.",
        skills: ["Physical Fitness", "Organization"],
    },
]

const statusConfig = {
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock },
    approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle },
    rejected: { label: "Declined", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle },
}

export default function ApplicantsPage() {
    const { userProfile, loading } = useAuth()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [applicants, setApplicants] = useState(sampleApplicants)
    const [selectedApplicant, setSelectedApplicant] = useState<typeof sampleApplicants[0] | null>(null)

    // Stats
    const totalApplicants = applicants.length
    const pendingCount = applicants.filter(a => a.status === "pending").length
    const approvedCount = applicants.filter(a => a.status === "approved").length
    const declinedCount = applicants.filter(a => a.status === "rejected").length

    // Filtered applicants
    const filteredApplicants = applicants.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.opportunity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || a.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const updateStatus = (id: number, newStatus: "approved" | "rejected") => {
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
        if (selectedApplicant?.id === id) {
            setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-sky-50">
            <Navigation />

            {/* Blue Header Bar */}
            <div className="pt-16 md:pt-20 bg-gradient-to-r from-sky-500 to-indigo-600 border-b border-sky-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <Link
                        href="/org/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                View Applicants
                            </h1>
                            <p className="text-sky-100 mt-0.5 text-sm">
                                Review and manage volunteer applications
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
                <div className="max-w-7xl mx-auto">

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-white border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">{totalApplicants}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Total Applicants</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-50 border border-amber-200 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                                <p className="text-xs text-amber-600 mt-0.5">Pending Review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-50 border border-emerald-200 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Approved</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-red-50 border border-red-200 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-red-700">{declinedCount}</p>
                                <p className="text-xs text-red-600 mt-0.5">Declined</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search applicants by name, email, or opportunity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white border-slate-200 rounded-xl h-11"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-11 rounded-xl border border-slate-200 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Declined</option>
                        </select>
                    </div>

                    {/* Applicants List */}
                    <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Applications
                                </h2>
                                <span className="text-sm font-medium text-white bg-white/20 px-3 py-1 rounded-full">
                                    {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            {filteredApplicants.length === 0 ? (
                                <div className="text-center py-16 px-6">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">No applicants found</h3>
                                    <p className="text-slate-500 mt-1">Try adjusting your search or filter.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {filteredApplicants.map((applicant) => {
                                        const status = statusConfig[applicant.status]
                                        const StatusIcon = status.icon

                                        return (
                                            <div
                                                key={applicant.id}
                                                className="p-5 hover:bg-sky-50/30 transition-colors duration-200 cursor-pointer"
                                                onClick={() => setSelectedApplicant(applicant)}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        {/* Avatar */}
                                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                                            {applicant.name.split(" ").map(n => n[0]).join("")}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <h3 className="font-semibold text-slate-900">{applicant.name}</h3>
                                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text} border ${status.border}`}>
                                                                    <StatusIcon className="w-3 h-3" />
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-600">{applicant.opportunity}</p>
                                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {applicant.email}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Applied {new Date(applicant.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        {applicant.status === "pending" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="rounded-lg h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                                                    onClick={(e) => { e.stopPropagation(); updateStatus(applicant.id, "approved") }}
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="rounded-lg h-8 px-3 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                                                                    onClick={(e) => { e.stopPropagation(); updateStatus(applicant.id, "rejected") }}
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                                                    Decline
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-lg h-8 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                                                            onClick={(e) => { e.stopPropagation(); setSelectedApplicant(applicant) }}
                                                        >
                                                            <Eye className="w-3.5 h-3.5 mr-1" />
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Applicant Detail Modal */}
            {selectedApplicant && (() => {
                const status = statusConfig[selectedApplicant.status]
                const StatusIcon = status.icon
                return (
                    <div
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedApplicant(null)}
                    >
                        <div
                            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                        {selectedApplicant.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">{selectedApplicant.name}</h2>
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text} border ${status.border}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedApplicant(null)}
                                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* Applied For */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Applied For</label>
                                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedApplicant.opportunity}</p>
                                    <span className="text-xs text-slate-500">{selectedApplicant.category}</span>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
                                        <p className="text-sm text-slate-900 mt-0.5 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {selectedApplicant.email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</label>
                                        <p className="text-sm text-slate-900 mt-0.5">{selectedApplicant.phone}</p>
                                    </div>
                                </div>

                                {/* Applied Date */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Applied Date</label>
                                    <p className="text-sm text-slate-900 mt-0.5 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {new Date(selectedApplicant.appliedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Skills</label>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {selectedApplicant.skills.map(skill => (
                                            <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Application Message</label>
                                    <div className="mt-1.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-700 leading-relaxed">{selectedApplicant.message}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedApplicant.status === "pending" && (
                                <div className="flex items-center gap-3 p-6 border-t border-slate-100">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                        onClick={() => updateStatus(selectedApplicant.id, "approved")}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Applicant
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl border-red-300 text-red-700 hover:bg-red-50"
                                        onClick={() => updateStatus(selectedApplicant.id, "rejected")}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Decline Applicant
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}
