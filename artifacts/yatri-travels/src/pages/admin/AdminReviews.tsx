import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./AdminDashboard";
import StarRating from "@/components/StarRating";
import { useListReviews, getListReviewsQueryKey, useDeleteReview } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminReviews() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: reviews, isLoading } = useListReviews({}, { query: { queryKey: getListReviewsQueryKey({}) } });

  const deleteReview = useDeleteReview({ mutation: { onSuccess: () => { toast({ title: "Review deleted" }); qc.invalidateQueries({ queryKey: getListReviewsQueryKey({}) }); } } });

  return (
    <AdminLayout title="Manage Reviews">
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {reviews?.map(r => (
            <div key={r.id} className="bg-card border border-card-border rounded-xl p-4 flex items-start gap-3" data-testid={`admin-review-${r.id}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{r.user?.name || "Unknown"}</p>
                  <StarRating rating={r.rating} size={12} />
                  <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">Package ID: {r.packageId}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => deleteReview.mutate({ id: r.id })} data-testid={`button-delete-review-admin-${r.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {!reviews?.length && <p className="text-sm text-muted-foreground text-center py-10">No reviews yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
