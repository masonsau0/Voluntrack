import { Navigation } from "@/components/navigation"
import { Search, ClipboardCheck, Users, Zap, Heart, GraduationCap } from "lucide-react"


export default function OrgAboutPage() {
    return (
        <div className="min-h-screen">
            <Navigation />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-24">
                    <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-background/80 z-10" />
                    <img
                        src="/student-volunteers-outdoor-park-clear-sky.jpg"
                        alt="Student volunteers making a difference"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="relative z-20 text-center px-4 max-w-3xl mx-auto">
                        <h1 className="font-serif text-5xl md:text-7xl font-light text-foreground mb-6 text-balance">
                            About <span className="font-serif font-normal text-primary">Volun</span><span className="font-serif font-normal text-orange-500">Track</span>
                        </h1>
                        <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
                            Connecting Ontario students with meaningful volunteer opportunities
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">Our Mission</h2>
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p>
                                <span className="font-serif font-normal text-primary">Volun</span><span className="font-serif font-normal text-orange-500">Track</span> <span className="font-serif font-normal text-primary">Ontario</span> was created to solve a common challenge: connecting students with volunteer opportunities
                                while making it easy to track and verify their community service hours. We believe every student deserves
                                access to meaningful volunteer experiences that build skills, create connections, and make a real difference.
                            </p>
                            <p>
                                Our platform bridges the gap between eager student volunteers, schools that need to track volunteer hours,
                                and organizations looking for dedicated helpers. By centralizing the entire volunteer journey—from discovery
                                to hour verification—we make volunteering simpler and more impactful for everyone involved.
                            </p>
                            <p>
                                Whether you're a student looking to fulfill your 40-hour graduation requirement, a guidance counsellor
                                managing applications, or an organization seeking volunteers, <span className="font-serif font-normal text-primary">Volun</span><span className="font-serif font-normal text-orange-500">Track</span> <span className="font-serif font-normal text-primary">Ontario</span> is here to help you
                                make a difference in your community.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Who We Serve */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Who We Serve</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            <span className="font-serif font-normal text-primary">Volun</span><span className="font-serif font-normal text-orange-500">Track</span> <span className="font-serif font-normal text-primary">Ontario</span> connects students and organizations to create meaningful volunteer experiences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Students */}
                        <div className="p-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-6">
                                <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-serif text-2xl font-light text-foreground mb-4">Students</h3>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Discover volunteer opportunities, apply directly through the platform, and track your hours toward
                                graduation requirements.
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Browse opportunities by category and location</li>
                                <li>• Apply with one click</li>
                                <li>• Track hours and earn badges</li>
                                <li>• Submit your own volunteer experiences</li>
                            </ul>
                        </div>

                        {/* Organizations */}
                        <div className="p-8 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-6">
                                <Heart className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="font-serif text-2xl font-light text-foreground mb-4">Organizations</h3>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Post volunteer opportunities, connect with motivated students, and confirm completed service hours.
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Post opportunities for free</li>
                                <li>• Reach thousands of students</li>
                                <li>• Manage volunteer applications</li>
                                <li>• Verify and sign off on hours</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24" id="features">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Platform Features</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Everything you need to discover, track, and verify volunteer hours
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Centralized Discovery */}
                        <div className="p-8 bg-muted/30 border border-border rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Search className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-serif text-2xl font-light text-foreground mb-4">Centralized Discovery</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                One platform to find all volunteer opportunities across Ontario — no more scattered searches or
                                outdated listings.
                            </p>
                        </div>

                        {/* Integrated Hour Validation */}
                        <div className="p-8 bg-muted/30 border border-border rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <ClipboardCheck className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-serif text-2xl font-light text-foreground mb-4">Integrated Hour Validation</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A digitized verification system that replaces manual logging with secure, automated approval
                                workflows, ensuring data integrity and reducing the risk of lost records.
                            </p>
                        </div>

                        {/* Connected Community */}
                        <div className="p-8 bg-muted/30 border border-border rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-serif text-2xl font-light text-foreground mb-4">Connected Community</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                A collaborative interface designed to bridge communication gaps between students, educational
                                institutions, and community partners through real-time updates and synchronization.
                            </p>
                        </div>

                        {/* Gamified Milestones */}
                        <div className="p-8 bg-muted/30 border border-border rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-serif text-2xl font-light text-foreground mb-4">Gamified Milestones</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Visualize your progress toward graduation requirements with automated reporting and celebrate every
                                hour you give back.
                            </p>
                        </div>
                    </div>
                </section>

            </main>

        </div>
    )
}
