import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LookbookGallery } from "@/components/lookbook-gallery"

export default function LookbookPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-light text-foreground mb-4">Spring Summer 2024</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover how to style our latest collection for effortless everyday elegance
          </p>
        </div>

        <LookbookGallery />
      </main>

      <Footer />
    </div>
  )
}
