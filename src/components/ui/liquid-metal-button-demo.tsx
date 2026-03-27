import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

export function LiquidMetalButtonDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 border border-white/5 rounded-3xl bg-black/20 backdrop-blur-sm mt-10">
      <h3 className="text-xl font-medium text-white/80">Shader Buttons</h3>
      <div className="flex items-center gap-8">
        <LiquidMetalButton label="Get Started" />
        <LiquidMetalButton viewMode="icon" />
      </div>
    </div>
  );
}
