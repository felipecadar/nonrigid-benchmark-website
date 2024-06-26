// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { PrismaClient, Status } from '@prisma/client'
import fs from 'fs'
import spawn from 'child_process'
import fetch from 'node-fetch'


import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const prisma = new PrismaClient()
const thisDir = fs.realpathSync(process.cwd())

async function eval_loop() {
    const dir = process.env.EXPERIMENT_DIR //'/volumes/nonrigid_dataset/experiments'
    const dataset_dir = process.env.DATASET_DIR //'/volumes/nonrigid_dataset/dataset'

    const dataset_mapping = {
        'Multiple Object': 'test_multiple_obj',
        'Single Object': 'test_single_obj',
        'Scale': 'test_scale',
    }

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    // const all_not_processed = await prisma.experiment.findMany({
    //     where: {
    //         status: Status.PENDING
    //     }
    // })

    // get oldest experiment with status pending
    const all_not_processed = await prisma.experiment.findMany({
        where: {
            status: {
                in: [Status.PENDING, Status.REPROCESS]
            }
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 1
    })

    if (all_not_processed.length === 0) {
        console.log('No experiments to process')
        return true
    }

    for (const experiment of all_not_processed) {
        // download file experiment.matchFileURL 
        const matchFileURL = experiment.matchFileURL
        const path = `${dir}/${experiment.id}.json`
        console.log(`Downloading ${matchFileURL} to ${path}`)
         
        const {data, error} = await supabase.storage.from('nonrigid-benchmark').createSignedUrl(matchFileURL, 60)
        if (error) {
            console.error(error)

            // set to failed
            await prisma.experiment.update({
                where: {
                    id: experiment.id
                },
                data: {
                    status: Status.FAILED
                }
            })
            return false
        }
        const real_url = data.signedUrl

        const datasetPath = `${dataset_dir}/${dataset_mapping[experiment.dataset]}/`

        // download file
        const response = await fetch(real_url)
        const buffer = await response.text()
        let ended = false

        fs.writeFileSync(path, buffer)
        console.log(`Downloaded ${matchFileURL} to ${path}`)
        const outPath = path + '.out'

        // process file
        const python = spawn.spawn('eval_server/run_python.sh', [
        //   '-m nonrigid_benchmark.evaluate',
          `--input ${path}`,
          `--output ${outPath}`,
          `--dataset ${datasetPath}`,
          `--split ${experiment.split}`,
          `--nproc 4`,
        ])
        
        python.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        python.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })

        python.on('error', async (error) => {
            console.error(`error: ${error.message}`)
            ended = true
            await prisma.experiment.update({
                where: {
                    id: experiment.id
                },
                data: {
                    status: Status.FAILED
                }
            })
        }
        )
        
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
            ended = true

            if (code === 0) {
                // read file + .out 
                const outPath = path + '.out'
                const out = fs.readFileSync(outPath, 'utf8')
                // parse ms,ma,mr
                const [ms, ma, mr] = out.split(',')
                // update experiment

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
                        status: Status.FAILED
                    }
                })
                console.error(`Error processing experiment ${experiment.id}`)
            }

        })

        while (!ended) {
            await new Promise(r => setTimeout(r, 1000))
        }

    }
    return true
}

async function main() {
  while (true) {
    const r = await eval_loop()
    if (r) {
        await new Promise(r => setTimeout(r, 10000))
    }
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