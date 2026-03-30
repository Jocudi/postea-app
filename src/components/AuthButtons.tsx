'use client'
import { signIn, signOut } from 'next-auth/react'

export function AuthButtons({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <button 
        onClick={() => signOut()} 
        className="mt-6 w-full py-4 text-sm font-bold text-white/50 border border-white/10 rounded-[1.5rem] hover:bg-white/5 hover:text-white transition-all shadow-inner"
      >
        Cerrar Sesión
      </button>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 space-y-6">
       <div className="text-center space-y-2">
         <h2 className="text-3xl font-black text-slate-800 tracking-tight">Accede a tu cuenta</h2>
         <p className="text-slate-500 font-medium">Inicia sesión para ganar puntos y personalizar tu avatar.</p>
       </div>
       <button 
         onClick={() => signIn()} 
         className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black py-5 w-full rounded-[1.5rem] shadow-xl shadow-purple-600/30 transition-all text-lg tracking-wide"
       >
          Elegir Método de Ingreso
       </button>
    </div>
  )
}
