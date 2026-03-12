import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Search, ClipboardCheck, Users, Zap } from "lucide-react"

export default function RoleSelectionPage() {
  return (
    <div className="min-h-svh bg-background">
      <Navigation />

      <div className="pt-32 pb-12 px-6 md:px-10 flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto w-full space-y-12">

          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold">
              Welcome to{" "}
              <span className="font-serif font-normal text-primary">Volun</span>
              <span className="font-serif font-normal text-orange-500">Track</span>
              <span className="font-serif font-normal text-primary"> Ontario</span>
            </h1>
            <p className="text-lg text-muted-foreground font-serif">
              Select your role below to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Students Card */}
            <Link href="/login/student" className="group h-full block">
              <Card className="h-full overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/25 hover:-translate-y-2 border border-sky-100 hover:border-sky-300 shadow-lg shadow-sky-900/5 transform hover:scale-[1.02] hover:ring-2 hover:ring-sky-400 hover:ring-offset-2 bg-sky-50/30">
                <div className="relative h-64 overflow-hidden rounded-t-xl">
                  <Image
                    src="/student-with-laptop-searching-for-volunteer-opport.jpg"
                    alt="Student working on laptop"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105 brightness-105 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent z-10" />
                </div>
                <CardContent className="p-8 pb-4 flex-grow bg-sky-50/30 relative z-20 group-hover:bg-sky-100/60 transition-colors">
                  <h2 className="text-2xl font-serif text-sky-900 mb-3 group-hover:text-sky-700 transition-colors">Students</h2>
                  <p className="text-muted-foreground leading-relaxed text-sm font-serif">
                    Discover opportunities, track your hours, and build skills for your future
                  </p>
                </CardContent>
                <CardFooter className="p-8 pt-0 bg-sky-50/30 group-hover:bg-sky-100/60 transition-colors">
                  <Button asChild className="w-full text-base py-6 font-serif" size="lg">
                    <div>Log In as Student</div>
                  </Button>
                </CardFooter>
              </Card>
            </Link>

            {/* Volunteer Organizations Card */}
            <Link href="/login/organization" className="group h-full block">
              <Card className="h-full overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/25 hover:-translate-y-2 border border-sky-100 hover:border-sky-300 shadow-lg shadow-sky-900/5 transform hover:scale-[1.02] hover:ring-2 hover:ring-sky-400 hover:ring-offset-2 bg-sky-50/30">
                <div className="relative h-64 overflow-hidden rounded-t-xl">
                  <Image
                    src="/event-volunteer-fair.png"
                    alt="Volunteer organizations at community fair"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105 brightness-105 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent z-10" />
                </div>
                <CardContent className="p-8 pb-4 flex-grow bg-sky-50/30 relative z-20 group-hover:bg-sky-100/60 transition-colors">
                  <h2 className="text-2xl font-serif text-sky-900 mb-3 group-hover:text-sky-700 transition-colors">Volunteer Organizations</h2>
                  <p className="text-muted-foreground leading-relaxed text-sm font-serif">
                    Post opportunities, connect with eager volunteers, and verify completed hours
                  </p>
                </CardContent>
                <CardFooter className="p-8 pt-0 bg-sky-50/30 group-hover:bg-sky-100/60 transition-colors">
                  <Button asChild className="w-full text-base py-6 font-serif" size="lg">
                    <div>Manage Opportunities</div>
                  </Button>
                </CardFooter>
              </Card>
            </Link>

          </div>

          {/* Sign up prompt */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-base md:text-lg font-serif">
            <span className="text-foreground font-medium">Don&apos;t have an account?</span>
            <Button asChild size="lg" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-serif">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>

          {/* Our Solutions */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 mt-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4 text-balance">
                  Our Solutions
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto font-serif">
                  Discover how <span className="font-serif font-normal text-primary">Volun</span>
                  <span className="font-serif font-normal text-orange-500">Track</span>
                  <span className="font-serif font-normal text-primary"> Ontario</span> streamlines the volunteer experience for everyone involved.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Centralized Discovery - Green */}
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">Centralized Discovery</h3>
                      <p className="text-muted-foreground leading-relaxed font-serif">
                        One platform to find all volunteer opportunities across Ontario — no more scattered searches or
                        outdated listings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Integrated Hour Validation - Blue */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                      <ClipboardCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">Integrated Hour Validation</h3>
                      <p className="text-muted-foreground leading-relaxed font-serif">
                        A digitized verification system that replaces manual logging with secure, automated approval
                        workflows, ensuring data integrity and reducing the risk of lost records.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connected Community - Purple */}
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">Connected Community</h3>
                      <p className="text-muted-foreground leading-relaxed font-serif">
                        A collaborative interface designed to bridge communication gaps between students, educational
                        institutions, and community partners through real-time updates and synchronization.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gamified Milestones - Amber */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2 font-serif">Gamified Milestones</h3>
                      <p className="text-muted-foreground leading-relaxed font-serif">
                        Visualize your progress toward graduation requirements with automated reporting and celebrate every
                        hour you give back.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}