import { Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "./AdminDashboard";
import { useListContacts, getListContactsQueryKey } from "@workspace/api-client-react";

export default function AdminContacts() {
  const { data: contacts, isLoading } = useListContacts({ query: { queryKey: getListContactsQueryKey() } });

  return (
    <AdminLayout title="Contact Submissions">
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {contacts?.map(c => (
            <div key={c.id} className="bg-card border border-card-border rounded-xl p-5" data-testid={`contact-${c.id}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    <p className="text-xs text-muted-foreground ml-auto">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-medium mb-1">{c.subject}</p>
                  <p className="text-sm text-muted-foreground">{c.message}</p>
                </div>
              </div>
            </div>
          ))}
          {!contacts?.length && <p className="text-sm text-muted-foreground text-center py-10">No contact submissions yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
