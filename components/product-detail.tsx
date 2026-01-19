"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const productData = {
  name: "Linen Relaxed Shirt",
  price: 128,
  images: ["/linen-shirt-natural-beige.jpg", "/linen-shirt-detail-texture.jpg", "/linen-shirt-styled-look.jpg"],
  description:
    "A timeless essential crafted from 100% organic linen. This relaxed-fit shirt features a classic collar, button-front closure, and a gently curved hem. Perfect for layering or wearing on its own.",
  fabric: "100% Organic Linen",
  fabricDetails:
    "Sourced from European flax farms, our linen is grown without pesticides and processed using eco-friendly methods. Naturally breathable and temperature-regulating.",
  colors: [
    { name: "Natural", hex: "#E8DCC8" },
    { name: "Ivory", hex: "#F5F3ED" },
    { name: "Stone", hex: "#C4B5A0" },
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
  care: "Machine wash cold with like colors. Tumble dry low or line dry. Iron on medium heat if needed.",
  sustainability:
    "Made in Portugal in a family-owned workshop that prioritizes fair wages and safe working conditions. Carbon-neutral shipping.",
}

export function ProductDetail({ productId }: { productId: string }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(productData.colors[0])
  const [selectedSize, setSelectedSize] = useState("")
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-[3/4] bg-muted overflow-hidden">
            <img
              src={productData.images[selectedImage] || "/placeholder.svg"}
              alt={productData.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-3 gap-4">
            {productData.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-[3/4] bg-muted overflow-hidden border-2 transition-colors ${
                  selectedImage === index ? "border-accent" : "border-transparent"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:pt-8">
          <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-2">{productData.name}</h1>
          <p className="text-2xl text-foreground mb-6">${productData.price}</p>

          <p className="text-muted-foreground leading-relaxed mb-8">{productData.description}</p>

          {/* Fabric Info */}
          <div className="mb-8 p-4 bg-muted/30 border border-border">
            <p className="text-sm font-medium mb-1">Fabric</p>
            <p className="text-sm text-muted-foreground">{productData.fabric}</p>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Color</label>
              <span className="text-sm text-muted-foreground">{selectedColor.name}</span>
            </div>
            <div className="flex gap-3">
              {productData.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedColor.name === color.name ? "border-accent scale-110" : "border-border"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Size</label>
              <button className="text-sm text-accent hover:underline">Size Guide</button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {productData.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 text-sm border transition-colors ${
                    selectedSize === size
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <Button
              size="lg"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6"
              disabled={!selectedSize}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-6 py-6 bg-transparent"
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-accent text-accent" : ""}`} />
            </Button>
          </div>

          {/* Accordion Details */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="fabric">
              <AccordionTrigger className="text-sm font-medium">Fabric Details</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {productData.fabricDetails}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="text-sm font-medium">Care Instructions</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {productData.care}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sustainability">
              <AccordionTrigger className="text-sm font-medium">Sustainability</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {productData.sustainability}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
