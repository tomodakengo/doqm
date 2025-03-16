import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "../../../components/layout/MainLayout";

export default function TeamDetailLoading() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div>
          <Skeleton className="h-10 w-72 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </MainLayout>
  );
}
