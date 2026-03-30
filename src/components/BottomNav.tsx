'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, User, Trophy } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Explorar', href: '/', icon: MapPin },
    { name: 'Ranking', href: '/ranking', icon: Trophy },
    { name: 'Perfil', href: '/perfil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_25px_-10px_rgba(0,0,0,0.1)]">
      <div className="max-w-md mx-auto w-full flex justify-between items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith('/locales') && item.href === '/')
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-purple-100 text-purple-600 scale-110 shadow-inner' : 'text-slate-400 group-hover:bg-slate-50 group-hover:text-purple-400'}`}>
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-wide transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
