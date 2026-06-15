import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Users, Package, BookOpen, DollarSign, Clock, LayoutDashboard, Image, Mail, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/packages", icon: Package, label: "Packages" },
  { href: "/admin/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/gallery", icon: Image, label: "Gallery" },
  { href: "/admin/contacts", icon: Mail, label: "Contacts" },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user) setLocation("/login");
    else if (user.role !== "admin") setLocation("/");
  }, [user]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block border-r border-border bg-card py-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 mb-3">Admin Panel</p>
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map(n => (
              <Link key={n.href} href={n.href}>
                <span className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  location === n.href ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                }`}>
                  <n.icon className="w-4 h-4" />
                  {n.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full border-b border-border bg-card">
          <div className="flex overflow-x-auto px-4 py-2 gap-2">
            {NAV_ITEMS.map(n => (
              <Link key={n.href} href={n.href}>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  location === n.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}>
                  <n.icon className="w-3.5 h-3.5" />
                  {n.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-serif text-2xl font-bold mb-6">{title}</h1>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  const STAT_CARDS = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "Packages", value: stats?.totalPackages, icon: Package, color: "text-green-500" },
    { label: "Bookings", value: stats?.totalBookings, icon: BookOpen, color: "text-purple-500" },
    { label: "Revenue", value: stats ? `₹${stats.totalRevenue.toLocaleString("en-IN")}` : undefined, icon: DollarSign, color: "text-amber-500" },
    { label: "Pending Bookings", value: stats?.pendingBookings, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardContent className="p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <p className="text-xl font-bold">{s.value ?? 0}</p>}
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <h2 className="font-semibold mb-3">Recent Bookings</h2>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : stats?.recentBookings?.length ? (
        <div className="space-y-2">
          {stats.recentBookings.map((b) => (
            <div key={b.id} className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between text-sm" data-testid={`recent-booking-${b.id}`}>
              <div>
                <p className="font-medium">{b.package?.title || `Package #${b.packageId}`}</p>
                <p className="text-xs text-muted-foreground">{b.user?.name} · {b.travelDate}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">₹{b.totalAmount.toLocaleString("en-IN")}</p>
                <Badge variant="outline" className="text-xs">{b.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recent bookings.</p>
      )}
    </AdminLayout>
  );
}
