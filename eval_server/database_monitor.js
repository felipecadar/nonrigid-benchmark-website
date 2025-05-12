/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-base-to-string */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import fs from "fs";
import spawn from "child_process";
import fetch from "node-fetch";

// const prisma = new PrismaClient();

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});
const prisma = new PrismaClient({ adapter });

const thisDir = fs.realpathSync(process.cwd());

// https://upload.benchmark.eucadar.com/cmacqy3bx00008s6evii07wwg/SIFT_2048/Single%20Object/deformation_1-illumination-viewpoint.json
const BASE_URL = "upload.benchmark.eucadar.com";

async function eval_loop() {
  const dir = process.env.EXPERIMENT_DIR; //'/volumes/nonrigid_dataset/experiments'
  const dataset_dir = process.env.DATASET_DIR; //'/volumes/nonrigid_dataset/dataset'

  if (!dir) {
    console.error("EXPERIMENT_DIR not set");
    return false;
  }
  if (!dataset_dir) {
    console.error("DATASET_DIR not set");
    return false;
  }

  const dataset_mapping = {
    "Multiple Object": "test_multiple_obj",
    "Single Object": "test_single_obj",
    "Scale": "test_scale",
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // const all_not_processed = await prisma.experiment.findMany({
  //     where: {
  //         status: "PENDING"
  //     }
  // })

  // get oldest experiment with status pending
  const all_not_processed = await prisma.experiment.findMany({
    where: {
      status: {
        in: ["PENDING", "REPROCESS"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 1,
  });

  if (all_not_processed.length === 0) {
    console.log("No experiments to process");
    return true;
  }

  // console.log(all_not_processed);

  for (const experiment of all_not_processed) {
    // download file experiment.matchFileURL
    const matchFileURL = encodeURI("https://" + BASE_URL + "/" + experiment.matchFileURL);
    const path = `${dir}/${experiment.id}.json`;
    // const datasetPath = `${dataset_dir}/${dataset_mapping[experiment.dataset]}/`;

    if (!dataset_mapping[experiment.dataset]) {
      console.error(`Dataset ${experiment.dataset} not found`);
      await prisma.experiment.update({
        where: {
          id: experiment.id,
        },
        data: {
          status: "FAILED",
        },
      });
      return false;
    }

    // download file
    const response = await fetch(matchFileURL);
    const buffer = await response.text();
    let ended = false;

    fs.writeFileSync(path, buffer);
    console.log(`Downloaded ${matchFileURL} to ${path}`);

    // process file
    // docker build -t eval_server -f eval_server/Dockerfile .
    // check if docker image exists, if not, build it
    const imageName = "eval_server";
    const imageExists = await new Promise((resolve) => {
      spawn.exec(`docker images -q ${imageName}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          resolve(false);
        }
        if (stdout) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
      );
    });
    if (!imageExists) {
      console.log(`Docker image ${imageName} does not exist, building...`);
      await new Promise((resolve, reject) => {
        spawn.exec(`docker build -t ${imageName} -f ${thisDir}/eval_server/Dockerfile ${thisDir}/eval_server`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            reject(error);
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
          resolve(true);
        });
      }
      );
    } else {
      console.log(`Docker image ${imageName} exists, skipping build...`);
    }

    const python = spawn.spawn("docker", [
      "run",
      "--rm",
      "-v", `${dataset_dir}:/app/nonrigid_dataset`,
      "-v", `${dir}:/app/experiments/`,
      "eval_server",
      "python3", "-m", "nonrigid_benchmark.evaluate",
      `--input`, `/app/experiments/${experiment.id}.json`,
      `--output`, `/app/experiments/${experiment.id}.out`,
      `--dataset`, `/app/nonrigid_dataset/${dataset_mapping[experiment.dataset]}/`,
      `--split`, `${experiment.split}`,
      `--nproc`, "10",
    ]);

    python.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on("error", (error) => {
      console.error(`error: ${error.message}`);
      ended = true;
      prisma.experiment.update({
        where: {
          id: experiment.id,
        },
        data: {
          status: "FAILED",
        },
      }).catch((err) => {
        console.error("Failed to update experiment status to FAILED:", err);
      });
    });

    // on start
    python.on("spawn", () => {
      prisma.experiment.update({
        where: {
          id: experiment.id,
        },
        data: {
          status: "PROCESSING",
        },
      }).catch((err) => {
        console.error("Failed to update experiment status to PROCESSING:", err);
      });
    });

    python.on("close", async (code) => {
      console.log(`child process exited with code ${code}`);
      ended = true;

      if (code === 0) {
        // wait one second
        await new Promise((r) => setTimeout(r, 1000));
        // check if file exists
        const outPath = `${dir}/${experiment.id}.out`;
        if (!fs.existsSync(outPath)) {
          console.error(`Output file ${outPath} does not exist`);
          // update status
          await prisma.experiment.update({
            where: {
              id: experiment.id,
            },
            data: {
              status: "FAILED",
            },
          });
          return;
        }
        // read file + .out
        const out = fs.readFileSync(outPath, "utf8");
        // parse ms,ma,mr
        const [ms, ma, mr] = out.split(",");
        // update status
        await prisma.experiment.update({
          where: {
            id: experiment.id,
          },
          data: {
            status: "COMPLETED",
            ms: parseFloat(ms),
            ma: parseFloat(ma),
            mr: parseFloat(mr),
          },
        });
        console.log(`ms: ${ms}, ma: ${ma}, mr: ${mr}`);
      } else {
        // update status
        await prisma.experiment.update({
          where: {
            id: experiment.id,
          },
          data: {
            status: "FAILED",
          },
        });
        console.error(`Error processing experiment ${experiment.id}`);
      }
    });

    while (!ended) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return true;
}

async function main() {
  while (true) {
    const r = await eval_loop();
    if (r) {
      await new Promise((r) => setTimeout(r, 10000));
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
