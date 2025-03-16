export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-max h-screen w-full mx-auto flex items-center justify-center">
      {children}
    </div>
  );
}
