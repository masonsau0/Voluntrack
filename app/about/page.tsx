import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Leaf, Heart, Users, Package } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-24">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-background/80 z-10" />
          <img
            src="/about-hero-sustainable-fashion-atelier.jpg"
            alt="Serene Atelier Studio"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-light text-foreground mb-6 text-balance">
              Our Philosophy
            </h1>
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              Creating timeless clothing that honors both people and planet
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">Our Story</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Serene Atelier was born from a simple belief: that clothing should be as kind to the earth as it is
                beautiful to wear. Founded in 2018, we set out to create a different kind of fashion brand—one that
                values quality over quantity, craftsmanship over trends, and sustainability over speed.
              </p>
              <p>
                Every piece in our collection is thoughtfully designed to transcend seasons and trends. We work
                exclusively with natural, organic, and recycled materials, partnering with artisans and workshops that
                share our commitment to ethical production and fair labor practices.
              </p>
              <p>
                Our atelier is more than a brand—it's a movement toward conscious consumption and mindful living. We
                believe that true luxury lies in pieces that are made to last, that tell a story, and that respect the
                hands that crafted them.
              </p>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24" id="sustainability">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">Our Commitments</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The principles that guide everything we create
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sustainable Materials */}
            <div className="p-8 bg-muted/30 border border-border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Leaf className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-light text-foreground mb-4">Sustainable Materials</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use only organic, recycled, or responsibly sourced materials. From European linen to peace silk,
                every fabric is chosen for its minimal environmental impact.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 100% organic cotton and linen</li>
                <li>• Recycled cashmere and wool</li>
                <li>• Peace silk (cruelty-free)</li>
                <li>• Natural, non-toxic dyes</li>
              </ul>
            </div>

            {/* Ethical Production */}
            <div className="p-8 bg-muted/30 border border-border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-light text-foreground mb-4">Ethical Production</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Every piece is made in small, family-owned workshops in Portugal and Italy where artisans receive fair
                wages and work in safe, dignified conditions.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Fair wages and benefits</li>
                <li>• Safe working conditions</li>
                <li>• Small-batch production</li>
                <li>• Long-term partnerships</li>
              </ul>
            </div>

            {/* Timeless Design */}
            <div className="p-8 bg-muted/30 border border-border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-light text-foreground mb-4">Timeless Design</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We design pieces that transcend trends and seasons. Each garment is created to be worn, loved, and
                cherished for years to come.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Classic, versatile silhouettes</li>
                <li>• High-quality construction</li>
                <li>• Designed to last</li>
                <li>• Seasonless collections</li>
              </ul>
            </div>

            {/* Circular Practices */}
            <div className="p-8 bg-muted/30 border border-border">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-light text-foreground mb-4">Circular Practices</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From packaging to end-of-life, we consider the full lifecycle of every product. We're committed to
                reducing waste and closing the loop.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Plastic-free packaging</li>
                <li>• Carbon-neutral shipping</li>
                <li>• Repair and care guides</li>
                <li>• Take-back program</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-6">Our Impact</h2>
            <p className="text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
              Transparency is at the heart of what we do. Here's how we're making a difference.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl md:text-5xl font-serif font-light text-accent mb-2">1,200+</div>
                <p className="text-sm text-muted-foreground">Artisans supported</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif font-light text-accent mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Carbon-neutral shipping</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif font-light text-accent mb-2">85%</div>
                <p className="text-sm text-muted-foreground">Waste reduction since 2020</p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-8">Certifications</h2>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="text-sm text-muted-foreground">GOTS Certified</div>
              <div className="text-sm text-muted-foreground">Fair Trade</div>
              <div className="text-sm text-muted-foreground">B Corp Pending</div>
              <div className="text-sm text-muted-foreground">Climate Neutral</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
