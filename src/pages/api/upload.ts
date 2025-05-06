import { type NextApiRequest, type NextApiResponse } from "next";
import { getSignedUrlForUpload } from "~/utils/r2";
import { getServerSession } from "next-auth/next";
import { authOptions } from '~/server/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { fileName, fileType, fileSize } = req.body as {
    fileName: string;
    fileType: string;
    fileSize: number;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  console.log("Received fileName:", fileName);
  console.log("Received fileType:", fileType);
  if (!fileName || !fileType) {
    console.error("Missing fileName or fileType");
    return res.status(400).json({ error: "Missing fileName or fileType" });
  }
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log(">>>>>>> file.type:", fileType);
    const signedUrl = await getSignedUrlForUpload(
      session.user.id  + "/" + fileName,
      fileType,
      fileSize,
    );
    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Error generating signed URL" });
  }
}
