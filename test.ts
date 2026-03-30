import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCheckinLogic() {
  console.log('--- INICIANDO TEST DE DOBLE CHECK-IN ---')
  const user = await prisma.user.findFirst()
  const place = await prisma.place.findFirst()
  
  if (!user || !place) return
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  console.log('Insertando Check-in 1...')
  await prisma.checkin.create({ data: { userId: user.id, placeId: place.id } })
  console.log('Check-in 1 registrado exitosamente.')

  const existingCheckin = await prisma.checkin.findFirst({
    where: { userId: user.id, placeId: place.id, createdAt: { gte: today, lt: tomorrow } },
  })

  if (existingCheckin) {
    console.log('✅ ÉXITO: La lógica detectó correctamente que YA EXISTE un check-in para hoy en este local. Operación abortada.')
  } else {
    console.error('❌ FALLO: No se detectó la restricción.')
  }
}

testCheckinLogic()
  .catch(console.error)
  .finally(async () => {
    await prisma.checkin.deleteMany()
    await prisma.$disconnect()
  })
