import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Tenants
export function useTenants(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ["tenants", params],
    queryFn: () => api.tenants.list(params),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ["tenants", id],
    queryFn: () => api.tenants.get(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.tenants.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.tenants.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", id] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tenants.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useDeleteTenantPermanent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.tenants.deletePermanent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

// Users
export function useUsers(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.users.list(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.users.get(id),
    enabled: !!id,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => api.users.me(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUserPermanent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.users.deletePermanent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useChangePassword(id: string) {
  return useMutation({
    mutationFn: (data: { current_password?: string; new_password: string }) =>
      api.users.changePassword(id, data),
  });
}

// Roles
export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => api.roles.list(),
  });
}

// Clients
export function useClients(params?: {
  skip?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => api.clients.list(params),
  });
}

export function useClient(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => api.clients.get(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.clients.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.clients.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.clients.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useClientAccounts(id: string) {
  return useQuery({
    queryKey: ["clients", id, "accounts"],
    queryFn: () => api.clients.accounts(id),
    enabled: !!id,
  });
}

export function useClientDocuments(id: string) {
  return useQuery({
    queryKey: ["clients", id, "documents"],
    queryFn: () => api.clients.documents(id),
    enabled: !!id,
  });
}

// Modules
export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: () => api.modules.list(),
  });
}

export function useEnableModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      moduleId,
      tenantId,
    }: {
      moduleId: string;
      tenantId?: string;
    }) => api.modules.enable(moduleId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
}

export function useDisableModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      moduleId,
      tenantId,
    }: {
      moduleId: string;
      tenantId?: string;
    }) => api.modules.disable(moduleId, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });
}

// Audit Logs
export function useAuditLogs(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ["audit", params],
    queryFn: () => api.audit.list(params),
  });
}

// Statistics
export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => api.stats.dashboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useTenantStats() {
  return useQuery({
    queryKey: ["stats", "tenant"],
    queryFn: () => api.stats.tenant(),
    refetchInterval: 30000,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["stats", "health"],
    queryFn: () => api.stats.health(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

