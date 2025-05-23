import { Status } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import db from "~/server/db";

export const benchRouter = createTRPCRouter({
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
          status: Status.PENDING,
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
      // sort from newest to oldest
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      submissions,
    };
  }
  ),

  getPublicSubmissions: publicProcedure
  .query(async () => {
    const submissions = await db.experiment.findMany({
      where: {
        status: "COMPLETED",
        public: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      submissions,
    };
  }
  ),

  getSplits: publicProcedure
  .input(z.object({
    dataset: z.string(),
    splits: z.array(z.string()),
    take: z.number().optional().default(20),
  }))
  .query(async ({ input }) => {
    const { dataset, splits } = input;

    const means_by_name = await db.experiment.groupBy({
      by: ["name"],
      where: {
        dataset,
        split: {
          in: splits,
        },
        status: "COMPLETED",
        public: true,
      },
      _avg: {
        ms: true,
      },
    });

    const top_means_names = means_by_name
    .sort((a, b) => (a._avg.ms ?? 0) - (b._avg.ms ?? 0))
    .slice(0, 20)
    .map((exp) => exp.name);

    const experiments = await db.experiment.findMany({
      where: {
        dataset,
        split: {
          in: splits,
        },
        name: {
          in: top_means_names,
        },
        status: "COMPLETED",
        public: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nameAggr = experiments.reduce((acc, exp) => {
      if (!acc[exp.name]) {
        acc[exp.name] = [];
      }

      acc[exp.name]!.push(exp);

      return acc;
    }, {} as Record<string, typeof experiments>);

    return nameAggr
  }),

  editSubmission: protectedProcedure
  .input(z.object({
    id: z.string(),
    name: z.string(),
    public: z.boolean(),
  }))
  .mutation(async ({ input }) => {
    const { id, name, public: isPublic } = input;

    await db.experiment.update({
      where: {
        id,
      },
      data: {
        name,
        public: isPublic,
      },
    });

    return {
      success: true,
    };
  }),

  deleteSubmission: protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { id } = input;

    await db.experiment.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }),

});
