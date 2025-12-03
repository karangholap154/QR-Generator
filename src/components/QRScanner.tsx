import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onClose: () => void;
}

export const QRScanner = ({ onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasShownToastRef = useRef(false);
  const qrRegionId = "qr-reader";

  const startScanning = async () => {
    try {
      setError(null);
      setIsInitializing(true);
      hasShownToastRef.current = false;
      
      // First, request camera permission explicitly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the test stream immediately
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr) {
        console.error("Permission error:", permErr);
        setError("Camera access denied. Please allow camera permissions in your browser settings and try again.");
        toast.error("Camera permission denied");
        setIsInitializing(false);
        return;
      }

      // Wait for the DOM element to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrRegionId);
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError("No cameras found on this device");
        toast.error("No cameras found");
        setIsInitializing(false);
        return;
      }

      // Prefer back camera on mobile
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear')
      );
      const cameraId = backCamera?.id || cameras[0].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScannedData((prev) => {
            if (prev !== decodedText && !hasShownToastRef.current) {
              toast.success("QR Code scanned successfully!");
              hasShownToastRef.current = true;
            }
            return decodedText;
          });
        },
        (_errorMessage) => {
          // Ignore scanning errors, they happen constantly while searching
        }
      );

      setIsScanning(true);
      setIsInitializing(false);
      toast.success("Camera started");
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      const errorMsg = err?.message || "Failed to access camera";
      setError(`Error: ${errorMsg}. Please ensure you've granted camera permissions.`);
      toast.error("Failed to start camera");
      setIsInitializing(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const handleCopy = () => {
    if (scannedData) {
      navigator.clipboard.writeText(scannedData);
      toast.success("Copied to clipboard!");
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md shadow-glow max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
          <div>
            <CardTitle className="font-heading flex items-center gap-2 text-base sm:text-xl">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              QR Code Scanner
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Scan QR codes using your device camera
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
          {error && (
            <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs sm:text-sm">
              {error}
            </div>
          )}

          {!isScanning && !scannedData && !isInitializing && (
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
              </div>
              <Button onClick={startScanning} className="w-full h-10 sm:h-11 text-sm" variant="gradient">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            </div>
          )}

          {(isInitializing || isScanning) && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden min-h-[250px] sm:min-h-[300px] bg-muted">
                {isInitializing && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted/90">
                    <div className="text-center">
                      <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-2 animate-pulse" />
                      <p className="text-xs sm:text-sm text-muted-foreground">Initializing camera...</p>
                    </div>
                  </div>
                )}
                <div id={qrRegionId} className="w-full h-full" />
              </div>
          {isScanning && (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Position the QR code within the frame to scan
              </p>
              
              {scannedData && (
                <div className="p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-primary mb-1">Scanned Content:</p>
                      <p className="text-xs sm:text-sm text-foreground break-all">{scannedData}</p>
                    </div>
                  </div>
                  <Button onClick={handleCopy} variant="outline" size="sm" className="w-full mt-3 h-9 text-xs">
                    <Copy className="mr-2 h-3 w-3" />
                    Copy to Clipboard
                  </Button>
                </div>
              )}
              
              <Button onClick={stopScanning} variant="outline" className="w-full h-10 sm:h-11 text-sm">
                Stop Scanning
              </Button>
            </>
          )}
        </div>
      )}
        </CardContent>
      </Card>
    </div>
  );
};
