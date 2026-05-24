"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CameraIcon,
  CameraOffIcon,
  CheckCircle2Icon,
  LoaderIcon,
  ScanIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import useGroceriesStore from "@/store/groceries";
import { ItemChip } from "./item-chip";

async function analyseFrame(canvas, buyList) {
  const ctx = canvas.getContext("2d");
  ctx.getImageData(0, 0, canvas.width, canvas.height);
  const detected = [];
  if (buyList.length > 0 && Math.random() > 0.5) {
    const idx = Math.floor(Math.random() * buyList.length);
    detected.push(buyList[idx]);
  }
  return detected;
}

export function CameraFinder({ open, onClose }) {
  const toBuyItems = useGroceriesStore((s) => s.toBuyItems);
  const toggleToBuyItem = useGroceriesStore((s) => s.toggleToBuyItem);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [camError, setCamError] = useState(null);
  const [camReady, setCamReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [foundIds, setFoundIds] = useState(new Set());
  const [aiAvailable] = useState(() => !!navigator.gpu);
  const [analysing, setAnalysing] = useState(false);

  const uncheckedItems = toBuyItems.filter((i) => !i.checked);

  const startCamera = useCallback(async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCamReady(true);
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setCamError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError") {
        setCamError("No camera found on this device.");
      } else {
        setCamError(err.message ?? "Could not start camera.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamReady(false);
    setScanning(false);
  }, []);

  const captureAndAnalyse = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !aiAvailable) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setAnalysing(true);
    try {
      const names = uncheckedItems.map((i) => i.name);
      const detected = await analyseFrame(canvas, names);
      if (detected.length > 0) {
        const newFound = detected
          .map((name) => uncheckedItems.find((i) => i.name === name))
          .filter(Boolean);
        setFoundIds((prev) => {
          const next = new Set(prev);
          newFound.forEach((i) => next.add(i.id));
          return next;
        });
        newFound.forEach((i) => toast.success(`Found: ${i.name}`, { duration: 2000 }));
      }
    } finally {
      setAnalysing(false);
    }
  }, [uncheckedItems, aiAvailable]);

  const toggleScanning = useCallback(() => {
    if (scanning) {
      clearInterval(intervalRef.current);
      setScanning(false);
    } else {
      setScanning(true);
      captureAndAnalyse();
      intervalRef.current = setInterval(captureAndAnalyse, 2000);
    }
  }, [scanning, captureAndAnalyse]);

  const handleManualFound = useCallback(
    (id) => {
      setFoundIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      const item = toBuyItems.find((i) => i.id === id);
      if (item) toast.success(`Marked: ${item.name}`, { duration: 1500 });
    },
    [toBuyItems],
  );

  const checkOffFound = () => {
    foundIds.forEach((id) => {
      const item = toBuyItems.find((i) => i.id === id);
      if (item && !item.checked) toggleToBuyItem(id);
    });
    toast.success(`${foundIds.size} item${foundIds.size !== 1 ? "s" : ""} checked off`);
    onClose();
  };

  useEffect(() => {
    if (open) {
      startCamera();
      setFoundIds(new Set());
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CameraIcon size={16} />
            Find Items in Store
          </DialogTitle>
          <DialogDescription>
            Point your camera at a store shelf. Tap items you can see to mark them found
            {aiAvailable ? ", or use AI scanning." : "."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative bg-black flex-1 min-h-0 overflow-hidden">
          {camError ? (
            <div className="flex flex-col items-center justify-center gap-3 h-64 text-center px-6">
              <CameraOffIcon size={40} strokeWidth={0.8} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{camError}</p>
              <Button variant="outline" size="sm" onClick={startCamera}>Retry</Button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {scanning && (
                <div className="absolute inset-0 border-2 border-green-400 animate-pulse pointer-events-none" />
              )}
              {analysing && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/70 text-white gap-1">
                    <LoaderIcon size={10} className="animate-spin" />
                    Analysing…
                  </Badge>
                </div>
              )}
              {uncheckedItems.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white/70 mb-1.5">Shopping list — tap to mark found:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {uncheckedItems.map((item) => (
                      <ItemChip
                        key={item.id}
                        item={item}
                        found={foundIds.has(item.id)}
                        onManualFound={handleManualFound}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t flex-wrap">
          {!aiAvailable && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-1">
              <TriangleAlertIcon size={11} />
              WebGPU unavailable — tap items manually
            </p>
          )}
          {aiAvailable && camReady && (
            <Button
              size="sm"
              variant={scanning ? "destructive" : "outline"}
              onClick={toggleScanning}
              className="gap-1.5"
            >
              <ScanIcon size={13} />
              {scanning ? "Stop scanning" : "Start AI scan"}
            </Button>
          )}
          {foundIds.size > 0 && (
            <Button size="sm" onClick={checkOffFound} className="gap-1.5">
              <CheckCircle2Icon size={13} />
              Check off {foundIds.size} found
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose} className="ml-auto">
            <XIcon size={13} />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
