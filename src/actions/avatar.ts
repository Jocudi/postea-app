'use server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

export async function updateAvatar(base64Image: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).id) return { success: false, error: 'No autorizado' }
  const userId = (session.user as any).id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { image: base64Image }
    })
    revalidatePath('/perfil')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error guardando avatar' }
  }
}
