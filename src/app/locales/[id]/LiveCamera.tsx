"use client";

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface LiveCameraProps {
  placeName: string;
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function LiveCamera({ placeName, onCapture, onCancel }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ajustar resolución nativa
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pintar video origin
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Pintar Watermark Dinámica
    const fontSize = canvas.width * 0.08; // 8% ancho
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15;
    
    // HashTag
    ctx.font = `italic 900 ${fontSize}px sans-serif`;
    ctx.fillText('#Postea', 40, canvas.height - (fontSize * 2 + 20));
    
    // Place Name
    ctx.font = `600 ${fontSize * 0.5}px sans-serif`;
    ctx.fillText(placeName, 40, canvas.height - 40);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Detener cámara al capturar
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay UI para pre-visualizar cómo se verá */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 pb-28">
           <h2 className="text-white text-4xl font-black italic drop-shadow-xl filter">#Postea</h2>
           <p className="text-white/90 text-xl font-semibold drop-shadow-md">{placeName}</p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-0 w-full p-6 bg-black/80 backdrop-blur-md pb-10 flex justify-center items-center gap-12">
        <button 
          onClick={() => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            onCancel();
          }}
          className="text-white/60 font-semibold"
        >
          Cancelar
        </button>
        
        <button 
          onClick={takePhoto}
          className="w-20 h-20 bg-white rounded-full p-1.5 flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-full h-full border-[3px] border-slate-900 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-slate-800" />
          </div>
        </button>

        <div className="w-16"></div> {/* Spacer for balance */}
      </div>
    </div>
  )
}
