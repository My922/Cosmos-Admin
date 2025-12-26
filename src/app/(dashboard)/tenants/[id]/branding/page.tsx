"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { BrandingForm } from "@/components/tenants/branding-form";
import { Loader2, ArrowLeft, Building2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Tenant } from "@/types";

export default function TenantBrandingPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const tenantId = params.id as string;

  // Fetch tenant details
  const { data: tenant, isLoading, error } = useQuery<Tenant>({
    queryKey: ["tenant", tenantId],
    queryFn: () => api.tenants.get(tenantId) as Promise<Tenant>,
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{t("tenants.tenantNotFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/tenants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("tenants.brandingSettings")}</h1>
          <p className="text-muted-foreground">
            {t("tenants.customizeYourAppearance", { tenantName: tenant.name })}
          </p>
        </div>
      </div>

      {/* Branding Form */}
      <BrandingForm tenantId={tenantId} tenantName={tenant.name} />
    </div>
  );
}

