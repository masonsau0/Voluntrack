import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function TermsPage() {
    return (
        <div className="min-h-svh bg-background">
            <Navigation />
            <div className="pt-32 pb-16 px-6 md:px-10">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                        VolunTrack Ontario – Terms & Conditions
                    </h1>
                    <p className="text-muted-foreground font-serif mb-10">
                        Student Users Under 18
                    </p>

                    <div className="prose prose-slate max-w-none font-serif space-y-6 text-foreground">
                        <p>
                            By creating an account on VolunTrack Ontario, you agree to the following terms:
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">1. Eligibility</h2>
                            <p>
                                VolunTrack Ontario is designed for students completing volunteer hours in Ontario. If you are under the age of 18, you confirm that your parent or guardian is aware that you are creating this account and using the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">2. Purpose of the Platform</h2>
                            <p>
                                VolunTrack Ontario helps students:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 my-2">
                                <li>Discover volunteer opportunities</li>
                                <li>Track completed volunteer hours</li>
                                <li>Manage their volunteering activities</li>
                            </ul>
                            <p>
                                The platform does not guarantee placement in any volunteer opportunity. Volunteer organizations are responsible for their own opportunities and selection of participants.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">3. Account Information</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You agree to provide accurate and truthful information when creating your account, including your name, school email, and volunteer activity records.</li>
                                <li>You are responsible for keeping your login information secure.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">4. Volunteer Opportunities</h2>
                            <p>
                                Volunteer opportunities listed on the platform are posted by external organizations. VolunTrack Ontario does not supervise, manage, or control these organizations or their activities.
                            </p>
                            <p>
                                Students and guardians should ensure that volunteer opportunities are appropriate before participating.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">5. Tracking Volunteer Hours</h2>
                            <p>
                                The platform allows students to record and track volunteer hours for personal organization. Schools or organizations may require their own official verification process for community service hours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">6. Privacy</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Your personal information (such as name, email, and volunteer records) will only be used to operate and improve the platform.</li>
                                <li>We do not sell personal information to third parties.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">7. Acceptable Use</h2>
                            <p>
                                Users agree not to:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 my-2">
                                <li>Provide false volunteer records</li>
                                <li>Misuse the platform</li>
                                <li>Harass or harm other users or organizations</li>
                            </ul>
                            <p>
                                Accounts violating these rules may be removed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">8. Changes to the Platform</h2>
                            <p>
                                VolunTrack Ontario may update features or policies as the platform evolves.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mt-8 mb-2">9. Agreement</h2>
                            <p>
                                By creating an account and selecting &quot;I Agree&quot;, you confirm that you understand and agree to these Terms & Conditions.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t">
                        <Link
                            href="/signup"
                            className="text-primary hover:underline font-serif"
                        >
                            ← Back to Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
