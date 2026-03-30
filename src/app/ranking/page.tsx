import { Trophy, Crown, Medal, UserIcon } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { AuthButtons } from '@/components/AuthButtons'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

async function getRankingData() {
  const session = await getServerSession(authOptions)
  const users = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: 50
  })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const places = await prisma.place.findMany()
  const mayors = []

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

    if (monthCheckins.length > 0) {
      const user = await prisma.user.findUnique({ where: { id: monthCheckins[0].userId } })
      if (user) {
        mayors.push({ place, user, visits: monthCheckins[0]._count.userId })
      }
    }
  }

  return { users, mayors, session }
}

export default async function RankingPage() {
  const { users, mayors, session } = await getRankingData()

  return (
    <div className="p-6 pb-24">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent pb-1 tracking-tight">
          Salón de la Fama
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-1">
          Busca la alcaldía del mes <Trophy className="inline w-5 h-5 text-amber-500 mb-1" />
        </p>
      </header>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-2 mb-12 mt-12 bg-gradient-to-t from-slate-100 to-transparent p-4 rounded-[2rem]">
        {/* 2nd Place */}
        {users[1] && (
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              {users[1].image ? (
                <img src={users[1].image} alt={users[1].name || ''} className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 z-10 relative" />
              ) : (
                <div className="w-16 h-16 bg-slate-200 rounded-full border-4 border-slate-300 flex items-center justify-center z-10 relative"><UserIcon className="text-slate-400" /></div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-700 font-black text-xs px-2 py-0.5 rounded-full z-20 shadow-md">2º</div>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 h-24 rounded-t-xl flex justify-center pt-2 shadow-inner">
               <span className="font-bold text-slate-600 truncate px-1 text-sm">{users[1].name?.split(' ')[0] || 'User'}</span>
            </div>
            <span className="font-black text-slate-500 mt-2 text-sm">{users[1].points} pts</span>
          </div>
        )}

        {/* 1st Place */}
        {users[0] && (
          <div className="flex flex-col items-center flex-1 z-10">
            <Crown className="w-8 h-8 text-amber-400 mb-1 drop-shadow-md" />
            <div className="relative mb-2">
              {users[0].image ? (
                <img src={users[0].image} alt={users[0].name || ''} className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 z-10 relative shadow-xl shadow-amber-500/20" />
              ) : (
                <div className="w-20 h-20 bg-amber-100 rounded-full border-4 border-amber-400 flex items-center justify-center z-10 relative"><UserIcon className="text-amber-500 w-8 h-8" /></div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 font-black text-xs px-2 py-0.5 rounded-full z-20 shadow-md">1º</div>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 h-32 rounded-t-xl flex justify-center pt-2 shadow-inner border-x border-t border-amber-200">
               <span className="font-bold text-amber-900 truncate px-1 text-base">{users[0].name?.split(' ')[0] || 'User'}</span>
            </div>
            <span className="font-black text-amber-600 mt-2 text-lg">{users[0].points} pts</span>
          </div>
        )}

        {/* 3rd Place */}
        {users[2] && (
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              {users[2].image ? (
                <img src={users[2].image} alt={users[2].name || ''} className="w-16 h-16 rounded-full object-cover border-4 border-orange-400 z-10 relative" />
              ) : (
                <div className="w-16 h-16 bg-orange-100 rounded-full border-4 border-orange-400 flex items-center justify-center z-10 relative"><UserIcon className="text-orange-500" /></div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-900 font-black text-xs px-2 py-0.5 rounded-full z-20 shadow-md">3º</div>
            </div>
            <div className="w-full bg-gradient-to-t from-orange-300 to-orange-200 h-20 rounded-t-xl flex justify-center pt-2 shadow-inner border-x border-t border-orange-300">
               <span className="font-bold text-orange-900 truncate px-1 text-sm">{users[2].name?.split(' ')[0] || 'User'}</span>
            </div>
            <span className="font-black text-orange-600 mt-2 text-sm">{users[2].points} pts</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 px-2 flex items-center gap-2">
            Top Global <Medal className="w-6 h-6 text-purple-500" />
          </h2>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {users.slice(3).map((u, index) => (
              <div key={u.id} className="flex items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <span className="w-8 font-black text-slate-300 text-lg mr-2">{index + 4}</span>
                {u.image ? (
                  <img src={u.image} alt={u.name || ''} className="w-10 h-10 rounded-full object-cover mr-3 bg-slate-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex justify-center items-center mr-3"><UserIcon className="w-5 h-5" /></div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 leading-tight">{u.name}</h3>
                  <p className="text-xs font-semibold text-slate-400">{u.points} puntos</p>
                </div>
              </div>
            ))}
            {users.length <= 3 && (
               <p className="p-6 text-center text-slate-400 font-medium">No hay suficientes usuarios aún.</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-2xl font-black text-slate-800 mb-4 px-2 flex items-center gap-2">
            Directorio de Alcaldes <Crown className="w-6 h-6 text-amber-500" />
          </h2>
          {mayors.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {mayors.map((m, i) => (
                <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-4 border border-amber-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Crown className="w-12 h-12 text-amber-500" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {m.user.image ? (
                      <img src={m.user.image} alt={m.user.name || ''} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-sm mb-2" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center text-amber-500 mb-2"><UserIcon className="w-6 h-6" /></div>
                    )}
                    <h4 className="font-black text-slate-800 text-sm leading-tight">{m.user.name?.split(' ')[0]}</h4>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">{m.place.name}</p>
                    <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-semibold text-amber-800">{m.visits} visitas</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-100/50 border border-dashed border-slate-300 rounded-3xl p-6 text-center text-slate-500 font-medium text-sm">
               Aún no hay alcaldes este mes. ¡Aprovecha para reclamar tu territorio local!
            </div>
          )}
        </div>
      </div>
      
      {!session && (
        <div className="mt-12 text-center">
           <AuthButtons signedIn={false} />
        </div>
      )}
    </div>
  )
}
