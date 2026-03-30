"use client"

import { useState } from 'react'
import { MapPin, Loader2, CheckCircle2, AlertCircle, Share2 } from 'lucide-react'
import { GooglePlaceData, createCheckin } from '@/actions/checkin'
import LiveCamera from './LiveCamera'

export default function CheckinButton({ placeData }: { placeData: GooglePlaceData }) {
  const [step, setStep] = useState<'idle' | 'locating' | 'camera' | 'success'>('idle')
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string; placeData?: any } | null>(null)
  
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)

  const handleStartCheckin = () => {
    setStep('locating')
    setResult(null)

    if (!navigator.geolocation) {
      setResult({ success: false, error: 'Geolocalización no soportada.' })
      setStep('idle')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await createCheckin(placeData, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          
          if (res.success) {
            setStep('camera')
            setResult(res)
          } else {
            setResult(res)
            setStep('idle')
          }
        } catch (err) {
          setResult({ success: false, error: 'Error de red.' })
          setStep('idle')
        }
      },
      (geoErr) => {
        setResult({ success: false, error: 'Por favor, permite el acceso a tu ubicación.' })
        setStep('idle')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleCameraCapture = (dataUrl: string) => {
    setPhotoDataUrl(dataUrl)
    setStep('success')
  }

  const handleShare = async () => {
    if (!photoDataUrl) return
    
    const arr = photoDataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    const file = new File([u8arr], `postea-${Date.now()}.jpg`, { type: mime })

    const shareData = {
      title: `Visitando ${placeData.name}`,
      text: `🔥 Conquistando ${placeData.name} en la App Postea. ¡Conviértete en el alcalde!`,
      files: [file]
    }

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      alert('Tu dispositivo no soporta compartir imágenes de forma nativa directamente. Puedes guardar la imagen dejando presionado el video.')
    }
  }

  if (step === 'camera') {
    return <LiveCamera placeName={placeData.name} onCapture={handleCameraCapture} onCancel={() => setStep('idle')} />
  }

  if (step === 'success') {
    return (
      <div className="bg-gradient-to-b from-purple-50 to-white rounded-3xl p-8 border border-purple-100 text-center shadow-lg transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">¡Evidencia Aprobada!</h3>
        <p className="text-sm text-slate-500 font-medium mb-8">
          Obtuviste +10 puntos. Comparte tu foto (con la marca de agua) a tu historia para asegurar tu territorio y buscar la alcaldía.
        </p>

        {photoDataUrl && (
          <img src={photoDataUrl} alt="Preview" className="w-40 h-auto rounded-xl mx-auto mb-6 shadow-md border-2 border-white" />
        )}

        <button 
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-extrabold py-5 px-6 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] transform transition-all"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartir a Historia
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {result && !result.success && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
          <span className="font-medium">{result.error}</span>
        </div>
      )}

      <button
        onClick={handleStartCheckin}
        disabled={step === 'locating'}
        className={`w-full font-extrabold py-5 px-6 rounded-2xl flex items-center justify-center shadow-lg transform transition-all ${
          step === 'locating' 
            ? 'bg-purple-100 text-purple-400 cursor-wait' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-95 shadow-purple-600/20'
        }`}
      >
        {step === 'locating' ? (
          <>
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            Verificando Coordenadas...
          </>
        ) : (
          <>
            <MapPin className="w-6 h-6 mr-3" />
            Hacer Check-in Aquí
          </>
        )}
      </button>
    </div>
  )
}
