import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WishlistContent } from "@/components/wishlist-content"

export default function WishlistPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-12">Wishlist</h1>
          <WishlistContent />
        </div>
      </main>

      <Footer />
    </div>
  )
}
