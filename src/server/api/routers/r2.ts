import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  deleteFile,
  getSignedUrlForDownload,
  getSignedUrlForUpload,
  listFiles,
} from "~/utils/r2";

export const r2Router = createTRPCRouter({
  getSignedUrlForUpload: protectedProcedure
    .input(
      z.object({
        expName: z.string(),
        splitName: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const key = userId + "/" + input.expName + "/" + input.splitName + "/" + input.fileName;

      const signedUrl = await getSignedUrlForUpload(
        key,
        input.fileType,
        input.fileSize,
      );

      return { signedUrl };
    }),
  getSignedUrlForDownload: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const signedUrl = await getSignedUrlForDownload(input.key);
      return { signedUrl };
    }),

  deleteFile: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await deleteFile(input.key);
      return { message: "File deleted successfully" };
    }),
  listFiles: protectedProcedure.query(async ({ ctx }) => {
    const files = await listFiles(ctx.session.user.id);
    return files
  }),
});
