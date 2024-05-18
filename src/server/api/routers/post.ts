import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  submission: protectedProcedure
  .input(z.object({
    dataset: z.string(),
    files: z.array(z.object({
      split: z.string(),
      url: z.string(),
    })),
    identifier: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { dataset, files, identifier } = input;
    const { user } = ctx.session;

    if (!user) {
      throw new Error("Unauthorized");
    }

    // add to db one for each file
    const promises = files.map(async (file) => {
      await db.experiment.create({
        data: {
          dataset,
          name:identifier,
          ms: 0,
          ma: 0,
          mr: 0,
          status: "PENDING",
          public: false,
          split: file.split,
          matchFileURL: file.url,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    });

    await Promise.all(promises);

    return {
      success: true,
    };

  }),

  getSubmissions: protectedProcedure
  .query(async ({ ctx }) => {
    const { user } = ctx.session;

    if (!user) {
      throw new Error("Unauthorized");
    }

    const submissions = await db.experiment.findMany({
      where: {
        userId: user.id,
      },
    });

    return {
      submissions,
    };
  }
  ),


});
