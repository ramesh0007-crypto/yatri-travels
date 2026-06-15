import { Link } from "wouter";
import { Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";

interface Package {
  id: number;
  title: string;
  location: string;
  description: string;
  images: string[];
  price: number;
  duration: number;
  seatsAvailable: number;
  featured?: boolean;
  avgRating?: number | null;
  reviewCount?: number | null;
}

interface PackageCardProps {
  pkg: Package;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const imageUrl = pkg.images?.[0] || `https://source.unsplash.com/640x480/?${encodeURIComponent(pkg.location)},india,temple`;

  return (
    <Card className="overflow-hidden card-hover h-full flex flex-col" data-testid={`card-package-${pkg.id}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {pkg.featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-medium">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium">{pkg.seatsAvailable} seats</span>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-1 mb-1">
          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span className="text-xs text-muted-foreground">{pkg.location}</span>
        </div>

        <h3 className="text-serif font-semibold text-base mb-1 line-clamp-2">{pkg.title}</h3>

        {pkg.avgRating ? (
          <div className="mb-2">
            <StarRating rating={pkg.avgRating} showValue count={pkg.reviewCount ?? undefined} />
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-3">{pkg.description}</p>

        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pkg.duration} {pkg.duration === 1 ? "day" : "days"}
          </span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-muted-foreground">From</span>
            <p className="text-lg font-bold text-primary">₹{pkg.price.toLocaleString("en-IN")}</p>
          </div>
          <Link href={`/destinations/${pkg.id}`}>
            <Button size="sm" className="gap-1" data-testid={`button-view-package-${pkg.id}`}>
              View <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
