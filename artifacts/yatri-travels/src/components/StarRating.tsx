import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}

export default function StarRating({ rating, max = 5, size = 14, showValue = false, count }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <Star
            key={i}
            width={size}
            height={size}
            className={filled ? "text-accent fill-accent" : partial ? "text-accent fill-accent/50" : "text-muted-foreground"}
          />
        );
      })}
      {showValue && (
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}{count !== undefined ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}

interface InteractiveStarRatingProps {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}

export function InteractiveStarRating({ value, onChange, max = 5 }: InteractiveStarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="focus:outline-none"
          data-testid={`star-${i + 1}`}
        >
          <Star
            width={22}
            height={22}
            className={i < value ? "text-accent fill-accent" : "text-muted-foreground hover:text-accent"}
          />
        </button>
      ))}
    </div>
  );
}
