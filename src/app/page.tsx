import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import MapWrapper from '@/components/MapWrapper'

async function getPlaces() {
  return await prisma.place.findMany({
    orderBy: { name: 'asc' }
  })
}

export default async function Home() {
  const places = await getPlaces()

  return (
    <div className="p-6">
      <header className="mb-8 pt-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent pb-1">
          Descubre
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-1">
          La Minerva <span className="text-purple-500">📍</span>
        </p>
      </header>

      <MapWrapper places={places} />


      <div className="space-y-6">
        {places.map((place) => (
          <Link href={`/locales/${place.id}`} key={place.id} className="block group">
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-100 hover:-translate-y-1">
              <div className="aspect-[16/9] bg-slate-100 rounded-3xl mb-4 overflow-hidden relative">
                {place.imageUrl ? (
                  <img 
                    src={place.imageUrl} 
                    alt={place.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
                    <MapPin className="w-10 h-10 mb-2 opacity-30" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-wide text-purple-600 shadow-sm uppercase">
                  {place.category}
                </div>
              </div>
              <div className="px-2 pb-1">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                  {place.name}
                </h3>
                <div className="flex items-center text-slate-400 mt-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-1 text-purple-400" />
                  <span>A menos de 1 km</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
