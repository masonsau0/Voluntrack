"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Sparkles,
    TrendingUp,
    FileText,
    FolderOpen,
    Newspaper,
    User,
    Settings,
    ArrowRight,
    Award,
    BarChart3,
    Upload,
    ChevronDown,
} from "lucide-react"

// Dashboard tabs
const tabs = [
    { id: "progress", label: "Progress Tracking", icon: TrendingUp, href: "/dashboard" },
    { id: "applications", label: "Applications", icon: FileText, href: "/applications" },
    { id: "forms", label: "Submit Own Form", icon: FolderOpen, href: "/submit-form" },
    { id: "account", label: "My Account", icon: User, href: "/account" },
    { id: "preferences", label: "Preferences", icon: Settings, href: "/dashboard" },
]

const categories = [
    "Environment",
    "Community Outreach",
    "Education",
    "Healthcare",
    "Animal Welfare",
    "Arts & Culture",
    "Youth Programs",
    "Senior Care",
]

export default function SubmitFormPage() {
    const [formData, setFormData] = useState({
        organizationName: "",
        opportunityTitle: "",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        category: "Environment",
        volunteerHours: "",
        volunteerContactName: "",
        email: "",
        phone: "",
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Form submitted:", formData, selectedFile)
        // Handle form submission
    }

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
                                <div className="mt-4 ml-16">
                                    <Link href="/opportunities">
                                        <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 rounded-full">
                                            <FolderOpen className="w-4 h-4" />
                                            View Opportunities
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
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
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab.id === "forms"
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

                    {/* Form Card */}
                    <Card className="shadow-sm max-w-2xl mx-auto !py-0 !gap-0 overflow-hidden">
                        <CardContent className="p-0">
                            {/* Form Header */}
                            <div className="bg-blue-500 text-white px-6 py-3 rounded-t-xl">
                                <h2 className="font-semibold">Submit Your Own Experience</h2>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Organization Name */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Organization Name
                                    </label>
                                    <Input
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        className="border-2 rounded-lg"
                                    />
                                </div>

                                {/* Opportunity Title */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Opportunity Title
                                    </label>
                                    <Input
                                        name="opportunityTitle"
                                        value={formData.opportunityTitle}
                                        onChange={handleChange}
                                        className="border-2 rounded-lg"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Location
                                    </label>
                                    <Input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="border-2 rounded-lg"
                                    />
                                </div>

                                {/* Date and Time Row */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Start Date
                                        </label>
                                        <Input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            End Date
                                        </label>
                                        <Input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Start Time
                                        </label>
                                        <Input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            End Time
                                        </label>
                                        <Input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Category and Volunteer Hours Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Volunteer Hours
                                        </label>
                                        <Input
                                            name="volunteerHours"
                                            value={formData.volunteerHours}
                                            onChange={handleChange}
                                            placeholder="e.g. 2"
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Volunteer Contact Name */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Volunteer Contact Name
                                    </label>
                                    <Input
                                        name="volunteerContactName"
                                        value={formData.volunteerContactName}
                                        onChange={handleChange}
                                        className="border-2 rounded-lg"
                                    />
                                </div>

                                {/* Email and Phone Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Phone #
                                        </label>
                                        <Input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="border-2 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Upload Evidence */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2 text-center">
                                        Upload Evidence
                                    </label>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                        <input
                                            type="file"
                                            id="evidence"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*,.pdf,.doc,.docx"
                                        />
                                        <label htmlFor="evidence" className="cursor-pointer">
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="w-8 h-8 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {selectedFile ? selectedFile.name : "Upload a file"}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center pt-2">
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-2 rounded-full"
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
