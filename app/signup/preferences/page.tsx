"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { createStudentProfile, getStudentProfile, updateStudentProfile } from "@/lib/firebase/student-profiles"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { INTERESTS } from "@/lib/preferences"
import { cn } from "@/lib/utils"
import { SchoolSelector } from "@/components/school-selector"

export default function PreferencesPage() {
  const router = useRouter()
  const { user, userProfile, refreshProfile } = useAuth()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [interestLimitMessage, setInterestLimitMessage] = useState<string>("")
  const [submitError, setSubmitError] = useState<string>("")
  const [volunteerPreference, setVolunteerPreference] = useState("")
  const [availability, setAvailability] = useState("")
  const [school, setSchool] = useState("")

  const selectedInterestsRef = useRef<string[]>([])
  const volunteerPreferenceRef = useRef("")
  const availabilityRef = useRef("")
  const schoolRef = useRef("")
  useEffect(() => {
    selectedInterestsRef.current = selectedInterests
    volunteerPreferenceRef.current = volunteerPreference
    availabilityRef.current = availability
    schoolRef.current = school
  }, [selectedInterests, volunteerPreference, availability, school])

  const handleInterestToggle = (interestId: string) => {
    setSubmitError("")
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        setInterestLimitMessage("")
        return prev.filter((id) => id !== interestId)
      } else if (prev.length < 2) {
        setInterestLimitMessage("")
        return [...prev, interestId]
      } else {
        setInterestLimitMessage("You can only pick two.")
        return prev
      }
    })
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    const interests = selectedInterestsRef.current
    const volunteer = volunteerPreferenceRef.current
    const avail = availabilityRef.current
    const schoolName = schoolRef.current

    const missing: string[] = []
    if (interests.length === 0) {
      missing.push("Pick 1-2 interests in \"What are you most interested in?\"")
    }
    if (!volunteer) {
      missing.push("Choose an option in \"How do you prefer to Volunteer?\"")
    }
    if (!avail) {
      missing.push("Choose an option in \"When are you available?\"")
    }

    if (missing.length > 0) {
      setSubmitError("Please complete all sections before submitting: " + missing.join("; "))
      return
    }

    if (user?.uid && userProfile?.role === "student") {
      setIsSaving(true)
      try {
        const existing = await getStudentProfile(user.uid)
        const profileData = {
          interests,
          volunteerFormat: volunteer,
          availability: avail,
          ...(schoolName ? { school: schoolName } : {}),
        }
        if (existing) {
          await updateStudentProfile(user.uid, profileData)
        } else {
          await createStudentProfile(user.uid, profileData)
        }
        await refreshProfile()
        toast.success("Preferences saved successfully")
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to save preferences")
        setIsSaving(false)
        return
      }
      setIsSaving(false)
    }

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
            {submitError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {submitError}
              </div>
            )}

            {/* School Selector */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-3 block text-sky-900">
                What school do you attend?
              </Label>
              <SchoolSelector
                value={school}
                onChange={setSchool}
                placeholder="Search for your school..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* LEFT COLUMN - Interests */}
              <div>
                <Label className="text-base font-semibold mb-4 block text-sky-900">
                  What are you most interested in? (pick 1-2)
                </Label>
                {interestLimitMessage && (
                  <p className="text-sm text-amber-600 font-medium mb-3">{interestLimitMessage}</p>
                )}
                <div className="space-y-3">
                  {INTERESTS.map((interest) => {
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
                        onValueChange={(value) => {
                          setVolunteerPreference(value)
                          setSubmitError("")
                        }}
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
                        onValueChange={(value) => {
                          setAvailability(value)
                          setSubmitError("")
                        }}
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
                            No preference
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="submit"
                size="lg"
                className="px-12 bg-primary text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
