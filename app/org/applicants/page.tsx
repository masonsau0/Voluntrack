"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { getOrgApplicants, OrgApplicant } from "@/lib/firebase/org"
import { updateApplicationStatus } from "@/lib/firebase/dashboard"
import { toast } from "sonner"
import { useEffect } from "react"
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

import { statusColors } from "@/lib/ui-config"
export default function ApplicantsPage() {
    const { user, userProfile, loading: authLoading } = useAuth()
    const uid = userProfile?.uid ?? user?.uid
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [applicants, setApplicants] = useState<OrgApplicant[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [selectedApplicant, setSelectedApplicant] = useState<OrgApplicant | null>(null)
    const [decisionPending, setDecisionPending] = useState<{
        applicant: OrgApplicant;
        intent: "approved" | "denied";
    } | null>(null)
    const [decisionMessage, setDecisionMessage] = useState("")
    const [contactName, setContactName] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [contactPhone, setContactPhone] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            if (uid) {
                try {
                    const apps = await getOrgApplicants(uid);
                    if (mounted) {
                        setApplicants(apps);
                        setLoadingData(false);
                    }
                } catch (error) {
                    console.error("Error fetching applicants:", error);
                    if (mounted) setLoadingData(false);
                }
            } else if (!authLoading) {
                if (mounted) setLoadingData(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [userProfile?.uid, user?.uid, authLoading]);

    // Stats
    const totalApplicants = applicants.length
    const pendingCount = applicants.filter(a => a.status === "pending").length
    const approvedCount = applicants.filter(a => a.status === "approved").length
    const completedCount = applicants.filter(a => a.status === "completed").length
    const declinedCount = applicants.filter(a => a.status === "denied").length

    // Filtered applicants
    const filteredApplicants = applicants.filter(a => {
        const matchesSearch = a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || a.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const openDecision = (applicant: OrgApplicant, intent: "approved" | "denied") => {
        setDecisionPending({ applicant, intent })
        setDecisionMessage("")
        setContactName(""); setContactEmail(""); setContactPhone("")
    }

    const confirmDecision = async () => {
        if (!decisionPending || submitting) return
        setSubmitting(true)
        const { applicant, intent } = decisionPending
        try {
            await updateApplicationStatus(applicant.userId, applicant.opportunityId, intent, {
                decisionMessage: decisionMessage.trim() || undefined,
                ...(intent === "approved" ? {
                    orgContactName:  contactName.trim()  || undefined,
                    orgContactEmail: contactEmail.trim() || undefined,
                    orgContactPhone: contactPhone.trim() || undefined,
                } : {})
            })
            setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: intent } : a))
            if (selectedApplicant?.id === applicant.id)
                setSelectedApplicant(prev => prev ? { ...prev, status: intent } : null)
            toast.success(`Application ${intent === "approved" ? "approved" : "declined"}!`)
            setDecisionPending(null)
        } catch {
            toast.error("Failed to update status")
        } finally {
            setSubmitting(false)
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
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        <Card className="bg-white border-0 shadow-md">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">{totalApplicants}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Total</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-teal-50 border border-teal-200 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-teal-700">{completedCount}</p>
                                <p className="text-xs text-teal-600 mt-0.5">Completed</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-50 border border-emerald-200 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Approved</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-50 border border-amber-200 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                                <p className="text-xs text-amber-600 mt-0.5">Pending</p>
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
                                className="pl-10 bg-white border-slate-200 rounded-full h-11"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-11 rounded-full border border-slate-200 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="denied">Declined</option>
                        </select>
                    </div>

                    {/* Applicants List */}
                    <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
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
                                        const status = statusColors[applicant.status as keyof typeof statusColors] || statusColors.pending
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
                                                            {applicant.userName.split(" ").map((n: string) => n[0]).join("")}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <h3 className="font-bold text-slate-900 tracking-tight">{applicant.userName}</h3>
                                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text} border ${status.border}`}>
                                                                    <StatusIcon className="w-3 h-3" />
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-600">{applicant.title}</p>
                                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {applicant.userEmail}
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
                                                                    className="rounded-full h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                                                    onClick={(e) => { e.stopPropagation(); openDecision(applicant, "approved") }}
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="rounded-full h-8 px-3 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-900 hover:border-red-400 text-xs transition-colors"
                                                                    onClick={(e) => { e.stopPropagation(); openDecision(applicant, "denied") }}
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                                                    Decline
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-full h-8 px-3 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 hover:border-slate-300 text-xs transition-colors"
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
                const status = statusColors[selectedApplicant.status as keyof typeof statusColors] || statusColors.pending
                const StatusIcon = status.icon
                return (
                    <div
                        className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-24"
                        onClick={() => setSelectedApplicant(null)}
                    >
                        <div
                            className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100vh-160px)] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                        {selectedApplicant.userName.split(" ").map((n: string) => n[0]).join("")}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{selectedApplicant.userName}</h2>
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
                                    <p className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">{selectedApplicant.title}</p>
                                    <span className="text-xs text-slate-500">{selectedApplicant.category}</span>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
                                        <p className="text-sm text-slate-900 mt-0.5 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {selectedApplicant.userEmail}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</label>
                                        <p className="text-sm text-slate-900 mt-0.5">{selectedApplicant.userPhone || "Not provided"}</p>
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
                                        {(selectedApplicant.skills || []).map(skill => (
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
                                        {selectedApplicant.message ? (
                                            <p className="text-sm text-slate-700 leading-relaxed">{selectedApplicant.message}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No message provided</p>
                                        )}
                                    </div>
                                </div>

                                {/* Self-reported experience */}
                                {(selectedApplicant.hadSimilarWork || selectedApplicant.hadWorkedWithOrg || selectedApplicant.hadFieldExperience) && (
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Self-Reported Experience</label>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {selectedApplicant.hadSimilarWork && (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                                    Done similar work
                                                </span>
                                            )}
                                            {selectedApplicant.hadWorkedWithOrg && (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                                                    Worked with org before
                                                </span>
                                            )}
                                            {selectedApplicant.hadFieldExperience && (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                                                    Field experience
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {selectedApplicant.status === "pending" && (
                                <div className="flex items-center gap-3 p-6 border-t border-slate-100">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                                        onClick={() => openDecision(selectedApplicant, "approved")}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Applicant
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-full border-red-300 text-red-700 hover:bg-red-100 hover:text-red-900 hover:border-red-400 transition-colors"
                                        onClick={() => openDecision(selectedApplicant, "denied")}
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

            {/* Decision Dialog */}
            {decisionPending && (
                <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-24"
                     onClick={() => !submitting && setDecisionPending(null)}>
                    <div 
                        className="bg-white rounded-2xl max-w-md w-full max-h-[calc(100vh-160px)] overflow-y-auto shadow-2xl" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {decisionPending.intent === "approved" ? "Approve Applicant" : "Decline Applicant"}
                            </h2>
                            <button onClick={() => !submitting && setDecisionPending(null)}
                                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                <X className="w-4 h-4 text-slate-600" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Optional message */}
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                    Message to Applicant <span className="normal-case text-slate-400">(optional)</span>
                                </label>
                                <textarea
                                    value={decisionMessage}
                                    onChange={e => setDecisionMessage(e.target.value)}
                                    placeholder={decisionPending.intent === "approved"
                                        ? "e.g. Welcome! Please arrive 10 minutes early..."
                                        : "e.g. Thank you for applying. Unfortunately..."}
                                    className="mt-1.5 w-full min-h-[90px] px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Contact info — approval only */}
                            {decisionPending.intent === "approved" && (
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Coordinator Contact <span className="normal-case text-slate-400">(shown to student on approval)</span>
                                    </p>
                                    <input value={contactName} onChange={e => setContactName(e.target.value)}
                                        placeholder="Coordinator name"
                                        className="w-full h-10 px-3 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                    <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                                        placeholder="Coordinator email"
                                        type="email"
                                        className="w-full h-10 px-3 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                    <input value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                                        placeholder="Phone number (optional)"
                                        type="tel"
                                        className="w-full h-10 px-3 text-sm rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 border-t border-slate-100">
                            <Button variant="outline" className="flex-1 rounded-full"
                                    onClick={() => setDecisionPending(null)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                className={`flex-1 rounded-full text-white ${decisionPending.intent === "approved" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                                onClick={confirmDecision} disabled={submitting}>
                                {submitting ? "Saving..." : decisionPending.intent === "approved" ? "Confirm Approval" : "Confirm Decline"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
