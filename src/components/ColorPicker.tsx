import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <div
            className="h-5 w-5 rounded border border-border"
            style={{ backgroundColor: color }}
          />
          <span className="flex-1 text-left font-mono text-sm">{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="space-y-3">
          <HexColorPicker color={color} onChange={onChange} />
          <Input
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
