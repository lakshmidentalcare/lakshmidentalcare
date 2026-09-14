export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: `radial-gradient(circle at center, rgba(115, 48, 138, 0.5) 0%, rgba(30, 7, 38, 0.96) 100%), url('/brand-bg.jpg') center/cover no-repeat fixed`
      }}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
