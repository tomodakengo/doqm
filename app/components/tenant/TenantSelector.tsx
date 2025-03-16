"use client";

import { getUserTenantsAction } from "@/app/actions/tenant";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Tenant {
  id: string;
  name: string;
  description: string;
  plan: string;
  role: string;
}

interface TenantSelectorProps {
  currentTenantId?: string;
}

export default function TenantSelector({
  currentTenantId,
}: TenantSelectorProps) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getUserTenantsAction();
        if (!result.success) {
          setError(result.error);
          return;
        }

        if (result.data) {
          // データをTenant型に変換
          const formattedTenants = result.data.map((t: any) => ({
            id: t.id,
            name: t.tenants?.name || "不明なテナント",
            description: t.tenants?.description || "",
            plan: t.tenants?.plan || "basic",
            role: t.role,
          }));

          setTenants(formattedTenants);

          // 現在のテナントを設定
          if (currentTenantId && formattedTenants.length > 0) {
            const tenant = formattedTenants.find(
              (t) => t.id === currentTenantId
            );
            if (tenant) {
              setCurrentTenant(tenant);
            }
          } else if (formattedTenants.length > 0) {
            // デフォルトは最初のテナント
            setCurrentTenant(formattedTenants[0]);
          }
        }
      } catch (error: unknown) {
        console.error("テナント取得エラー:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "テナントの取得中にエラーが発生しました";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [currentTenantId]);

  const handleTenantChange = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    router.push(`/tenants/${tenant.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center h-9 border-dashed"
        >
          {loading ? (
            <LucideIcons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LucideIcons.Building2 className="w-4 h-4 mr-2" />
          )}
          <span className="truncate max-w-[120px]">
            {currentTenant?.name || "テナント選択"}
          </span>
          <LucideIcons.ChevronDown className="w-4 h-4 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>テナント切り替え</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <LucideIcons.Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-2 text-sm">
            <LucideIcons.AlertCircle className="w-4 h-4 inline-block mr-1" />
            {error}
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-gray-500 p-2 text-sm">テナントがありません</div>
        ) : (
          tenants.map((tenant) => (
            <DropdownMenuItem
              key={tenant.id}
              className="flex items-center"
              onSelect={() => handleTenantChange(tenant)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <LucideIcons.Building2 className="w-4 h-4 mr-2" />
                  <span className="truncate max-w-[120px]">{tenant.name}</span>
                </div>
                {tenant.id === currentTenant?.id && (
                  <LucideIcons.Check className="w-4 h-4 ml-2 text-green-500" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/tenants")}>
          <LucideIcons.Settings className="w-4 h-4 mr-2" />
          <span>テナント管理</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/tenants/new")}>
          <LucideIcons.PlusCircle className="w-4 h-4 mr-2" />
          <span>新規テナント作成</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
