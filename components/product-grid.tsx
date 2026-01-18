"use client"

import { ProductCard } from "@/components/product-card"

const products = [
  {
    id: 1,
    name: "Linen Relaxed Shirt",
    price: 128,
    image: "/linen-shirt-natural-beige.jpg",
    fabric: "100% Organic Linen",
    colors: ["Natural", "Ivory", "Stone"],
  },
  {
    id: 2,
    name: "Wide Leg Trousers",
    price: 165,
    image: "/wide-leg-trousers-neutral.jpg",
    fabric: "Organic Cotton Twill",
    colors: ["Sand", "Charcoal", "Olive"],
  },
  {
    id: 3,
    name: "Silk Slip Dress",
    price: 245,
    image: "/silk-slip-dress-minimal.jpg",
    fabric: "Peace Silk",
    colors: ["Champagne", "Terracotta", "Sage"],
  },
  {
    id: 4,
    name: "Cashmere Sweater",
    price: 298,
    image: "/cashmere-sweater-neutral.jpg",
    fabric: "Recycled Cashmere",
    colors: ["Oat", "Camel", "Charcoal"],
  },
  {
    id: 5,
    name: "Tailored Blazer",
    price: 385,
    image: "/tailored-blazer-minimal.jpg",
    fabric: "Wool Blend",
    colors: ["Sand", "Navy", "Black"],
  },
  {
    id: 6,
    name: "Cotton Midi Skirt",
    price: 145,
    image: "/cotton-midi-skirt-flowing.jpg",
    fabric: "Organic Cotton",
    colors: ["Cream", "Rust", "Forest"],
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
    id: 8,
    name: "Wool Coat",
    price: 485,
    image: "/wool-coat-elegant-neutral.jpg",
    fabric: "Merino Wool",
    colors: ["Camel", "Charcoal", "Ivory"],
  },
  {
    id: 9,
    name: "Linen Dress",
    price: 195,
    image: "/linen-dress-flowing-natural.jpg",
    fabric: "European Linen",
    colors: ["Natural", "Terracotta", "Sage"],
  },
]

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
