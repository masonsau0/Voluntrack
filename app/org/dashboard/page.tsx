"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getOrgOpportunities, getOrgApplicants } from "@/lib/firebase/org"
import { Opportunity } from "@/lib/firebase/opportunities"
import { UserApplication } from "@/lib/firebase/dashboard"
import { categoryColors, defaultCategoryColor, commitmentColors } from "@/lib/ui-config"
import {
    BarChart3,
    Users,
    FileText,
    TrendingUp,
    Plus,
    ArrowUpRight,
    Calendar,
    MapPin,
    Clock,
    Eye,
    Leaf,
    GraduationCap,
    Heart,
    Dog,
    Palette,
    Stethoscope,
    X,
    Zap,
    Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"



export default function OrgDashboardPage() {
    const { user, userProfile, loading: authLoading } = useAuth()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [applicants, setApplicants] = useState<UserApplication[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            const uid = userProfile?.uid ?? user?.uid
            if (uid) {
                try {
                    const [oppsData, appsData] = await Promise.all([
                        getOrgOpportunities(uid),
                        getOrgApplicants(uid)
                    ]);
                    if (mounted) {
                        setOpportunities(oppsData);
                        setApplicants(appsData);
                        setLoadingData(false);
                    }
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                    if (mounted) setLoadingData(false);
                }
            } else if (!authLoading) {
                if (mounted) setLoadingData(false);
            }
        };
        fetchData();
        return () => { mounted = false; }
    }, [userProfile?.uid, user?.uid, authLoading]);

    const getApplicantCount = (opportunityId: string) => {
        return applicants.filter(a => a.opportunityId === opportunityId).length;
    };

    // Analytics calculations
    const totalPostings = opportunities.length
    const totalApplicants = applicants.length
    const totalHours = opportunities.reduce((sum, p) => sum + (p.hours || 0), 0)
    const activePostings = opportunities.length

    // Category breakdown
    const categoryBreakdown = opportunities.reduce(
        (acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1
            return acc
        },
        {} as { [key: string]: number }
    )

    // Recent activity
    const recentPostings = [...opportunities]
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
        .slice(0, 3)

    // Postings for selected category
    const categoryPostings = selectedCategory
        ? opportunities.filter((p) => p.category === selectedCategory)
        : []

    return (
        <div className="min-h-screen flex flex-col bg-slate-100/60 relative overflow-hidden group/container">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8s]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.08] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <Navigation />

            <main className="flex-1 pt-20 md:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                            Organization Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {authLoading || loadingData ? "Loading..." : `Welcome back, ${userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : "Organization"}`}
                        </p>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <Link href="/org/opportunities/new?from=dashboard" className="group">
                            <Card className="h-full bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 border-0 shadow-lg group-hover:shadow-[0_25px_50px_-12px_rgba(14,165,233,0.5)] transition-all duration-500 group-hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="p-7 flex items-center gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl group-hover:rotate-3">
                                        <Plus className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl">Post Opportunity</h3>
                                        <p className="text-sky-100/90 text-sm mt-0.5 font-medium">Create a new posting</p>
                                    </div>
                                    <ArrowUpRight className="w-6 h-6 text-white/40 ml-auto group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/org/opportunities?view=manage&from=dashboard" className="group">
                            <Card className="h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 border-0 shadow-lg group-hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.5)] transition-all duration-500 group-hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="p-7 flex items-center gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl group-hover:rotate-3">
                                        <Eye className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl">Manage Postings</h3>
                                        <p className="text-indigo-100/90 text-sm mt-0.5 font-medium">View & edit your listings</p>
                                    </div>
                                    <ArrowUpRight className="w-6 h-6 text-white/40 ml-auto group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/org/applicants" className="group">
                            <Card className="h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 border-0 shadow-lg group-hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] transition-all duration-500 group-hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="p-7 flex items-center gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl group-hover:rotate-3">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl">View Applicants</h3>
                                        <p className="text-emerald-100/90 text-sm mt-0.5 font-medium">Review applications</p>
                                    </div>
                                    <ArrowUpRight className="w-6 h-6 text-white/40 ml-auto group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <Card className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden group relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]" />
                            <CardContent className="p-6 pt-7.5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-sky-100/80 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm">
                                        <FileText className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100/50 flex items-center gap-1 shadow-sm">
                                        <TrendingUp className="w-3 h-3" />
                                        Active
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 drop-shadow-sm">{totalPostings}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest opacity-80">Total Postings</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden group relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                            <CardContent className="p-6 pt-7.5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100/80 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100/50 shadow-sm">
                                        All Time
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 drop-shadow-sm">{totalApplicants}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest opacity-80">Total Applicants</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden group relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                            <CardContent className="p-6 pt-7.5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100/80 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-100/50 shadow-sm">
                                        Offered
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 drop-shadow-sm">{totalHours}h</p>
                                <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest opacity-80">Volunteer Hours</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden group relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                            <CardContent className="p-6 pt-7.5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100/80 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm">
                                        <BarChart3 className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100/50 shadow-sm">
                                        Live
                                    </span>
                                </div>
                                <p className="text-4xl font-bold text-slate-900 drop-shadow-sm">{activePostings}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest opacity-80">Active Postings</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Category Breakdown */}
                        <Card className="lg:col-span-1 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-xl overflow-hidden group relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200/50 group-hover:bg-sky-400 transition-colors duration-500" />
                            <CardContent className="p-6 pt-7.5">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-sky-500" />
                                    Postings by Category
                                </h2>
                                <div className="space-y-4">
                                    {Object.entries(categoryBreakdown).map(([category, count]) => {
                                        const colors = categoryColors[category] || defaultCategoryColor
                                        const Icon = colors.icon
                                        const percentage = Math.round((count / totalPostings) * 100)

                                        return (
                                            <button
                                                key={category}
                                                className="group/item flex items-center gap-4 w-full text-left bg-slate-100/30 hover:bg-white p-3 rounded-full border border-transparent hover:border-slate-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                onClick={() => setSelectedCategory(category)}
                                            >
                                                <div className={`w-11 h-11 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 shadow-sm border border-white/20`}>
                                                    <Icon className={`w-5 h-5 ${colors.text}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-sm font-bold text-slate-700 truncate">{category}</span>
                                                        <span className="text-sm font-bold text-slate-900 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200/50 shadow-sm">{count}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200/40 rounded-full h-2.5 overflow-hidden border border-slate-100/50">
                                                        <div
                                                            className="h-full rounded-full bg-sky-500 transition-all duration-1000 ease-out group-hover/item:brightness-110 shadow-[0_0_8px_-2px_rgba(0,0,0,0.1)]"
                                                            style={{ width: `${percentage}%`, backgroundColor: colors.leftColor }}
                                                        />
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Postings */}
                        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-xl overflow-hidden group relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200/50 group-hover:bg-indigo-400 transition-colors duration-500" />
                            <CardContent className="p-6 pt-7.5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        Recent Postings
                                    </h2>
                                    <Link
                                        href="/org/opportunities?view=manage"
                                        className="text-sm text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 transition-all hover:gap-2"
                                    >
                                        View All
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {recentPostings.map((posting) => {
                                        const colors = categoryColors[posting.category] || defaultCategoryColor
                                        const Icon = colors.icon

                                        return (
                                            <div
                                                key={posting.id}
                                                className="group/post flex items-start gap-4 p-5 rounded-3xl bg-slate-100/30 hover:bg-white border border-transparent hover:border-slate-200/50 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                                                style={{ borderLeftWidth: '6px', borderLeftStyle: 'solid', borderLeftColor: colors.leftColor }}
                                                onClick={() => setSelectedOpportunity(posting)}
                                            >
                                                <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/post:rotate-3 transition-transform duration-300 shadow-sm border border-white/20`}>
                                                    <Icon className={`w-6 h-6 ${colors.text}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-base tracking-tight group-hover/post:text-sky-700 transition-colors">{posting.title}</h3>
                                                            <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-widest opacity-80">{posting.organization}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm flex-shrink-0 group-hover/post:border-sky-200 group-hover/post:bg-sky-50 transition-all font-bold text-slate-800">
                                                            <Users className="w-4 h-4 text-sky-500" />
                                                            {getApplicantCount(posting.id)}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-xs font-bold text-slate-600">
                                                        <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-slate-200/40 shadow-sm">
                                                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                                            {posting.location.split(",")[0]}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-slate-200/40 shadow-sm">
                                                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                                                            {posting.date}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-slate-200/40 shadow-sm">
                                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                            {posting.hours} Hr
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Category Postings Popup */}
            {selectedCategory && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedCategory(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const colors = categoryColors[selectedCategory as string] || defaultCategoryColor
                                    const Icon = colors.icon
                                    return (
                                        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                                            <Icon className={`w-5 h-5 ${colors.text}`} />
                                        </div>
                                    )
                                })()}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">{selectedCategory}</h2>
                                    <p className="text-sm text-slate-500">{categoryPostings.length} posting{categoryPostings.length !== 1 ? "s" : ""}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Postings List */}
                        <div className="p-4 space-y-3">
                            {categoryPostings.map((posting) => {
                                const colors = categoryColors[posting.category] || defaultCategoryColor
                                return (
                                    <div
                                        key={posting.id}
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setSelectedOpportunity(posting);
                                        }}
                                        className="block p-4 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all duration-200 cursor-pointer"
                                    >
                                        <h3 className="font-bold text-slate-900 tracking-tight">{posting.title}</h3>
                                        <p className="text-sm text-slate-500 mt-0.5">{posting.organization}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {posting.location.split(",")[0]}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {posting.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {posting.hours} Hr
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {getApplicantCount(posting.id)} applicants
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Opportunity Detail Modal */}
            {selectedOpportunity && (
                <div
                    className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-24"
                    onClick={() => setSelectedOpportunity(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-xl w-full max-h-[calc(100vh-160px)] overflow-y-auto shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Header */}
                        <div className="relative h-48 sm:h-64 w-full">
                            <Image
                                src={selectedOpportunity.image || "/opportunity-placeholder.jpg"}
                                alt={selectedOpportunity.title}
                                fill
                                className="object-cover"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${categoryColors[selectedOpportunity.category]?.heroGradient || 'from-slate-900/80 to-transparent'}`} />
                            <button
                                onClick={() => setSelectedOpportunity(null)}
                                className="absolute top-4 right-4 w-11 h-11 bg-white/95 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg border border-white hover:border-slate-300 text-slate-800 hover:text-black hover:scale-110 active:scale-95 active:bg-slate-100"
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
                                <p className="text-white/90 drop-shadow font-medium">{selectedOpportunity.organization}</p>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryColors[selectedOpportunity.category]?.bg} ${categoryColors[selectedOpportunity.category]?.text} border ${categoryColors[selectedOpportunity.category]?.border}`}>
                                    {selectedOpportunity.category}
                                </span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${commitmentColors[selectedOpportunity.commitment]?.bg || "bg-slate-100"} ${commitmentColors[selectedOpportunity.commitment]?.text || "text-slate-700"} border border-slate-200`}>
                                    {selectedOpportunity.commitment}
                                </span>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                    {selectedOpportunity.hours} hours
                                </span>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-100 shadow-sm">
                                    <p className="text-2xl font-bold text-sky-700">{selectedOpportunity.spotsLeft}</p>
                                    <p className="text-xs font-medium text-sky-600 mt-0.5">Spots Remaining</p>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200 shadow-sm">
                                    <p className="text-2xl font-bold text-slate-700">{selectedOpportunity.totalSpots}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">Total Capacity</p>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors shadow-sm">
                                        <Calendar className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm tracking-tight">{selectedOpportunity.date}</p>
                                        <p className="text-xs text-slate-500 font-medium">{selectedOpportunity.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors shadow-sm">
                                        <MapPin className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 tracking-tight">{selectedOpportunity.location}</p>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="mb-8 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 mb-3 tracking-tight">Helpful Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedOpportunity.skills.map((skill) => (
                                        <span key={skill} className="text-xs font-medium px-3 py-1 bg-white text-slate-600 rounded-lg border border-slate-200 shadow-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-900 mb-2 tracking-tight">About This Opportunity</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    {selectedOpportunity.description}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-full py-6 text-sm font-bold border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
                                    onClick={() => setSelectedOpportunity(null)}
                                >
                                    Close
                                </Button>
                                <Link href="/org/opportunities?view=manage" className="flex-1">
                                    <Button className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-full py-6 text-sm font-bold transition-all shadow-md hover:shadow-lg">
                                        Manage Posting
                                        <ArrowUpRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
