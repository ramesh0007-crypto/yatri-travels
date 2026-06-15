import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Calendar, Clock, CreditCard, Package, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useListBookings, getListBookingsQueryKey, useCancelBooking, useCreatePaymentSession } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};
const PAYMENT_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  refunded: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user]);

  const { data: bookings, isLoading } = useListBookings({
    query: { queryKey: getListBookingsQueryKey() }
  });

  const cancelBooking = useCancelBooking({
    mutation: {
      onSuccess: () => {
        toast({ title: "Booking cancelled" });
        qc.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      },
      onError: () => toast({ title: "Failed to cancel", variant: "destructive" }),
    }
  });

  const createSession = useCreatePaymentSession({
    mutation: {
      onSuccess: (s) => {
        if (s.url) window.location.href = s.url;
      },
    }
  });

  // Handle payment success redirect
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const paymentResult = urlParams.get("payment");

  useEffect(() => {
    if (paymentResult === "success") {
      toast({ title: "Payment successful!", description: "Your booking is confirmed." });
    } else if (paymentResult === "cancelled") {
      toast({ title: "Payment cancelled", variant: "destructive" });
    }
  }, [paymentResult]);

  if (!user) return null;

  const myBookings = bookings?.filter(b => b.userId === user.id) || [];
  const totalSpent = myBookings.filter(b => b.paymentStatus === "paid").reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4 max-w-5xl mx-auto w-full">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-serif text-2xl font-bold">Welcome, {user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: "Total Bookings", value: myBookings.length },
            { icon: CreditCard, label: "Amount Paid", value: `₹${totalSpent.toLocaleString("en-IN")}` },
            { icon: Clock, label: "Pending", value: myBookings.filter(b => b.status === "pending").length },
            { icon: Calendar, label: "Confirmed", value: myBookings.filter(b => b.status === "confirmed").length },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card border border-card-border rounded-xl p-4 shadow-sm text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings */}
        <h2 className="text-serif text-xl font-bold mb-4">My Bookings</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : myBookings.length > 0 ? (
          <div className="space-y-3">
            {myBookings.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-card border border-card-border rounded-xl p-5 shadow-sm" data-testid={`booking-${b.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{b.package?.title || `Package #${b.packageId}`}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>
                        {b.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_COLORS[b.paymentStatus]}`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.travelDate}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {b.seatsBooked} seat{b.seatsBooked > 1 ? "s" : ""}</span>
                      <span className="font-semibold text-primary">₹{b.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {b.paymentStatus === "pending" && b.status !== "cancelled" && (
                      <Button size="sm" variant="outline" onClick={() => createSession.mutate({ data: { bookingId: b.id } })} data-testid={`button-pay-${b.id}`}>
                        Pay Now
                      </Button>
                    )}
                    {b.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelBooking.mutate({ id: b.id })} data-testid={`button-cancel-${b.id}`}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-card-border rounded-xl">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">No bookings yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start your pilgrimage journey today</p>
            <Link href="/destinations">
              <Button className="mt-4" data-testid="button-explore">Explore Packages</Button>
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
