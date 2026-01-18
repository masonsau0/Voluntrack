import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const collections = [
  {
    id: "spring-summer-2024",
    title: "Spring Summer 2024",
    description: "Light, breathable pieces for warm weather",
    image: "/collection-spring-summer-2024.jpg",
    itemCount: 24,
  },
  {
    id: "essentials",
    title: "Essentials",
    description: "Timeless basics for every wardrobe",
    image: "/collection-essentials.jpg",
    itemCount: 18,
  },
  {
    id: "autumn-winter-2023",
    title: "Autumn Winter 2023",
    description: "Cozy layers for cooler days",
    image: "/collection-autumn-winter-2023.jpg",
    itemCount: 32,
  },
]

export default function CollectionsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="font-serif text-4xl md:text-6xl font-light text-foreground mb-4">Collections</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curated selections of our most beloved pieces
            </p>
          </div>

          <div className="space-y-12">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/shop?collection=${collection.id}`}
                className="group block relative aspect-[21/9] overflow-hidden bg-muted"
              >
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-2xl px-8 md:px-16 text-background">
                    <h2 className="font-serif text-3xl md:text-5xl font-light mb-3">{collection.title}</h2>
                    <p className="text-sm md:text-base text-background/90 mb-4">{collection.description}</p>
                    <p className="text-sm text-background/80 mb-6">{collection.itemCount} pieces</p>
                    <Button
                      variant="outline"
                      className="border-background text-background hover:bg-background hover:text-foreground bg-transparent"
                    >
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
