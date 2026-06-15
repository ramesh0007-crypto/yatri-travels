import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Calendar, Users, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useGetPackage, getGetPackageQueryKey, useCreateBooking, useCreatePaymentSession } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function BookingPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const pkgId = Number(packageId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [travelDate, setTravelDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState<{ id: number; totalAmount: number } | null>(null);
  const [step, setStep] = useState<"form" | "confirm" | "payment">("form");

  const { data: pkg, isLoading } = useGetPackage(pkgId, {
    query: { enabled: !!pkgId, queryKey: getGetPackageQueryKey(pkgId) }
  });

  const createBooking = useCreateBooking({
    mutation: {
      onSuccess: (b) => {
        setBooking({ id: b.id, totalAmount: b.totalAmount });
        setStep("confirm");
      },
      onError: (e: any) => toast({ title: e?.data?.error || "Booking failed", variant: "destructive" }),
    }
  });

  const createSession = useCreatePaymentSession({
    mutation: {
      onSuccess: (s) => {
        if (s.url) window.location.href = s.url;
        else setLocation("/dashboard?payment=success");
      },
      onError: () => toast({ title: "Payment failed", variant: "destructive" }),
    }
  });

  useEffect(() => {
    if (!user) setLocation("/login");
  }, [user]);

  const totalAmount = (pkg?.price || 0) * seats;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10 w-full">
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Footer />
    </div>
  );

  if (!pkg) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p>Package not found</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4 max-w-2xl mx-auto w-full">
        <h1 className="text-serif text-3xl font-bold mb-2">Book Your Journey</h1>
        <p className="text-muted-foreground mb-8">{pkg.title}</p>

        {step === "form" && (
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-sm text-muted-foreground">Package price</p>
              <p className="text-2xl font-bold text-primary">₹{pkg.price.toLocaleString("en-IN")} <span className="text-sm font-normal text-muted-foreground">per person</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="travelDate" className="mb-1.5 block">Travel Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="travelDate"
                    type="date"
                    value={travelDate}
                    min={minDateStr}
                    onChange={e => setTravelDate(e.target.value)}
                    className="pl-10"
                    data-testid="input-travel-date"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="seats" className="mb-1.5 block">Number of Seats</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    max={pkg.seatsAvailable}
                    value={seats}
                    onChange={e => setSeats(Math.max(1, Math.min(pkg.seatsAvailable, Number(e.target.value))))}
                    className="pl-10"
                    data-testid="input-seats"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pkg.seatsAvailable} seats available</p>
              </div>

              {/* Price Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>₹{pkg.price.toLocaleString("en-IN")} × {seats} {seats === 1 ? "person" : "people"}</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {pkg.seatsAvailable <= 5 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Only {pkg.seatsAvailable} seats remaining!
                </div>
              )}

              <Button
                onClick={() => {
                  if (!travelDate) { toast({ title: "Please select a travel date", variant: "destructive" }); return; }
                  createBooking.mutate({ data: { packageId: pkgId, travelDate, seatsBooked: seats } });
                }}
                disabled={createBooking.isPending || !travelDate}
                className="w-full"
                size="lg"
                data-testid="button-proceed"
              >
                {createBooking.isPending ? "Booking..." : "Proceed to Confirm"}
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && booking && (
          <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <p className="font-semibold">Booking Reserved</p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Package</span><span>{pkg.title}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span>{travelDate}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Seats</span><span>{seats}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total Amount</span>
                <span className="text-primary">₹{booking.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Button
              onClick={() => createSession.mutate({ data: { bookingId: booking.id } })}
              disabled={createSession.isPending}
              className="w-full gap-2"
              size="lg"
              data-testid="button-pay"
            >
              <CreditCard className="w-4 h-4" />
              {createSession.isPending ? "Processing..." : "Pay Now"}
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={() => setLocation("/dashboard")} data-testid="button-pay-later">
              Pay Later from Dashboard
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
