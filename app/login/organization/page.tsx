import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import { Navigation } from "@/components/navigation"

export default function OrganizationLoginPage() {
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
                                Post opportunities, connect with eager volunteers, and verify completed hours
                            </p>
                        </header>

                        <div className="w-full max-w-md">
                            <LoginForm redirectTo="/org/dashboard" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - matches student login layout */}
                    <div className="hidden lg:flex lg:mt-[152px]">
                        <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white/50 w-full h-80">
                            <Image
                                src="/volunteers.jpg"
                                alt="Volunteers"
                                fill
                                className="object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
