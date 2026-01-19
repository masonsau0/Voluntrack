import { ProductCard } from "@/components/product-card"

const relatedProducts = [
  {
    id: 2,
    name: "Wide Leg Trousers",
    price: 165,
    image: "/wide-leg-trousers-neutral.jpg",
    fabric: "Organic Cotton Twill",
    colors: ["Sand", "Charcoal", "Olive"],
  },
  {
    id: 7,
    name: "Ribbed Tank Top",
    price: 68,
    image: "/ribbed-tank-top-minimal.jpg",
    fabric: "Organic Cotton Rib",
    colors: ["White", "Black", "Taupe"],
  },
  {
    id: 5,
    name: "Tailored Blazer",
    price: 385,
    image: "/tailored-blazer-minimal.jpg",
    fabric: "Wool Blend",
    colors: ["Sand", "Navy", "Black"],
  },
]

export function RelatedProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8 text-center">Complete the Look</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
