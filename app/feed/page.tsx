import { Navigation } from "@/components/navigation"

export default function FeedPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
              Feed
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Your volunteer activity and updates
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <p>Feed content coming soon.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
