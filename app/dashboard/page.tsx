import { AlertCircle, BarChart, CheckCircle2, Clock } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";

export default function DashboardPage() {
	const stats = [
		{
			label: "合計テストケース",
			value: "124",
			icon: BarChart,
			trend: "+12%",
			trendUp: true,
		},
		{
			label: "実行済み",
			value: "98",
			icon: CheckCircle2,
			trend: "79%",
			trendUp: true,
		},
		{
			label: "実行待ち",
			value: "18",
			icon: Clock,
			trend: "-5",
			trendUp: false,
		},
		{
			label: "失敗",
			value: "8",
			icon: AlertCircle,
			trend: "+2",
			trendUp: false,
		},
	];

	return (
		<MainLayout>
			<div className="space-y-8">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
					<p className="text-gray-600 mt-1">テスト実行の概要と最新の状況</p>
				</div>

				{/* 統計カード */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
						>
							<div className="flex items-center justify-between">
								<stat.icon className="h-6 w-6 text-gray-400" />
								<span
									className={`text-sm font-medium ${
										stat.trendUp ? "text-green-600" : "text-red-600"
									}`}
								>
									{stat.trend}
								</span>
							</div>
							<p className="mt-4 text-2xl font-semibold text-gray-900">
								{stat.value}
							</p>
							<p className="text-gray-600">{stat.label}</p>
						</div>
					))}
				</div>

				{/* 最近のアクティビティ */}
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">
							最近のアクティビティ
						</h2>
					</div>
					<div className="divide-y divide-gray-200">
						{[...Array(5)].map((_, index) => (
							<div key={index} className="p-6 hover:bg-gray-50">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-2 h-2 rounded-full bg-blue-600" />
										<p className="text-gray-900">
											テストケース「ログイン機能」が実行されました
										</p>
									</div>
									<span className="text-sm text-gray-500">2時間前</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</MainLayout>
	);
}
