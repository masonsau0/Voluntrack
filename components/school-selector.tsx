"use client"

import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Search, ChevronDown, Check, X, GraduationCap } from "lucide-react"
import { getSchools, School } from "@/lib/firebase/schools"

interface SchoolSelectorProps {
    value: string          // school name (string stored on student_profiles)
    onChange: (name: string) => void
    disabled?: boolean
    placeholder?: string
    className?: string
}

export function SchoolSelector({
    value,
    onChange,
    disabled = false,
    placeholder = "Search for your school...",
    className,
}: SchoolSelectorProps) {
    const [schools, setSchools] = useState<School[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Fetch schools once on mount
    useEffect(() => {
        let cancelled = false
        const fetchSchools = async () => {
            try {
                const data = await getSchools()
                if (!cancelled) setSchools(data)
            } catch (err) {
                console.error("Failed to fetch schools:", err)
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }
        fetchSchools()
        return () => { cancelled = true }
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSearch("")
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filtered = schools.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.address.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (school: School) => {
        onChange(school.name)
        setIsOpen(false)
        setSearch("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
        setSearch("")
    }

    // Display-only mode when disabled
    if (disabled) {
        return (
            <div className={cn(
                "flex items-center gap-2 rounded-full border border-input bg-background px-3 py-2 text-sm",
                className
            )}>
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">{value || "—"}</span>
            </div>
        )
    }

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger / display */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen(!isOpen)
                    setTimeout(() => inputRef.current?.focus(), 50)
                }}
                className={cn(
                    "w-full flex items-center gap-2 rounded-full border border-input bg-background px-3 py-2 text-sm",
                    "hover:bg-accent/50 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isOpen && "ring-2 ring-ring"
                )}
            >
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className={cn(
                    "flex-1 text-left truncate",
                    value ? "text-foreground" : "text-muted-foreground"
                )}>
                    {value || placeholder}
                </span>
                {value && (
                    <X
                        className="h-4 w-4 text-muted-foreground hover:text-foreground shrink-0"
                        onClick={handleClear}
                    />
                )}
                <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-input bg-background shadow-lg animate-in fade-in-0 zoom-in-95">
                    {/* Search input */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Type to search..."
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Results */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {isLoading ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                Loading schools...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No schools found
                            </div>
                        ) : (
                            filtered.map((school) => {
                                const isSelected = value === school.name
                                return (
                                    <button
                                        key={school.schoolId}
                                        type="button"
                                        onClick={() => handleSelect(school)}
                                        className={cn(
                                            "w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                                            "hover:bg-accent",
                                            isSelected && "bg-accent/50"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-medium truncate",
                                                isSelected && "text-primary"
                                            )}>
                                                {school.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {school.address}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
