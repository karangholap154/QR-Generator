import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "./ColorPicker";
import { Grid3x3, Sparkles, Droplets, Minus } from "lucide-react";

export interface GradientConfig {
  type: "linear" | "radial";
  rotation?: number;
  colorStops: Array<{ offset: number; color: string }>;
}

export interface PatternConfig {
  type: "dots" | "stripes" | "grid" | "none";
  color: string;
  backgroundColor: string;
  size?: number;
}

interface GradientPatternSelectorProps {
  backgroundType: "solid" | "gradient" | "pattern";
  onBackgroundTypeChange: (type: "solid" | "gradient" | "pattern") => void;
  gradient: GradientConfig;
  onGradientChange: (gradient: GradientConfig) => void;
  pattern: PatternConfig;
  onPatternChange: (pattern: PatternConfig) => void;
  solidColor: string;
  onSolidColorChange: (color: string) => void;
}

export const GradientPatternSelector = ({
  backgroundType,
  onBackgroundTypeChange,
  gradient,
  onGradientChange,
  pattern,
  onPatternChange,
  solidColor,
  onSolidColorChange,
}: GradientPatternSelectorProps) => {
  const gradientPresets = [
    { name: "Ocean Blue", colors: ["#1e3a8a", "#3b82f6", "#60a5fa"] },
    { name: "Sunset", colors: ["#dc2626", "#f97316", "#fbbf24"] },
    { name: "Forest", colors: ["#065f46", "#10b981", "#6ee7b7"] },
    { name: "Purple Dream", colors: ["#581c87", "#a855f7", "#d8b4fe"] },
    { name: "Cyber", colors: ["#0891b2", "#06b6d4", "#22d3ee"] },
    { name: "Fire", colors: ["#7c2d12", "#dc2626", "#fb923c"] },
  ];

  const patternPresets = [
    { name: "Small Dots", type: "dots" as const, size: 4 },
    { name: "Medium Dots", type: "dots" as const, size: 8 },
    { name: "Large Dots", type: "dots" as const, size: 12 },
    { name: "Thin Stripes", type: "stripes" as const, size: 4 },
    { name: "Medium Stripes", type: "stripes" as const, size: 8 },
    { name: "Thick Stripes", type: "stripes" as const, size: 12 },
    { name: "Fine Grid", type: "grid" as const, size: 4 },
    { name: "Medium Grid", type: "grid" as const, size: 8 },
    { name: "Bold Grid", type: "grid" as const, size: 12 },
  ];

  const applyGradientPreset = (colors: string[]) => {
    onGradientChange({
      ...gradient,
      colorStops: colors.map((color, index) => ({
        offset: index / (colors.length - 1),
        color,
      })),
    });
  };

  const applyPatternPreset = (presetType: "dots" | "stripes" | "grid", size: number) => {
    onPatternChange({
      ...pattern,
      type: presetType,
      size,
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={backgroundType} onValueChange={(v) => onBackgroundTypeChange(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solid">Solid</TabsTrigger>
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
          <TabsTrigger value="pattern">Pattern</TabsTrigger>
        </TabsList>

        {/* Solid Color */}
        <TabsContent value="solid" className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <ColorPicker color={solidColor} onChange={onSolidColorChange} />
          </div>
        </TabsContent>

        {/* Gradient */}
        <TabsContent value="gradient" className="space-y-4">
          <div className="space-y-2">
            <Label>Gradient Type</Label>
            <Select
              value={gradient.type}
              onValueChange={(value: "linear" | "radial") =>
                onGradientChange({ ...gradient, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {gradient.type === "linear" && (
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={gradient.rotation?.toString() || "0"}
                onValueChange={(value) =>
                  onGradientChange({ ...gradient, rotation: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Top to Bottom</SelectItem>
                  <SelectItem value="90">Left to Right</SelectItem>
                  <SelectItem value="45">Diagonal ↘</SelectItem>
                  <SelectItem value="135">Diagonal ↙</SelectItem>
                  <SelectItem value="180">Bottom to Top</SelectItem>
                  <SelectItem value="270">Right to Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyGradientPreset(preset.colors)}
                  className="group relative h-12 rounded-lg border-2 border-border hover:border-primary transition-smooth overflow-hidden"
                  style={{
                    background:
                      gradient.type === "radial"
                        ? `radial-gradient(circle, ${preset.colors.join(", ")})`
                        : `linear-gradient(${gradient.rotation || 0}deg, ${preset.colors.join(", ")})`,
                  }}
                >
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-smooth" />
                  <span className="absolute bottom-1 left-0 right-0 text-[10px] font-medium text-white text-center opacity-0 group-hover:opacity-100 transition-smooth drop-shadow-lg">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Custom Colors</Label>
            {gradient.colorStops.map((stop, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-12">
                  {Math.round(stop.offset * 100)}%
                </span>
                <ColorPicker
                  color={stop.color}
                  onChange={(color) => {
                    const newStops = [...gradient.colorStops];
                    newStops[index] = { ...stop, color };
                    onGradientChange({ ...gradient, colorStops: newStops });
                  }}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Pattern */}
        <TabsContent value="pattern" className="space-y-4">
          <div className="space-y-2">
            <Label>Pattern Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {patternPresets.map((preset) => {
                const Icon =
                  preset.type === "dots"
                    ? Droplets
                    : preset.type === "stripes"
                    ? Minus
                    : Grid3x3;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPatternPreset(preset.type, preset.size)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/10 transition-smooth group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pattern Color</Label>
              <ColorPicker color={pattern.color} onChange={(color) => onPatternChange({ ...pattern, color })} />
            </div>
            <div className="space-y-2">
              <Label>Background</Label>
              <ColorPicker
                color={pattern.backgroundColor}
                onChange={(color) => onPatternChange({ ...pattern, backgroundColor: color })}
              />
            </div>
          </div>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Patterns are composited onto the QR code background for a unique aesthetic
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
