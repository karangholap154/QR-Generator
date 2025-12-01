import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ColorPicker } from "./ColorPicker";
import { PresetSelector } from "./PresetSelector";
import { GradientPatternSelector } from "./GradientPatternSelector";
import type { GradientConfig, PatternConfig } from "./GradientPatternSelector";
import { generatePatternDataURL, generateGradientDataURL } from "@/utils/patternGenerator";

export const QRGenerator = () => {
  const [text, setText] = useState("https://karangholap.vercel.app/");
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(10);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [dotsStyle, setDotsStyle] = useState<"rounded" | "dots" | "classy" | "square">("rounded");
  const [cornerSquareStyle, setCornerSquareStyle] = useState<"dot" | "square" | "extra-rounded">("extra-rounded");
  const [cornerDotStyle, setCornerDotStyle] = useState<"dot" | "square">("dot");
  
  const [backgroundType, setBackgroundType] = useState<"solid" | "gradient" | "pattern">("solid");
  const [gradient, setGradient] = useState<GradientConfig>({
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: "#3b82f6" },
      { offset: 0.5, color: "#8b5cf6" },
      { offset: 1, color: "#ec4899" },
    ],
  });
  const [pattern, setPattern] = useState<PatternConfig>({
    type: "dots",
    color: "#e5e7eb",
    backgroundColor: "#ffffff",
    size: 8,
  });
  
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        data: text,
        margin: margin,
        qrOptions: {
          errorCorrectionLevel: errorCorrection,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
        },
        dotsOptions: {
          color: fgColor,
          type: dotsStyle,
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: cornerSquareStyle,
          color: fgColor,
        },
        cornersDotOptions: {
          type: cornerDotStyle,
          color: fgColor,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      let backgroundImage: string | undefined;

      if (backgroundType === "gradient") {
        backgroundImage = generateGradientDataURL(
          gradient.type,
          gradient.colorStops,
          gradient.rotation || 0,
          size
        );
      } else if (backgroundType === "pattern" && pattern.type !== "none") {
        backgroundImage = generatePatternDataURL(
          pattern.type,
          pattern.color,
          pattern.backgroundColor,
          pattern.size || 8
        );
      }

      qrCode.current.update({
        width: size,
        height: size,
        data: text,
        margin: margin,
        qrOptions: {
          errorCorrectionLevel: errorCorrection,
        },
        image: logo || undefined,
        dotsOptions: {
          color: fgColor,
          type: dotsStyle,
        },
        backgroundOptions: backgroundImage
          ? undefined
          : {
              color: bgColor,
            },
        ...(backgroundImage && {
          backgroundOptions: {
            color: "transparent",
          },
        }),
        cornersSquareOptions: {
          type: cornerSquareStyle,
          color: fgColor,
        },
        cornersDotOptions: {
          type: cornerDotStyle,
          color: fgColor,
        },
      });

      // If we have a background image, we need to composite it
      if (backgroundImage && qrCodeRef.current) {
        const canvas = qrCodeRef.current.querySelector("canvas");
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              // Save the QR code
              const qrImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              // Draw background
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Restore QR code on top
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = canvas.width;
              tempCanvas.height = canvas.height;
              const tempCtx = tempCanvas.getContext("2d");
              if (tempCtx) {
                tempCtx.putImageData(qrImageData, 0, 0);
                
                // Draw QR code with transparency
                ctx.globalCompositeOperation = "source-over";
                ctx.drawImage(tempCanvas, 0, 0);
              }
            };
            img.src = backgroundImage;
          }
        }
      }
    }
  }, [
    text,
    size,
    margin,
    errorCorrection,
    fgColor,
    bgColor,
    logo,
    dotsStyle,
    cornerSquareStyle,
    cornerDotStyle,
    backgroundType,
    gradient,
    pattern,
  ]);

  useEffect(() => {
    if (qrCode.current && qrCodeRef.current) {
      qrCodeRef.current.innerHTML = "";
      qrCode.current.append(qrCodeRef.current);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (extension: "png" | "svg") => {
    if (qrCode.current) {
      qrCode.current.download({ extension });
      toast.success(`Downloaded as ${extension.toUpperCase()}!`);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
        toast.success("Logo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 gradient-primary px-4 py-2 rounded-full mb-4 text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">100% Free • No Limits • Privacy-First</span>
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 text-foreground">
            QR Code Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning, professional QR codes in seconds. Fully customizable, completely free, and works entirely offline.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <Card className="shadow-card transition-smooth hover:shadow-glow animate-in fade-in slide-in-from-left-8 duration-700">
            <CardHeader>
              <CardTitle className="font-heading">Customize Your QR Code</CardTitle>
              <CardDescription>
                Adjust settings to create the perfect QR code for your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Selector */}
              <PresetSelector onPresetSelect={setText} />

              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="text">Content</Label>
                <div className="relative">
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter URL, text, or data..."
                    className="min-h-[100px] pr-12"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="background">Background</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                </TabsList>

                {/* Style Tab */}
                <TabsContent value="style" className="space-y-6">
                  <div className="space-y-2">
                    <Label>Foreground Color</Label>
                    <ColorPicker color={fgColor} onChange={setFgColor} />
                  </div>

                  <div className="space-y-2">
                    <Label>Dot Style</Label>
                    <Select value={dotsStyle} onValueChange={(value: any) => setDotsStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="classy">Classy</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Corner Style</Label>
                    <Select value={cornerSquareStyle} onValueChange={(value: any) => setCornerSquareStyle(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                        <SelectItem value="dot">Dot</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Background Tab */}
                <TabsContent value="background" className="space-y-6">
                  <GradientPatternSelector
                    backgroundType={backgroundType}
                    onBackgroundTypeChange={setBackgroundType}
                    gradient={gradient}
                    onGradientChange={setGradient}
                    pattern={pattern}
                    onPatternChange={setPattern}
                    solidColor={bgColor}
                    onSolidColorChange={setBgColor}
                  />
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-2">
                    <Label>Size: {size}px</Label>
                    <Slider
                      value={[size]}
                      onValueChange={([value]) => setSize(value)}
                      min={200}
                      max={1000}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin">Margin</Label>
                    <Input
                      id="margin"
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      min={0}
                      max={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Error Correction</Label>
                    <Select value={errorCorrection} onValueChange={(value: any) => setErrorCorrection(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Logo Tab */}
                <TabsContent value="logo" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Upload Logo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="flex-1"
                      />
                      {logo && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setLogo(null);
                            toast.success("Logo removed");
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    {logo && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <img src={logo} alt="Logo preview" className="max-w-[100px] mx-auto" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Download Buttons */}
              <div className="space-y-2">
              <Label>Download</Label>
              <div className="flex gap-2">
              <Button onClick={() => handleDownload("png")} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    PNG
                  </Button>
                  <Button onClick={() => handleDownload("svg")} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    SVG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="shadow-card transition-smooth hover:shadow-glow animate-in fade-in slide-in-from-right-8 duration-700 sticky top-8">
            <CardHeader>
              <CardTitle className="font-heading">Live Preview</CardTitle>
              <CardDescription>
                Your QR code updates in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg backdrop-blur-sm">
                <div ref={qrCodeRef} className="transition-smooth hover:scale-105" />
              </div>
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-semibold text-primary">🔒 Privacy-First:</span> All processing happens in your browser. No data is sent to any server.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
