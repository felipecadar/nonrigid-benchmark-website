// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { PrismaClient, Status } from '@prisma/client'
import fs from 'fs'
import spawn from 'child_process'
// const http = require('http'); // or 'https' for https:// URLs
import fetch from 'node-fetch'
const prisma = new PrismaClient()
const thisDir = fs.realpathSync(process.cwd())

async function eval_loop() {
    const all_not_processed = await prisma.experiment.findMany({
        where: {
            status: Status.PENDING
        }
    })

    const dir = process.env.EXPERIMENT_DIR ?  process.env.EXPERIMENT_DIR : './experiments'
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    for (const experiment of all_not_processed) {
        // download file experiment.matchFileURL 
        const matchFileURL = experiment.matchFileURL
        const path = `${dir}/${experiment.id}.json`
        console.log(`Downloading ${matchFileURL} to ${path}`)

        // download file
        const response = await fetch(matchFileURL)
        const buffer = await response.text()

        fs.writeFileSync(path, buffer)
        console.log(`Downloaded ${matchFileURL} to ${path}`)


        // process file
        // call python script
        const python = spawn.spawn(`python`, [
          `${thisDir}/eval_server/process.py`, 
          '--input',
          path,
          '--dataset',
          experiment.dataset,
          '--split',
          experiment.split,
        ])
        python.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        python.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })
        
        // on start
        python.on('spawn', async () => {
          await prisma.experiment.update({
              where: {
                  id: experiment.id
              },
              data: {
                  status: Status.PROCESSING
              }
          })        
        })

        python.on('close', async (code) => {
            console.log(`child process exited with code ${code}`)
            // read file + .out 
            const outPath = path + '.out'
            const out = fs.readFileSync(outPath, 'utf8')
            // parse ms,ma,mr
            const [ms, ma, mr] = out.split(',')
            // update experiment

            if (code === 0) {
                // update status
                await prisma.experiment.update({
                    where: {
                        id: experiment.id
                    },
                    data: {
                        status: Status.COMPLETED,
                        ms: parseFloat(ms),
                        ma: parseFloat(ma),
                        mr: parseFloat(mr),
                    }
                })
                console.log(`ms: ${ms}, ma: ${ma}, mr: ${mr}`)
            } else {
                // update status
                await prisma.experiment.update({
                    where: {
                        id: experiment.id
                    },
                    data: {
                        status: Status.ERROR
                    }
                })
                console.error(`Error processing experiment ${experiment.id}`)
            }
        })



    }
}

async function main() {
  while (true) {
    await eval_loop()
    await new Promise(r => setTimeout(r, 10000))
  }
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