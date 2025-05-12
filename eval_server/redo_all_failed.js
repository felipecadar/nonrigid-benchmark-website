import { Status } from '@prisma/client'
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});
const prisma = new PrismaClient({ adapter });


async function main() {

    // update all Status.FAILED to Status.PENDING
    await prisma.experiment.updateMany({
        where: {
            status: Status.FAILED
        },
        data:{
            status: Status.PENDING
        }
    })

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
