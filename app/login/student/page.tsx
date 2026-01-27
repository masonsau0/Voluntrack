import { LoginForm } from "@/components/login-form"

export default function StudentLoginPage() {
    return (
        <div className="min-h-svh bg-gradient-to-b from-sky-100 to-sky-200 p-6 md:p-10">
            <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">

                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-8">
                    <header>
                        <h1 className="text-4xl md:text-5xl font-bold text-sky-900 leading-tight">
                            Welcome to
                        </h1>
                        <h2 className="text-4xl md:text-5xl font-bold">
                            <span className="text-sky-900">Volun</span>
                            <span className="text-amber-500 italic">Track</span>
                            <span className="text-sky-900"> Ontario</span>
                        </h2>
                        <p className="mt-4 text-lg text-sky-800 font-medium">
                            Find Opportunities. Track hours. Make an impact
                        </p>
                    </header>

                    <div className="w-full max-w-md">
                        <LoginForm showSignUp={true} />
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
    )
}
