"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TreePine,
  GraduationCap,
  Heart,
  Palette,
  Home,
  Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"

const interests = [
  {
    id: "environment",
    label: "Environment",
    icon: TreePine,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    id: "arts-culture",
    label: "Arts & Culture",
    icon: Palette,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "senior-security",
    label: "Senior Security",
    icon: Home,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "mental-health",
    label: "Mental Health",
    icon: Brain,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
]

const locations = [
  "Toronto",
  "Ottawa",
  "Mississauga",
  "Brampton",
  "Hamilton",
  "London",
  "Markham",
  "Vaughan",
  "Kitchener",
  "Windsor",
]

export default function PreferencesPage() {
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [volunteerPreference, setVolunteerPreference] = useState("hybrid")
  const [availability, setAvailability] = useState("weekends")
  const [location, setLocation] = useState<string>("")

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId)
      } else if (prev.length < 2) {
        return [...prev, interestId]
      }
      return prev
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Preferences submitted", {
      interests: selectedInterests,
      volunteerPreference,
      availability,
      location,
    })
    // Redirect to opportunities page after preferences are saved
    router.push("/opportunities")
  }

  return (
    <div className="min-h-svh bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-sky-900 mb-2">
              Let's Personalize Your Volunteering Experience!
            </h1>
            <p className="text-lg text-muted-foreground">
              Help us match you to meaningful opportunities.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* LEFT COLUMN - Interests */}
              <div>
                <Label className="text-base font-semibold mb-4 block text-sky-900">
                  What are you most interested in? (pick 1-2)
                </Label>
                <div className="space-y-3">
                  {interests.map((interest) => {
                    const Icon = interest.icon
                    const isSelected = selectedInterests.includes(interest.id)
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => handleInterestToggle(interest.id)}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 transition-all text-left",
                          "hover:shadow-md",
                          isSelected
                            ? `${interest.bgColor} ${interest.borderColor} border-2 shadow-sm`
                            : "bg-sky-50 border-sky-200 hover:bg-sky-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-6 w-6",
                              isSelected ? interest.color : "text-sky-600"
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium",
                              isSelected ? "text-sky-900" : "text-sky-800"
                            )}
                          >
                            {interest.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN - Preferences */}
              <div className="space-y-6">
                {/* Volunteer Preference */}
                <div>
                  <Label className="text-base font-semibold mb-4 block text-sky-900">
                    How do you prefer to Volunteer?
                  </Label>
                  <Card className="bg-sky-50 border-sky-200">
                    <CardContent className="p-4">
                      <RadioGroup
                        value={volunteerPreference}
                        onValueChange={setVolunteerPreference}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hybrid" id="hybrid" />
                          <Label
                            htmlFor="hybrid"
                            className="font-normal cursor-pointer"
                          >
                            Hybrid
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label
                            htmlFor="in-person"
                            className="font-normal cursor-pointer"
                          >
                            In-person
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="remote" id="remote" />
                          <Label
                            htmlFor="remote"
                            className="font-normal cursor-pointer"
                          >
                            Remote
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no-preference" id="no-preference" />
                          <Label
                            htmlFor="no-preference"
                            className="font-normal cursor-pointer"
                          >
                            No preference
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Availability */}
                <div>
                  <Label className="text-base font-semibold mb-4 block text-sky-900">
                    When are you available?
                  </Label>
                  <Card className="bg-sky-50 border-sky-200">
                    <CardContent className="p-4">
                      <RadioGroup
                        value={availability}
                        onValueChange={setAvailability}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekends" id="weekends" />
                          <Label
                            htmlFor="weekends"
                            className="font-normal cursor-pointer"
                          >
                            Weekends
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekdays" id="weekdays" />
                          <Label
                            htmlFor="weekdays"
                            className="font-normal cursor-pointer"
                          >
                            Weekdays
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="any-time" id="any-time" />
                          <Label
                            htmlFor="any-time"
                            className="font-normal cursor-pointer"
                          >
                            Any time
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-base font-semibold mb-4 block text-sky-900">
                    Preferred Location(s)
                  </Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full bg-sky-50 border-sky-200">
                      <SelectValue placeholder="Choose Location(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="px-12 bg-primary text-primary-foreground"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
