// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { PrismaClient, Status } from '@prisma/client'
import fs from 'fs'
import spawn from 'child_process'
import fetch from 'node-fetch'


import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const prisma = new PrismaClient()
const thisDir = fs.realpathSync(process.cwd())



async function main() {

    // update all Status.FAILED to Status.PENDING
    await prisma.experiment.updateMany({
        where: {
            status: Status.COMPLETED
        },
        data:{
            status: Status.REPROCESS
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