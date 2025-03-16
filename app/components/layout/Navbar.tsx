import UserNav from "./UserNav";
import TenantSelector from "../tenant/TenantSelector";
import { useParams } from "next/navigation";

export default function Navbar() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">doqm</span>
            </Link>
            <nav>
              <ul className="flex items-center gap-4">
                <li>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    )}
                  >
                    ダッシュボード
                  </Link>
                </li>
                <li>
                  <Link
                    href="/test-suites"
                    className={cn(
                      "text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    )}
                  >
                    テストスイート
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tenants"
                    className={cn(
                      "text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    )}
                  >
                    テナント
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <TenantSelector currentTenantId={tenantId} />
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </div>
  );
}
