import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./AdminDashboard";
import {
  useListPackages, getListPackagesQueryKey,
  useCreatePackage, useUpdatePackage, useDeletePackage
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface PkgForm {
  title: string; location: string; description: string;
  price: string; duration: string; seatsAvailable: string;
  featured: boolean; highlights: string; inclusions: string;
  images: string;
}
const emptyForm: PkgForm = { title: "", location: "", description: "", price: "", duration: "", seatsAvailable: "", featured: false, highlights: "", inclusions: "", images: "" };

export default function AdminPackages() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PkgForm>(emptyForm);

  const { data: packages, isLoading } = useListPackages({}, { query: { queryKey: getListPackagesQueryKey({}) } });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListPackagesQueryKey({}) });

  const createPkg = useCreatePackage({ mutation: { onSuccess: () => { toast({ title: "Package created" }); setOpen(false); invalidate(); }, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const updatePkg = useUpdatePackage({ mutation: { onSuccess: () => { toast({ title: "Package updated" }); setOpen(false); invalidate(); }, onError: () => toast({ title: "Failed", variant: "destructive" }) } });
  const deletePkg = useDeletePackage({ mutation: { onSuccess: () => { toast({ title: "Package deleted" }); invalidate(); }, onError: () => toast({ title: "Failed", variant: "destructive" }) } });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setOpen(true); };
  const openEdit = (pkg: any) => {
    setForm({
      title: pkg.title, location: pkg.location, description: pkg.description,
      price: String(pkg.price), duration: String(pkg.duration), seatsAvailable: String(pkg.seatsAvailable),
      featured: pkg.featured || false, highlights: pkg.highlights || "", inclusions: pkg.inclusions || "",
      images: (pkg.images || []).join("\n"),
    });
    setEditId(pkg.id);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title, location: form.location, description: form.description,
      price: Number(form.price), duration: Number(form.duration), seatsAvailable: Number(form.seatsAvailable),
      featured: form.featured, highlights: form.highlights || undefined, inclusions: form.inclusions || undefined,
      images: form.images.split("\n").map(s => s.trim()).filter(Boolean),
    };
    if (editId) updatePkg.mutate({ id: editId, data });
    else createPkg.mutate({ data });
  };

  const f = (key: keyof PkgForm) => ({ value: form[key] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <AdminLayout title="Manage Packages">
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="gap-2" data-testid="button-add-package">
          <Plus className="w-4 h-4" /> Add Package
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {packages?.map(pkg => (
            <div key={pkg.id} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3" data-testid={`admin-pkg-${pkg.id}`}>
              {pkg.images?.[0] && <img src={pkg.images[0]} className="w-14 h-10 rounded-lg object-cover shrink-0" alt="" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{pkg.title}</p>
                <p className="text-xs text-muted-foreground">{pkg.location} · ₹{pkg.price.toLocaleString("en-IN")} · {pkg.duration}d · {pkg.seatsAvailable} seats</p>
              </div>
              {pkg.featured && <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">Featured</span>}
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(pkg)} data-testid={`button-edit-pkg-${pkg.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deletePkg.mutate({ id: pkg.id })} data-testid={`button-delete-pkg-${pkg.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
          {!packages?.length && <p className="text-sm text-muted-foreground text-center py-10">No packages yet.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Package" : "New Package"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Title</Label><Input {...f("title")} required data-testid="input-pkg-title" /></div>
              <div><Label className="text-xs mb-1 block">Location</Label><Input {...f("location")} required data-testid="input-pkg-location" /></div>
            </div>
            <div><Label className="text-xs mb-1 block">Description</Label><Textarea {...f("description")} rows={3} required /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs mb-1 block">Price (₹)</Label><Input {...f("price")} type="number" required /></div>
              <div><Label className="text-xs mb-1 block">Duration (days)</Label><Input {...f("duration")} type="number" required /></div>
              <div><Label className="text-xs mb-1 block">Seats</Label><Input {...f("seatsAvailable")} type="number" required /></div>
            </div>
            <div><Label className="text-xs mb-1 block">Images (one URL per line)</Label><Textarea {...f("images")} rows={2} placeholder="https://..." /></div>
            <div><Label className="text-xs mb-1 block">Highlights (one per line)</Label><Textarea {...f("highlights")} rows={2} /></div>
            <div><Label className="text-xs mb-1 block">Inclusions (one per line)</Label><Textarea {...f("inclusions")} rows={2} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={v => setForm(p => ({ ...p, featured: v }))} id="featured" />
              <Label htmlFor="featured" className="text-sm">Featured Package</Label>
            </div>
            <Button type="submit" className="w-full" disabled={createPkg.isPending || updatePkg.isPending} data-testid="button-save-package">
              {editId ? "Update Package" : "Create Package"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
