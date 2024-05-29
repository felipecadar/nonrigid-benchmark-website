// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { PrismaClient, Status } from '@prisma/client'
import fs from 'fs'
import spawn from 'child_process'
import fetch from 'node-fetch'


import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const my_userid = process.env.MY_USER_ID
const prisma = new PrismaClient()

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
