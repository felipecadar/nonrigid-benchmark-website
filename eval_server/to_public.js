
import fs from 'fs'
import spawn from 'child_process'
import fetch from 'node-fetch'

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});
const prisma = new PrismaClient({ adapter });

// Create a single supabase client for interacting with your database
const my_userid = process.env.MY_USER_ID

async function main() {

    // update all Status.FAILED to Status.PENDING
    await prisma.experiment.updateMany({
        where: {
            userId: my_userid,
        },
        data:{
            public: true,
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
