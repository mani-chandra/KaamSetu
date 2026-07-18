import { ImmersiveBackground } from "@/components/3d/immersive-background";
import { AboutPageContent } from "@/components/about/about-page-content";

export default function AboutPage() {
  return (
    <div className="page-immersive relative min-h-screen">
      <ImmersiveBackground />
      <AboutPageContent />
    </div>
  );
}
