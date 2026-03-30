import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando el seeding de la Base de Datos...')

  const user = await prisma.user.create({
    data: {
      name: 'Usuario Explorador',
      points: 0,
    },
  })
  console.log(`Usuario creado: ${user.name} (ID: ${user.id})`)

  const placesData = [
    {
      name: 'Café La Minerva',
      category: 'Cafetería',
      latitude: 20.674391,
      longitude: -103.387431,
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Los Arcos Restaurante',
      category: 'Restaurante',
      latitude: 20.674681,
      longitude: -103.384824,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Tacos Chapalita',
      category: 'Taquería',
      latitude: 20.676600,
      longitude: -103.385550,
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Pub Inglés Vallarta',
      category: 'Bar',
      latitude: 20.673200,
      longitude: -103.386100,
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Helados Mony',
      category: 'Postres',
      latitude: 20.675000,
      longitude: -103.387000,
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=400',
    },
  ]

  for (const place of placesData) {
    const createdPlace = await prisma.place.create({
      data: place,
    })
    console.log(`Lugar creado: ${createdPlace.name}`)
  }

  console.log('¡Seeding completado con éxito!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
