import { LoginForm } from "@/components/login-form"
import { Navigation } from "@/components/navigation"

export default function StudentLoginPage() {
    return (
        <div className="min-h-svh bg-background">
            <Navigation />
            <div className="pt-24 md:pt-28 pb-12 px-6 md:p-10">
                <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">

                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-8">
                        <header>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold leading-normal">
                                Welcome to{" "}
                                <span className="font-serif font-normal text-primary">Volun</span>
                                <span className="font-serif font-normal text-orange-500">Track</span>
                                <span className="font-serif font-normal text-primary"> Ontario</span>
                            </h1>
                            <p className="mt-4 text-lg text-muted-foreground font-serif">
                                Find opportunities. Track hours. Make an impact.
                            </p>
                        </header>

                    <div className="w-full max-w-md">
                        <LoginForm showSignUp={true} redirectTo="/opportunities" />
                    </div>
                </div>

                {/* RIGHT COLUMN: Aligned to start at the Login Card height */}
                {/* mt-[152px] accounts for the height of your header + gap */}
                <div className="hidden lg:flex flex-col gap-4 lg:mt-[152px]">
                    <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white/50">
                        <img
                            src="/student-volunteers-outdoor-park-clear-sky.jpg"
                            alt="Volunteers"
                            className="w-full h-40 object-cover"
                        />
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white/50">
                        <img
                            src="/images/volunteers-tutoring.jpg"
                            alt="Tutoring"
                            className="w-full h-40 object-cover"
                        />
                    </div>
                    <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white/50">
                        <img
                            src="/images/volunteers-healthcare.jpg"
                            alt="Healthcare"
                            className="w-full h-40 object-cover"
                        />
                    </div>
                </div>

                </div>
            </div>
        </div>
    )
}
