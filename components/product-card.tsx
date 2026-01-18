"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  name: string
  price: number
  image: string
  fabric: string
  colors: string[]
}

export function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-muted">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 bg-foreground/5 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-accent text-accent" : ""}`} />
          </Button>

          {/* Fabric Details - Shown on Hover */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1">Fabric</p>
            <p className="text-sm font-medium">{product.fabric}</p>
            <div className="flex gap-2 mt-2">
              {product.colors.map((color) => (
                <span key={color} className="text-xs text-muted-foreground">
                  {color}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-base font-medium text-foreground group-hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground">${product.price}</p>
      </div>
    </div>
  )
}
