import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./AdminDashboard";
import { useListBookings, getListBookingsQueryKey, useUpdateBooking } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminBookings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: bookings, isLoading } = useListBookings({ query: { queryKey: getListBookingsQueryKey() } });

  const updateBooking = useUpdateBooking({
    mutation: {
      onSuccess: () => {
        toast({ title: "Booking updated" });
        qc.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      },
    }
  });

  return (
    <AdminLayout title="Manage Bookings">
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {bookings?.map(b => (
            <div key={b.id} className="bg-card border border-card-border rounded-xl p-4" data-testid={`admin-booking-${b.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{b.package?.title || `Package #${b.packageId}`}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{b.paymentStatus}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.user?.name} ({b.user?.email}) · {b.travelDate} · {b.seatsBooked} seats · ₹{b.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="shrink-0">
                  <Select
                    value={b.status}
                    onValueChange={(v) => updateBooking.mutate({ id: b.id, data: { status: v as any } })}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          {!bookings?.length && <p className="text-sm text-muted-foreground text-center py-10">No bookings yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
