import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { CheckCircle, Users, Calendar, MessageSquare, Video } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Connect with Experts. <span className="text-primary">Book Consultations.</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Find and book consultations with verified experts across various fields. Get personalized advice through
              video calls, messaging, and more.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/experts">Browse Experts</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Features</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to connect with experts and manage consultations.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle>Expert Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find experts by expertise area, rating, and availability. Filter and search to find the perfect match.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary" />
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book appointments with experts based on their available time slots. Get instant confirmation.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary" />
                <CardTitle>Video Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  High-quality video calls powered by LiveKit for seamless consultation experiences.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary" />
                <CardTitle>Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chat with experts before and after consultations. Keep all communication in one place.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-primary" />
                <CardTitle>Expert Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All experts are verified and rated by previous clients. Choose with confidence.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary" />
                <CardTitle>Calendar Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Experts can manage their availability and appointments with an integrated calendar system.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">Ready to get started?</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of users and experts already using ConsultPro.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
