import { useState } from "react";
import { useParams, Link } from "wouter";
import { Clock, Users, MapPin, CheckCircle, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StarRating, { InteractiveStarRating } from "@/components/StarRating";
import { useAuth } from "@/context/AuthContext";
import {
  useGetPackage, getGetPackageQueryKey,
  useListReviews, getListReviewsQueryKey,
  useCreateReview, useDeleteReview,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const pkgId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: pkg, isLoading } = useGetPackage(pkgId, {
    query: { enabled: !!pkgId, queryKey: getGetPackageQueryKey(pkgId) }
  });
  const { data: reviews } = useListReviews({ packageId: pkgId }, {
    query: { enabled: !!pkgId, queryKey: getListReviewsQueryKey({ packageId: pkgId }) }
  });
  const createReview = useCreateReview({
    mutation: {
      onSuccess: () => {
        toast({ title: "Review submitted!" });
        setReviewComment(""); setReviewRating(5);
        qc.invalidateQueries({ queryKey: getListReviewsQueryKey({ packageId: pkgId }) });
        qc.invalidateQueries({ queryKey: getGetPackageQueryKey(pkgId) });
      },
      onError: () => toast({ title: "Failed to submit review", variant: "destructive" }),
    }
  });
  const deleteReview = useDeleteReview({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListReviewsQueryKey({ packageId: pkgId }) });
      },
    }
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    createReview.mutate({ data: { packageId: pkgId, rating: reviewRating, comment: reviewComment } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 w-full">
          <Skeleton className="h-96 rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl font-bold">Package not found</p>
          <Link href="/destinations"><Button className="mt-4">Back to Destinations</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = pkg.images?.length ? pkg.images : [
    `https://source.unsplash.com/800x500/?${encodeURIComponent(pkg.location)},temple,india`
  ];
  const highlights = pkg.highlights?.split("\n").filter(Boolean) || [];
  const inclusions = pkg.inclusions?.split("\n").filter(Boolean) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <Link href="/destinations">
          <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" /> All Packages
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="rounded-xl overflow-hidden h-72 sm:h-96 mb-3 shadow-md">
              <img src={images[selectedImage]} alt={pkg.title} className="w-full h-full object-cover" />
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                    data-testid={`button-thumbnail-${i}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground text-sm">{pkg.location}</span>
              {pkg.featured && <Badge className="ml-auto bg-accent text-accent-foreground">Featured</Badge>}
            </div>
            <h1 className="text-serif text-3xl font-bold mb-2">{pkg.title}</h1>
            {pkg.avgRating && (
              <div className="mb-4">
                <StarRating rating={pkg.avgRating} showValue count={pkg.reviewCount ?? 0} />
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed mb-6">{pkg.description}</p>

            {highlights.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {inclusions.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-3">What's Included</h2>
                <ul className="space-y-2">
                  {inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 bg-card border border-card-border rounded-xl p-6 shadow-md">
              <p className="text-muted-foreground text-sm mb-1">Starting from</p>
              <p className="text-3xl font-bold text-primary mb-4">₹{pkg.price.toLocaleString("en-IN")}</p>

              <div className="flex gap-4 text-sm mb-4 py-4 border-y border-border">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{pkg.duration} {pkg.duration === 1 ? "Day" : "Days"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{pkg.seatsAvailable} seats left</span>
                </div>
              </div>

              {pkg.seatsAvailable > 0 ? (
                user ? (
                  <Link href={`/book/${pkg.id}`}>
                    <Button className="w-full" size="lg" data-testid="button-book-now">
                      Book Now
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/login?redirect=/book/${pkg.id}`}>
                    <Button className="w-full" size="lg" data-testid="button-login-to-book">
                      Login to Book
                    </Button>
                  </Link>
                )
              ) : (
                <Button className="w-full" size="lg" disabled>Fully Booked</Button>
              )}

              <a
                href="https://wa.me/9779800000000"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3"
              >
                <Button variant="outline" className="w-full gap-2" data-testid="button-enquire">
                  Enquire on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-serif text-2xl font-bold mb-6">
            Traveler Reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
          </h2>

          {/* Add Review */}
          {user && (
            <form onSubmit={handleReviewSubmit} className="bg-card border border-card-border rounded-xl p-5 mb-8">
              <h3 className="font-semibold mb-3">Share Your Experience</h3>
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                <InteractiveStarRating value={reviewRating} onChange={setReviewRating} />
              </div>
              <Textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Write your review..."
                className="mb-3"
                rows={3}
                data-testid="textarea-review"
              />
              <Button type="submit" disabled={createReview.isPending || !reviewComment.trim()} data-testid="button-submit-review">
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}

          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-card border border-card-border rounded-xl p-5" data-testid={`review-${r.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{r.user?.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      {(user?.id === r.userId || user?.role === "admin") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteReview.mutate({ id: r.id })}
                          data-testid={`button-delete-review-${r.id}`}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your experience!</p>
          )}
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
