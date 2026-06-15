import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useListGallery } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryPage() {
  const { data: images, isLoading } = useListGallery();
  const [selected, setSelected] = useState<{ imageUrl: string; title: string } | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative py-16 bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1600')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-serif text-4xl font-bold mb-3">Photo Gallery</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Glimpses from our sacred journeys — memories that last a lifetime.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12 px-4 max-w-7xl mx-auto w-full">
        {isLoading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <Skeleton key={i} className="w-full rounded-lg" style={{ height: `${Math.random() > 0.5 ? 200 : 280}px` }} />
            ))}
          </div>
        ) : images && images.length > 0 ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid rounded-lg overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setSelected(img)}
                data-testid={`gallery-image-${img.id}`}
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm font-medium">{img.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No gallery images yet.</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={() => setSelected(null)}
              data-testid="button-close-lightbox"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[85vh] relative"
              onClick={e => e.stopPropagation()}
            >
              <img src={selected.imageUrl} alt={selected.title} className="max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain" />
              <p className="text-white text-center mt-3 font-medium">{selected.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
