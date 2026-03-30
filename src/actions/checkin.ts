'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface GooglePlaceData {
  googlePlaceId: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export async function createCheckin(placeData: GooglePlaceData, userCoords: { lat: number; lng: number }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return { success: false, error: 'Debes iniciar sesión para hacer check-in.' }
    }
    const userId = (session.user as any).id;

    // Upsert para registrar el lugar de Google Maps si no existe
    const place = await prisma.place.upsert({
      where: { googlePlaceId: placeData.googlePlaceId },
      update: {}, // Mantener datos si ya existe
      create: {
        googlePlaceId: placeData.googlePlaceId,
        name: placeData.name,
        category: placeData.category,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        imageUrl: placeData.imageUrl
      }
    })

    const distance = getDistanceInMeters(
      userCoords.lat, userCoords.lng,
      place.latitude, place.longitude
    );

    if (distance > 25) {
      return { 
        success: false, 
        error: `Estás a ${distance} metros. Debes estar al menos a 25 metros del local para hacer check-in.` 
      };
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingCheckin = await prisma.checkin.findFirst({
      where: {
        userId: userId,
        placeId: place.id,
        createdAt: { gte: today, lt: tomorrow },
      },
    })

    if (existingCheckin) {
      return { success: false, error: 'Ya realizaste un check-in en este local hoy.' }
    }

    await prisma.$transaction([
      prisma.checkin.create({
        data: {
          userId: userId,
          placeId: place.id,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } }
      })
    ])

    revalidatePath(`/locales/${place.id}`)
    revalidatePath('/perfil')
    revalidatePath('/')
    revalidatePath('/ranking')
    
    return { success: true, message: 'Ubicación verificada. Por favor toma tu foto.', placeData: { dbId: place.id } }
  } catch (error) {
    console.error('Error en checkin:', error)
    return { success: false, error: 'Error del servidor al procesar el check-in.' }
  }
}
