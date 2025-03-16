import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Doqm - テスト管理プラットフォーム",
	description: "AIアシスタントによるテストドキュメント管理プラットフォーム",
};

const geistSans = Geist({
	display: "swap",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" className={geistSans.className} suppressHydrationWarning>
			<body className="bg-background text-foreground">
				<main>
					<div>{children}</div>
				</main>
			</body>
		</html>
	);
}
