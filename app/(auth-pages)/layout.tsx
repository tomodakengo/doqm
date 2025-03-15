export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="max-w-max max-h-screen flex flex-col gap-12 items-start">
			{children}
		</div>
	);
}
