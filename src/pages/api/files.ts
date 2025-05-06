import { type NextApiRequest, type NextApiResponse } from "next";
import { deleteFile, getSignedUrlForDownload, listFiles } from "~/utils/r2";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "GET") {
        try {
            const files = await listFiles();
            return res.json(files);
        } catch (error) {
            return res.status(500).json({ error: "Error listing files" });
        }
    } else if (req.method === "POST") {
        try {
            const { key } = req.body as { key: string };
            const signedUrl = await getSignedUrlForDownload(key)

            return res.json({ signedUrl })
        } catch (error) {
            return res.status(500).json({ error: "Error processing file" });
        }
    } else if (req.method === "DELETE") {
        try {
            const { key } = req.body as {key: string}
            await deleteFile(key)
            // Implement delete logic here
            return res.status(200).json({ message: "File deleted successfully" });
        } catch (error) {
            return res.status(500).json({ error: "Error deleting file" });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
}