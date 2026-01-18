"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus, X } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Linen Relaxed Shirt",
    price: 128,
    image: "/linen-shirt-natural-beige.jpg",
    color: "Natural",
    size: "M",
    quantity: 1,
  },
  {
    id: 3,
    name: "Silk Slip Dress",
    price: 245,
    image: "/silk-slip-dress-minimal.jpg",
    color: "Champagne",
    size: "S",
    quantity: 1,
  },
]

export function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 200 ? 0 : 15
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-8">Your cart is empty</p>
        <Link href="/shop">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Continue Shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-6">
        {cartItems.map((item) => (
          <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-6 pb-6 border-b border-border">
            <div className="w-32 h-40 bg-muted overflow-hidden flex-shrink-0">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.color} / {item.size}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-foreground">${item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 bg-transparent"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 bg-transparent"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-muted/30 border border-border p-6 sticky top-24">
          <h2 className="font-serif text-2xl font-light text-foreground mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-foreground">{shipping === 0 ? "Free" : `$${shipping}`}</span>
            </div>
            {subtotal < 200 && <p className="text-xs text-muted-foreground">Free shipping on orders over $200</p>}
            <div className="pt-4 border-t border-border flex justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-medium text-foreground">${total}</span>
            </div>
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 mb-4">
            Proceed to Checkout
          </Button>

          <Link href="/shop">
            <Button variant="outline" className="w-full bg-transparent">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
