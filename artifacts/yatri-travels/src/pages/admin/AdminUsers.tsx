import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./AdminDashboard";
import { useListUsers, getListUsersQueryKey, useUpdateUser, useDeleteUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: users, isLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });

  const updateUser = useUpdateUser({ mutation: { onSuccess: () => { toast({ title: "User updated" }); qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); } } });
  const deleteUser = useDeleteUser({ mutation: { onSuccess: () => { toast({ title: "User deleted" }); qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); } } });

  return (
    <AdminLayout title="Manage Users">
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {users?.map(u => (
            <div key={u.id} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3" data-testid={`admin-user-${u.id}`}>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">{u.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <Select
                value={u.role}
                onValueChange={(v) => updateUser.mutate({ id: u.id, data: { role: v as any } })}
                disabled={u.id === currentUser?.id}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0"
                onClick={() => deleteUser.mutate({ id: u.id })}
                disabled={u.id === currentUser?.id}
                data-testid={`button-delete-user-${u.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {!users?.length && <p className="text-sm text-muted-foreground text-center py-10">No users found.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
