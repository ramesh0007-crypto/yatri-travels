import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./AdminDashboard";
import { useListGallery, getListGalleryQueryKey, useCreateGalleryImage, useDeleteGalleryImage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminGallery() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");

  const { data: images, isLoading } = useListGallery({ query: { queryKey: getListGalleryQueryKey() } });
  const createImg = useCreateGalleryImage({ mutation: { onSuccess: () => { toast({ title: "Image added" }); setOpen(false); setImageUrl(""); setTitle(""); qc.invalidateQueries({ queryKey: getListGalleryQueryKey() }); } } });
  const deleteImg = useDeleteGalleryImage({ mutation: { onSuccess: () => { toast({ title: "Image deleted" }); qc.invalidateQueries({ queryKey: getListGalleryQueryKey() }); } } });

  return (
    <AdminLayout title="Manage Gallery">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-add-image">
          <Plus className="w-4 h-4" /> Add Image
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images?.map(img => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm" data-testid={`admin-gallery-${img.id}`}>
              <img src={img.imageUrl} alt={img.title} className="w-full h-36 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Button size="icon" variant="destructive" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => deleteImg.mutate({ id: img.id })} data-testid={`button-delete-img-${img.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium">{img.title}</p>
              </div>
            </div>
          ))}
          {!images?.length && <div className="col-span-full text-sm text-muted-foreground text-center py-10">No images yet.</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Gallery Image</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs mb-1 block">Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." data-testid="input-gallery-url" /></div>
            <div><Label className="text-xs mb-1 block">Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Image title" data-testid="input-gallery-title" /></div>
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />}
            <Button onClick={() => { if (imageUrl && title) createImg.mutate({ data: { imageUrl, title } }); }} disabled={!imageUrl || !title || createImg.isPending} className="w-full" data-testid="button-save-image">
              Add Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
