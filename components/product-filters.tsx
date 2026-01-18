"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"

export function ProductFilters() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")

  const categories = [
    { id: "all", label: "All" },
    { id: "essentials", label: "Essentials" },
    { id: "outerwear", label: "Outerwear" },
    { id: "dresses", label: "Dresses" },
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
  ]

  return (
    <div className="mb-12 space-y-6">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="px-6 tracking-wider text-sm"
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between border-t border-b border-border py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>48 Products</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 text-foreground cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
