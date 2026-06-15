import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Star, Shield, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import StarRating from "@/components/StarRating";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useListFeaturedPackages, useGetPackageStats, useListReviews } from "@workspace/api-client-react";

const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop";

const DESTINATIONS = [
  "Kedarnath", "Badrinath", "Gangotri", "Yamunotri",
  "Rishikesh", "Haridwar", "Vaishno Devi", "Char Dham",
];

const FEATURES = [
  { icon: Shield, title: "Safe & Secure", desc: "Licensed tour operator with 10+ years of experience" },
  { icon: Clock, title: "24/7 Support", desc: "Round-the-clock assistance throughout your journey" },
  { icon: Users, title: "Expert Guides", desc: "Knowledgeable local guides at every destination" },
  { icon: Star, title: "Best Value", desc: "Competitive prices with no hidden charges" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { data: featured, isLoading: featuredLoading } = useListFeaturedPackages();
  const { data: stats } = useGetPackageStats();
  const { data: reviews } = useListReviews();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/destinations?search=${encodeURIComponent(search)}`);
    else setLocation("/destinations");
  };

  const topReviews = reviews?.filter(r => r.rating >= 4).slice(0, 3) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[520px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge className="mb-4 bg-accent/20 text-accent-foreground border border-accent/30 backdrop-blur-sm">
              Sacred Pilgrimages of India &amp; Nepal
            </Badge>
            <h1 className="text-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              Begin Your Sacred<br />
              <span className="text-accent">Yatra Today</span>
            </h1>
            <p className="text-white/85 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Expert-guided pilgrimages to the holiest destinations — Char Dham, Kedarnath, Vaishno Devi and beyond.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search destinations..."
                  className="pl-10 bg-background/95 border-0 shadow-lg h-12"
                  data-testid="input-search"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 shadow-lg" data-testid="button-search">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {DESTINATIONS.slice(0, 5).map(d => (
                <Link key={d} href={`/destinations?search=${encodeURIComponent(d)}`}>
                  <span className="text-xs bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm px-3 py-1 rounded-full cursor-pointer transition-colors border border-white/20">
                    {d}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="bg-primary text-primary-foreground py-10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Tour Packages", value: stats.totalPackages },
              { label: "Happy Travelers", value: stats.happyTravelers || "5000+" },
              { label: "Destinations", value: stats.totalDestinations },
              { label: "Bookings Made", value: stats.totalBookings || "1000+" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                data-testid={`stat-${i}`}
              >
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-primary-foreground/80 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Packages */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Handpicked for You</p>
          <h2 className="section-title">Featured Packages</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Carefully curated pilgrimage packages designed for devotion, comfort, and lifelong memories.
          </p>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <PackageCard pkg={pkg} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No featured packages yet.</p>
        )}

        <div className="text-center mt-8">
          <Link href="/destinations">
            <Button variant="outline" size="lg" className="gap-2" data-testid="button-view-all">
              View All Packages <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Popular Destinations</p>
            <h2 className="section-title">Sacred Places Await</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link href={`/destinations?search=${encodeURIComponent(dest)}`}>
                  <div className="group relative rounded-xl overflow-hidden h-28 cursor-pointer shadow-sm hover:shadow-md transition-all">
                    <img
                      src={`https://source.unsplash.com/320x240/?${encodeURIComponent(dest)},temple,india`}
                      alt={dest}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <p className="absolute bottom-2 left-3 text-white font-semibold text-sm">{dest}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Our Promise</p>
          <h2 className="section-title">Why Choose Yatri Travels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-xl bg-card border border-card-border shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {topReviews.length > 0 && (
        <section className="py-16 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Traveler Stories</p>
              <h2 className="section-title">What Our Pilgrims Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topReviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card border border-card-border rounded-xl p-6 shadow-sm"
                >
                  <StarRating rating={r.rating} showValue />
                  <p className="text-sm text-muted-foreground mt-3 italic">"{r.comment}"</p>
                  <p className="text-sm font-semibold mt-3">— {r.user?.name || "Anonymous"}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-serif text-3xl font-bold mb-3">Ready to Begin Your Sacred Journey?</h2>
          <p className="text-primary-foreground/80 mb-6">
            Join thousands of satisfied pilgrims who trusted Yatri Travels for their divine yatra.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/destinations">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto" data-testid="button-cta-destinations">
                Explore Packages
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-contact">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
