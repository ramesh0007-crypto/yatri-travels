import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useListPackages, getListPackagesQueryKey } from "@workspace/api-client-react";

export default function Destinations() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialSearch = urlParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const params = {
    ...(search ? { search } : {}),
    ...(minPrice ? { minPrice: Number(minPrice) } : {}),
    ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
    ...(minDuration ? { minDuration: Number(minDuration) } : {}),
    ...(maxDuration ? { maxDuration: Number(maxDuration) } : {}),
  };

  const { data: packages, isLoading } = useListPackages(params, {
    query: { queryKey: getListPackagesQueryKey(params) }
  });

  const clearFilters = () => {
    setSearch(""); setMinPrice(""); setMaxPrice("");
    setMinDuration(""); setMaxDuration("");
  };

  const hasFilters = search || minPrice || maxPrice || minDuration || maxDuration;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Page Header */}
      <section className="relative py-16 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-serif text-4xl font-bold mb-3">All Destinations</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Explore our complete collection of sacred pilgrimage packages across India and Nepal.
          </p>
        </div>
      </section>

      <section className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by destination or package name..."
              className="pl-10"
              data-testid="input-search-destinations"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            data-testid="button-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2 text-destructive" data-testid="button-clear-filters">
              <X className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card border border-card-border rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs mb-1 block">Min Price (₹)</Label>
              <Input value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number" placeholder="e.g. 5000" data-testid="input-min-price" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Max Price (₹)</Label>
              <Input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number" placeholder="e.g. 50000" data-testid="input-max-price" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Min Duration (days)</Label>
              <Input value={minDuration} onChange={e => setMinDuration(e.target.value)} type="number" placeholder="e.g. 3" data-testid="input-min-duration" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Max Duration (days)</Label>
              <Input value={maxDuration} onChange={e => setMaxDuration(e.target.value)} type="number" placeholder="e.g. 14" data-testid="input-max-duration" />
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
          </div>
        ) : packages && packages.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">{packages.length} package{packages.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {packages.map(pkg => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground mb-2">No packages found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
