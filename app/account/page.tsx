"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Sparkles,
    TrendingUp,
    FileText,
    User,
    Settings,
    ArrowRight,
    Award,
    Pencil,
    GraduationCap,
} from "lucide-react"

// Dashboard tabs
const tabs = [
    { id: "progress", label: "Progress Tracking", icon: TrendingUp, href: "/dashboard" },
    { id: "applications", label: "Applications", icon: FileText, href: "/applications" },
    { id: "account", label: "My Account", icon: User, href: "/account" },
    { id: "preferences", label: "Preferences", icon: Settings, href: "/signup/preferences" },
]

// Sample user data
const userData = {
    firstName: "John",
    lastName: "Doe",
}

const schoolData = {
    school: "University of Waterloo",
    studentId: "20845678",
    grade: "4A",
    email: "john.doe@uwaterloo.ca",
}

export default function AccountPage() {
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
            <Navigation />

            <main className="flex-1 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Header - Same as Dashboard */}
                    <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            {/* Welcome Message and Button */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, John!</h1>
                                        <p className="text-muted-foreground mt-1">Ready to make a difference today?</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats in Banner */}
                            <div className="flex flex-wrap gap-4">
                                {/* Completed Opportunities Stat */}
                                <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                                    <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-teal-600 font-medium">Completed</p>
                                        <p className="text-xl font-bold text-teal-700">5</p>
                                    </div>
                                </div>

                                {/* Pending Applications Stat */}
                                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-orange-600 font-medium">Pending</p>
                                        <p className="text-xl font-bold text-orange-700">3</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl mb-6 shadow-sm overflow-x-auto">
                        <div className="flex w-full">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab.id === "account"
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
                        <h2 className="text-2xl font-bold text-foreground">My Account</h2>
                        <p className="text-muted-foreground mt-1">
                            View and manage your personal information
                        </p>
                    </div>

                    {/* Account Information Cards */}
                    <div className="space-y-6">
                        {/* User Information Card */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold">User Information</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">First Name</p>
                                        <p className="font-medium text-foreground">{userData.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Last Name</p>
                                        <p className="font-medium text-foreground">{userData.lastName}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* School Information Card */}
                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold">School Information</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">School</p>
                                        <p className="font-medium text-foreground">{schoolData.school}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Student ID</p>
                                        <p className="font-medium text-foreground">{schoolData.studentId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Grade</p>
                                        <p className="font-medium text-foreground">{schoolData.grade}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                                        <p className="font-medium text-foreground">{schoolData.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
