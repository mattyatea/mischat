import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function UserSearch(userid) {
    const user_search = await prisma.user.findUnique({
        where: {
            useratmc: userid
        }
    })
    return user_search
}