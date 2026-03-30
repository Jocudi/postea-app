import { notFound } from 'next/navigation'
import { MapPin, ArrowLeft, Crown, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import CheckinButton from './CheckinButton'
import { prisma } from '@/lib/prisma'

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let place: any = await prisma.place.findFirst({
    where: {
      OR: [
        { id },
        { googlePlaceId: id }
      ]
    },
    include: { checkins: true }
  })

  // Fallback a Google Places API si no reside en Prisma
  if (!place) {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`)
    const data = await res.json()
    if (data.status !== 'OK') return notFound()
    
    const gPlace = data.result
    
    let photoUrl = null
    if (gPlace.photos && gPlace.photos.length > 0) {
       photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${gPlace.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    }

    place = {
      id: gPlace.place_id,
      googlePlaceId: gPlace.place_id,
      name: gPlace.name,
      category: gPlace.types?.[0]?.replace('_', ' ') || 'Lugar',
      latitude: gPlace.geometry.location.lat,
      longitude: gPlace.geometry.location.lng,
      imageUrl: photoUrl,
      checkins: []
    }
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  let mayor = null;
  let mayorVisits = 0;

  // Si existe local en DB (porque fallback le pusimos googlePlaceId pero no está guardado aún no tendrá checkins)
  if (place.checkins && place.checkins.length > 0) {
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
      mayor = await prisma.user.findUnique({ where: { id: monthCheckins[0].userId } })
      mayorVisits = monthCheckins[0]._count.userId
    }
  }

  // Data formateada para Upsert de CheckinButton
  const placeData = {
    googlePlaceId: place.googlePlaceId || place.id, // Compatibilidad con DB antigua
    name: place.name,
    category: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    imageUrl: place.imageUrl || undefined
  }

  return (
    <div className="pb-8">
      <div className="relative h-72 bg-slate-200">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <MapPin className="w-12 h-12 opacity-50" />
          </div>
        )}
        <Link href="/" className="absolute top-6 left-4 bg-black/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-black/40 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-purple-900/10 border border-slate-50">
          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block">
            {place.category}
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-4 leading-tight">{place.name}</h1>
          <p className="text-slate-500 font-semibold mt-2 flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-1 text-purple-400" /> Abierto ahora
          </p>

          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-5 border border-amber-100 flex items-center shadow-sm">
            <div className="relative mr-4 shrink-0">
              {mayor?.image ? (
                <img src={mayor.image} alt={mayor.name || 'Alcalde'} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-inner" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-100 flex items-center justify-center border-2 border-amber-400 text-amber-600 shadow-inner">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-amber-300 to-yellow-200 p-1.5 rounded-full text-amber-700 shadow-md">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest leading-none">Alcaldía del Mes</p>
              <p className="font-extrabold text-slate-800 mt-1 flex items-center text-lg leading-tight">
                {mayor ? mayor.name : 'Nadie aún'}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 tracking-wide">
                {mayor ? `${mayorVisits} check-in(s) válidos` : '¡Sé el primero en conquistarlo!'}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <CheckinButton placeData={placeData} />
          </div>
        </div>
      </div>
    </div>
  )
}
