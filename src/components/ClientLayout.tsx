export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex-1 min-w-0 overflow-x-hidden bg-[#F8FAFC]">
      {children}
    </main>
  );
}