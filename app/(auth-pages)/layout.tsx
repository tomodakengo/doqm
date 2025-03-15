export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-max min-h-screen mx-auto flex items-center justify-center">
      {children}
    </div>
  );
}
