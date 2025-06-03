import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SiteHeader } from "@/components/site-header"
import { 
  CheckCircle, 
  Users, 
  Calendar, 
  MessageSquare, 
  Video, 
  Star,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Globe,
  ArrowRight,
  Play
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          <div className="container relative">
            <div
              className="flex max-w-[64rem] flex-col items-center gap-8 text-center py-16 md:py-24 lg:py-32"
              style={{
                margin: "0 auto"
              }}
              >
              <div className="space-y-6">
                <Badge variant="secondary" className="px-4 py-2">
                  <span className="mr-2">🚀</span>
                  Join 10,000+ professionals already using ConsultPro
                </Badge>
                <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Connect with{" "}
                  <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    World-Class Experts
                  </span>
                  {" "}in Minutes
                </h1>
                <p className="max-w-[42rem] leading-relaxed text-muted-foreground text-lg sm:text-xl">
                  Get personalized advice from verified experts across technology, business, design, and more. 
                  Book consultations instantly and grow your career or business.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button size="lg" className="flex-1 h-12" asChild>
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="flex-1 h-12" asChild>
                  <Link href="/experts">
                    <Play className="mr-2 h-4 w-4" />
                    Browse Experts
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>1000+ verified experts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 average rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Available 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="border-y bg-muted/30">
          <div className="container py-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1K+</div>
                <div className="text-sm text-muted-foreground">Verified Experts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-[58rem] text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                How ConsultPro Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Get expert advice in three simple steps
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold">Find Your Expert</h3>
                <p className="text-muted-foreground">
                  Browse through our curated list of verified experts across various fields and find the perfect match for your needs.
                </p>
              </div>
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold">Book a Session</h3>
                <p className="text-muted-foreground">
                  Choose an available time slot that works for you and book your consultation instantly with our easy booking system.
                </p>
              </div>
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold">Get Expert Advice</h3>
                <p className="text-muted-foreground">
                  Connect via video call or messaging and get personalized advice to solve your challenges and achieve your goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container space-y-12">
            <div className="mx-auto max-w-[58rem] text-center space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed to connect you with the right experts
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Expert Marketplace</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Access thousands of verified experts across technology, business, design, marketing, and more.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-2">
                    <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>HD Video Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Crystal clear video consultations powered by enterprise-grade technology for the best experience.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Smart Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Book sessions instantly with real-time availability and automatic calendar sync.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>Verified Experts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    All experts are thoroughly vetted and verified with proven track records in their fields.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-2">
                    <MessageSquare className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle>Secure Messaging</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Continue conversations before and after sessions with built-in secure messaging.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center mb-2">
                    <Zap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle>Instant Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Get expert help within minutes with our instant booking system and flexible scheduling.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Expert Categories */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-[58rem] text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                Find Experts in Every Field
              </h2>
              <p className="text-lg text-muted-foreground">
                Get help from industry leaders across all major categories
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[
                { name: "Technology", count: "200+", color: "bg-blue-500" },
                { name: "Business", count: "150+", color: "bg-green-500" },
                { name: "Design", count: "120+", color: "bg-purple-500" },
                { name: "Marketing", count: "100+", color: "bg-orange-500" },
                { name: "Finance", count: "80+", color: "bg-red-500" },
                { name: "Legal", count: "60+", color: "bg-teal-500" },
                { name: "Career", count: "90+", color: "bg-pink-500" },
                { name: "Healthcare", count: "70+", color: "bg-indigo-500" },
              ].map((category) => (
                <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-white font-bold">{category.count.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} experts</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/30 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-[58rem] text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                  What Our Users Say
                </h2>
                <p className="text-lg text-muted-foreground">
                  Don't just take our word for it - hear from our community
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    name: "Sarah Chen",
                    role: "Startup Founder",
                    content: "ConsultPro helped me validate my business idea and find the right technical co-founder. The experts were incredibly knowledgeable and responsive.",
                    rating: 5,
                    avatar: "SC"
                  },
                  {
                    name: "Michael Rodriguez", 
                    role: "Software Engineer",
                    content: "I was able to get career advice from senior engineers at top tech companies. It completely changed my approach to interviews and landed me my dream job.",
                    rating: 5,
                    avatar: "MR"
                  },
                  {
                    name: "Emily Zhang",
                    role: "Product Manager",
                    content: "The UX experts helped me redesign our product interface. Our user engagement increased by 40% after implementing their recommendations.",
                    rating: 5,
                    avatar: "EZ"
                  }
                ].map((testimonial, index) => (
                  <Card key={index} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-[58rem] text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                Ready to Connect with Experts?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of professionals who are already growing with ConsultPro
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/signup">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="/experts">Browse Experts</Link>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              No credit card required • Free to start • Cancel anytime
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30">
          <div className="container py-12">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Video className="h-6 w-6" />
                  <span className="font-bold text-lg">ConsultPro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connecting professionals with world-class experts for personalized consultations.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/experts" className="hover:text-foreground">Find Experts</Link></li>
                  <li><Link href="/signup" className="hover:text-foreground">Become an Expert</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Contact Us</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Community</Link></li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground">About</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 ConsultPro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
