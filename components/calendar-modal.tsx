"use client"

import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { UserApplication } from "@/lib/firebase/dashboard"

interface Event {
    id: string
    title: string
    date: Date
    time: string
    location: string
    type: "blue" | "teal" | "orange"
}

interface CalendarModalProps {
    children: React.ReactNode
    applications?: UserApplication[]
}

export function CalendarModal({ children, applications = [] }: CalendarModalProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    // Transform approved applications into calendar events
    const initialApprovedEvents: Event[] = applications
        .filter(app => app.status === "approved")
        .map(app => ({
            id: app.id,
            title: app.title,
            date: new Date(app.dateISO),
            time: (app.date || "").split(',').pop()?.trim() || "TBD",
            location: app.isExternal ? "External" : app.location?.split(',')[0],
            type: "blue" as const
        }))

    const [events, setEvents] = useState<Event[]>(initialApprovedEvents)

    // Re-sync events if applications change (e.g. after marking complete)
    React.useEffect(() => {
        const approvedEvents: Event[] = applications
            .filter(app => app.status === "approved")
            .map(app => ({
                id: app.id,
                title: app.title,
                date: new Date(app.dateISO),
                time: (app.date || "").split(',').pop()?.trim() || "TBD",
                location: app.isExternal ? "External" : app.location?.split(',')[0],
                type: "blue" as const
            }))
        setEvents(approvedEvents)
    }, [applications])

    // New Event Form State
    const [newEventTitle, setNewEventTitle] = useState("")
    const [newEventTime, setNewEventTime] = useState("")
    const [newEventType, setNewEventType] = useState<"blue" | "teal" | "orange">("blue")

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const handleAddEvent = () => {
        if (!newEventTitle || !newEventTime) return

        const newEvent: Event = {
            id: Math.random().toString(36).substr(2, 9),
            title: newEventTitle,
            date: selectedDate,
            time: newEventTime,
            location: "TBD", // Simplified for demo
            type: newEventType
        }

        setEvents([...events, newEvent])
        setNewEventTitle("")
        setNewEventTime("")
    }

    const handleDeleteEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id))
    }

    const selectedDateEvents = events.filter(e =>
        e.date.getDate() === selectedDate.getDate() &&
        e.date.getMonth() === selectedDate.getMonth() &&
        e.date.getFullYear() === selectedDate.getFullYear()
    )

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden sm:max-h-[850px]">
                <div className="flex h-full flex-col md:flex-row">
                    {/* Left Column: Calendar View - Expanded */}
                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-blue-600" />
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={prevMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="text-center font-semibold text-muted-foreground text-sm uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                            {/* Previous Month Padding */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`prev-${i}`} className="min-h-[100px] bg-muted/5 rounded-xl border border-transparent" />
                            ))}

                            {/* Current Month Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear()
                                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()
                                const dayEvents = events.filter(e => e.date.getDate() === day && e.date.getMonth() === currentDate.getMonth() && e.date.getFullYear() === currentDate.getFullYear())

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(date)}
                                        className={`min-h-[100px] flex flex-col rounded-xl border p-2 text-left relative transition-all hover:shadow-md ${isSelected ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50" : "hover:bg-muted/50"
                                            } ${isToday ? "bg-blue-50/50" : ""}`}
                                    >
                                        <span className={`text-sm font-semibold inline-flex w-7 h-7 items-center justify-center rounded-full mb-1 ${isToday ? "bg-blue-500 text-white" : "text-muted-foreground"}`}>
                                            {day}
                                        </span>
                                        <div className="flex-1 space-y-1 w-full overflow-hidden">
                                            {dayEvents.slice(0, 3).map((event, idx) => (
                                                <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded truncate w-full ${event.type === "blue" ? "bg-blue-100 text-blue-700" :
                                                    event.type === "teal" ? "bg-teal-100 text-teal-700" :
                                                        "bg-orange-100 text-orange-700"
                                                    }`}>
                                                    {event.time}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}

                            {/* Next Month Padding to complete 42 cells (6 rows) */}
                            {Array.from({ length: 42 - (daysInMonth + firstDayOfMonth) }).map((_, i) => (
                                <div key={`next-${i}`} className="min-h-[100px] bg-muted/5 rounded-xl border border-transparent" />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Details & Edit */}
                    <div className="w-full md:w-80 lg:w-96 bg-muted/10 p-6 flex flex-col h-full overflow-y-auto">
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-1">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <p className="text-sm text-muted-foreground">Manage your schedule</p>
                        </div>

                        {/* Event List for Selected Day */}
                        <div className="flex-1 space-y-4 mb-6">
                            {selectedDateEvents.length > 0 ? (
                                selectedDateEvents.map((event) => (
                                    <div key={event.id} className="bg-white p-3 rounded-lg border shadow-sm group relative">
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 hover:text-red-500 rounded"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${event.type === "blue" ? "bg-blue-500" :
                                                event.type === "teal" ? "bg-teal-500" :
                                                    "bg-orange-500"
                                                }`} />
                                            {event.title}
                                        </h4>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {event.time}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.location}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm bg-white/50 rounded-lg border border-dashed">
                                    No events for this day
                                </div>
                            )}
                        </div>

                        {/* Add Event Form */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add New Event
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="title" className="text-xs">Event Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Community Service"
                                        value={newEventTitle}
                                        onChange={(e) => setNewEventTitle(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="time" className="text-xs">Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={newEventTime}
                                        onChange={(e) => setNewEventTime(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="type" className="text-xs">Type</Label>
                                    <Select value={newEventType} onValueChange={(v: any) => setNewEventType(v)}>
                                        <SelectTrigger className="h-8 text-sm">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="blue">Regular Shift</SelectItem>
                                            <SelectItem value="teal">Training</SelectItem>
                                            <SelectItem value="orange">Special Event</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAddEvent} className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white mt-2">
                                    Add to Schedule
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
