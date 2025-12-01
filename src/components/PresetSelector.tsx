import { Card } from "@/components/ui/card";
import { Link, Wifi, Calendar, User, FileText } from "lucide-react";
import { toast } from "sonner";

interface PresetSelectorProps {
  onPresetSelect: (text: string) => void;
}

export const PresetSelector = ({ onPresetSelect }: PresetSelectorProps) => {
  const presets = [
    {
      icon: Link,
      label: "URL",
      example: "https://example.com",
      description: "Website link",
    },
    {
      icon: FileText,
      label: "Text",
      example: "Hello! This is a QR code with custom text.",
      description: "Plain text",
    },
    {
      icon: User,
      label: "vCard",
      example: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD",
      description: "Contact card",
    },
    {
      icon: Wifi,
      label: "Wi-Fi",
      example: "WIFI:T:WPA;S:NetworkName;P:Password123;;",
      description: "Network access",
    },
    {
      icon: Calendar,
      label: "Event",
      example: "BEGIN:VEVENT\nSUMMARY:Team Meeting\nDTSTART:20250101T120000\nDTEND:20250101T130000\nEND:VEVENT",
      description: "Calendar event",
    },
  ];

  const handlePresetClick = (example: string, label: string) => {
    onPresetSelect(example);
    toast.success(`${label} preset applied!`);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quick Presets</label>
      <div className="grid grid-cols-5 gap-2">
        {presets.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset.example, preset.label)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/10 hover:border-primary transition-smooth group"
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth" />
              <span className="text-xs font-medium">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
