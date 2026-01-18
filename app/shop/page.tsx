import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"

export default function ShopPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-light text-foreground mb-4">Shop All</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our complete collection of mindfully crafted pieces
            </p>
          </div>

          {/* Filters */}
          <ProductFilters />

          {/* Product Grid */}
          <ProductGrid />
        </div>
      </main>

      <Footer />
    </div>
  )
}
