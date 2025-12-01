export const generatePatternDataURL = (
    type: "dots" | "stripes" | "grid",
    patternColor: string,
    backgroundColor: string,
    size: number = 8
  ): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
  
    const patternSize = size * 4;
    canvas.width = patternSize;
    canvas.height = patternSize;
  
    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, patternSize, patternSize);
  
    // Draw pattern
    ctx.fillStyle = patternColor;
  
    switch (type) {
      case "dots":
        // Create dot pattern
        const dotRadius = size / 2;
        ctx.beginPath();
        ctx.arc(patternSize / 2, patternSize / 2, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        break;
  
      case "stripes":
        // Create diagonal stripe pattern
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(patternSize, patternSize);
        ctx.lineTo(patternSize - size, patternSize);
        ctx.lineTo(patternSize, patternSize - size);
        ctx.closePath();
        ctx.fill();
        break;
  
      case "grid":
        // Create grid pattern
        ctx.fillRect(0, 0, size, patternSize);
        ctx.fillRect(0, 0, patternSize, size);
        break;
    }
  
    return canvas.toDataURL();
  };
  
  export const generateGradientDataURL = (
    type: "linear" | "radial",
    colorStops: Array<{ offset: number; color: string }>,
    rotation: number = 0,
    size: number = 1000
  ): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
  
    canvas.width = size;
    canvas.height = size;
  
    let gradient: CanvasGradient;
  
    if (type === "radial") {
      gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
    } else {
      // Convert rotation to radians and calculate gradient endpoints
      const angle = (rotation * Math.PI) / 180;
      const centerX = size / 2;
      const centerY = size / 2;
      const length = size * Math.sqrt(2);
  
      const x0 = centerX - (Math.cos(angle) * length) / 2;
      const y0 = centerY - (Math.sin(angle) * length) / 2;
      const x1 = centerX + (Math.cos(angle) * length) / 2;
      const y1 = centerY + (Math.sin(angle) * length) / 2;
  
      gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    }
  
    // Add color stops
    colorStops.forEach((stop) => {
      gradient.addColorStop(stop.offset, stop.color);
    });
  
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  
    return canvas.toDataURL();
  };
  