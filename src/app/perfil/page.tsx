import { Trophy, User as UserIcon, MapPin, Award } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import AvatarUpload from './AvatarUpload'
import { AuthButtons } from '@/components/AuthButtons'
import { prisma } from '@/lib/prisma'

async function getProfileData() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).id) return null

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } })
  
  if (!user) return null

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const places = await prisma.place.findMany()
  let mayorCount = 0
  
  for (const place of places) {
    const monthCheckins = await prisma.checkin.groupBy({
      by: ['userId'],
      where: {
        placeId: place.id,
        createdAt: { gte: startOfMonth },
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 1
    })
    
    if (monthCheckins.length > 0 && monthCheckins[0].userId === user.id) {
      mayorCount++
    }
  }

  const recentCheckins = await prisma.checkin.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { place: true }
  })

  return { user, mayorCount, recentCheckins }
}

export default async function ProfilePage() {
  const data = await getProfileData()

  if (!data) {
    return (
      <div className="pb-24 flex text-slate-900 justify-center">
        <AuthButtons signedIn={false} />
      </div>
    )
  }

  const { user, mayorCount, recentCheckins } = data
  const isVip = user.points >= 100
  const title = isVip ? "Ciudadano VIP" : "Ciudadano"

  return (
    <div className="p-6 pb-24">
      <header className="mb-6 pt-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mi Perfil</h1>
      </header>

      {/* Main Card */}
      <div className={`rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all ${isVip ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 shadow-orange-900/20' : 'bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-800 shadow-purple-900/20'}`}>
        <div className="absolute -top-6 -right-6 p-8 opacity-10">
           <Trophy className="w-56 h-56 transform rotate-12" />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className={`p-1 rounded-full backdrop-blur-md border shadow-inner ${isVip ? 'bg-amber-100/20 border-white/40' : 'bg-white/20 border-white/20'}`}>
            {user.image ? (
              <img src={user.image} alt={user.name || 'Avatar'} className="w-16 h-16 rounded-[1.2rem] object-cover" />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-[1.2rem]">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-black drop-shadow-sm leading-none">{user.name}</h2>
            <p className={`font-bold tracking-wide mt-1.5 uppercase text-[11px] px-2.5 py-1 rounded-full inline-block ${isVip ? 'bg-orange-800/30 text-amber-200' : 'bg-black/20 text-purple-200'}`}>{title}</p>
          </div>
        </div>

        <AvatarUpload />

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div className="bg-black/20 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/10 shadow-inner">
            <p className="text-[11px] text-white/70 font-black uppercase tracking-widest mb-1.5 drop-shadow-sm">Puntos</p>
            <p className="text-4xl font-black tracking-tighter">{user.points}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/20 shadow-inner">
            <p className="text-[11px] text-white/80 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
               Alcaldías <Award className="w-4 h-4" />
            </p>
            <p className="text-4xl font-black tracking-tighter">{mayorCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-10">
         <AuthButtons signedIn={true} />
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-black text-slate-800 mb-6 px-1 tracking-tight">Actividad Reciente</h3>
        
        {recentCheckins.length === 0 ? (
           <p className="text-slate-400 font-medium text-center py-10 bg-slate-100/50 rounded-3xl border border-dashed border-slate-300">
             Aún no tienes visitas documentadas.
           </p>
        ) : (
          <div className="space-y-4">
            {recentCheckins.map((checkin) => (
              <div key={checkin.id} className="bg-white p-5 rounded-[2rem] flex items-center gap-4 shadow-sm border border-slate-100 transition-transform active:scale-95">
                <div className={`p-3.5 rounded-2xl ${isVip ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-600'}`}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg leading-tight">{checkin.place.name}</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                    {checkin.createdAt.toLocaleDateString('es-MX', { 
                      day: 'numeric', month: 'short'
                    })} • {checkin.createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full shadow-inner border border-emerald-100">
                    +10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

