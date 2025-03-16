import MainLayout from "@/app/components/layout/MainLayout";

export default function Loading() {
	return (
		<MainLayout>
			<div className="animate-pulse space-y-4">
				<div className="h-8 w-64 bg-gray-200 rounded"></div>
				<div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
				<div className="h-10 w-full bg-gray-200 rounded"></div>
				<div className="h-60 w-full bg-gray-200 rounded"></div>
			</div>
		</MainLayout>
	);
}
