'use client'
import { useState, useRef } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { updateAvatar } from '@/actions/avatar'

export default function AvatarUpload() {
  const [src, setSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 })
  const imageRef = useRef<HTMLImageElement>(null)
  const [uploading, setUploading] = useState(false)

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => setSrc(reader.result?.toString() || null))
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSave = async () => {
    if (!imageRef.current || !crop.width || !crop.height) return
    setUploading(true)

    const canvas = document.createElement('canvas')
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    
    // Configurar canvas para mantener resolución decente
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(
        imageRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )
      const base64Image = canvas.toDataURL('image/jpeg', 0.8)
      await updateAvatar(base64Image)
      setSrc(null)
    }
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center w-full mt-5 relative z-20">
      {src ? (
        <div className="bg-slate-900/50 p-5 rounded-[2rem] w-full flex flex-col items-center backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
           <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} circularCrop className="rounded-xl overflow-hidden shadow-inner">
             <img src={src} ref={imageRef} alt="Crop" className="max-h-64 object-contain" />
           </ReactCrop>
           <div className="flex gap-3 w-full mt-6">
             <button onClick={() => setSrc(null)} className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-[1.5rem] text-white font-bold text-sm transition-colors">Cancelar</button>
             <button onClick={handleSave} disabled={uploading} className="flex-1 py-4 bg-white text-purple-700 hover:bg-slate-50 rounded-[1.5rem] font-black text-sm transition-colors shadow-lg active:scale-95">{uploading ? 'Guardando...' : 'Guardar Avatar'}</button>
           </div>
        </div>
      ) : (
        <label className="cursor-pointer bg-white/10 hover:bg-white/20 transition-all px-8 py-3 rounded-full border border-white/20 text-white font-bold tracking-wide text-xs shadow-inner flex items-center justify-center relative overflow-hidden group">
          <span className="group-hover:scale-105 transition-transform">Subir Foto</span>
          <input type="file" accept="image/*" onChange={onSelectFile} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </label>
      )}
    </div>
  )
}
