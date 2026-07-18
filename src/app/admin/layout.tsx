import { ImmersiveBackground } from "@/components/3d/immersive-background";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-immersive relative min-h-[calc(100vh-4rem)]">
      <ImmersiveBackground className="opacity-60" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
