"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface WishlistItem {
  id: number
  name: string
  price: number
  image: string
  fabric: string
  colors: string[]
}

const initialWishlistItems: WishlistItem[] = [
  {
    id: 4,
    name: "Cashmere Sweater",
    price: 298,
    image: "/cashmere-sweater-neutral.jpg",
    fabric: "Recycled Cashmere",
    colors: ["Oat", "Camel", "Charcoal"],
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
    id: 6,
    name: "Cotton Midi Skirt",
    price: 145,
    image: "/cotton-midi-skirt-flowing.jpg",
    fabric: "Organic Cotton",
    colors: ["Cream", "Rust", "Forest"],
  },
]

export function WishlistContent() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems)

  const removeItem = (id: number) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-8">Your wishlist is empty</p>
        <Link href="/shop">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Discover Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistItems.map((item) => (
        <div key={item.id} className="group relative">
          <Link href={`/product/${item.id}`}>
            <div className="aspect-[3/4] mb-4 overflow-hidden bg-muted">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => removeItem(item.id)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <Link href={`/product/${item.id}`}>
              <h3 className="text-base font-medium text-foreground group-hover:text-accent transition-colors">
                {item.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">${item.price}</p>
            <p className="text-xs text-muted-foreground">{item.fabric}</p>

            <Link href={`/product/${item.id}`}>
              <Button size="sm" className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
