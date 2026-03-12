import { SignupForm } from "@/components/signup-form"
import { Navigation } from "@/components/navigation"

export default function SignupPage() {
    return (
        <div className="min-h-svh bg-background overflow-x-hidden w-full">
            <Navigation />
            <div className="pt-24 md:pt-28 pb-12 px-4 sm:px-6 md:px-10 max-w-full">
                <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full p-6 md:p-10 rounded-2xl bg-sky-50/60 border border-sky-100/80">
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

                    {/* Form and illustration columns - balanced layout, no overflow */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start w-full min-w-0">
                        <div className="w-full max-w-md shrink-0 min-w-0">
                            <SignupForm />
                        </div>

                        {/* RIGHT COLUMN - illustration sized to balance, constrained to prevent overflow */}
                        <div className="hidden lg:flex flex-1 min-w-0 max-w-[480px] shrink">
                            <div className="rounded-xl overflow-hidden shadow-lg border-2 border-white/50 w-full min-w-0">
                                <img
                                    src="/images/signup-illustration.png"
                                    alt="Student wellness and community volunteering"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
