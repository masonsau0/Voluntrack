import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, ClipboardCheck, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/student-volunteers-outdoor-park-clear-sky.jpg"
            alt="Student volunteers in community"
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-xl">
            <span className="text-sm font-medium tracking-widest uppercase mb-4 block">
              <span className="text-primary">Volun</span>
              <span className="text-orange-500">Track</span>
              <span className="text-primary"> Ontario</span>
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 text-balance">
              Volunteer <span className="italic text-primary">Your Way</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Quickly find volunteering opportunities that match your interests — make a difference in just a few
              clicks!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/collections">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base tracking-wider"
                >
                  Explore Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base tracking-wider border-foreground/20 bg-background/50 backdrop-blur-sm"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Who We Serve</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connecting students, schools, and organizations for meaningful volunteer experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/shop?category=students" className="group relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src="/student-with-laptop-searching-for-volunteer-opport.jpg"
                alt="Students"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                <h3 className="font-serif text-2xl md:text-3xl font-light mb-2">Students</h3>
                <p className="text-sm text-background/90">
                  Discover opportunities, track your hours, and build skills for your future
                </p>
              </div>
            </Link>

            <Link href="/shop?category=counsellors" className="group relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src="/guidance-counsellor-helping-students-in-office.jpg"
                alt="Guidance Counsellors"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                <h3 className="font-serif text-2xl md:text-3xl font-light mb-2">Guidance Counsellors</h3>
                <p className="text-sm text-background/90">
                  Approve hours, track student progress, and manage applications with ease
                </p>
              </div>
            </Link>

            <Link href="/shop?category=organizations" className="group relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src="/volunteer-organization-team-working-together-commu.jpg"
                alt="Volunteer Organizations"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
                <h3 className="font-serif text-2xl md:text-3xl font-light mb-2">Volunteer Organizations</h3>
                <p className="text-sm text-background/90">
                  Post opportunities, connect with eager volunteers, and verify completed hours
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Solution Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4 text-balance">
              Our Solutions
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Discover how <span className="text-primary">Volun</span>
              <span className="text-orange-500">Track</span>
              <span className="text-primary"> Ontario</span> streamlines the volunteer experience for everyone involved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Centralized Discovery</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    One platform to find all volunteer opportunities across Ontario — no more scattered searches or
                    outdated listings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Seamless Hour Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically log and verify volunteer hours with built-in approval workflows — no more paper forms
                    or lost records.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Connected Community</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bridge the gap between students, schools, and organizations with real-time communication and
                    updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">Time-Saving Efficiency</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Reduce administrative burden for counsellors and organizations with streamlined approvals and
                    automated reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
