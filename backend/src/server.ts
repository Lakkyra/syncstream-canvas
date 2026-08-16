import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateUploadUrl } from "./services/upload";
import { markMediaProcessing, createMediaRecord } from "./services/media";
import { auth } from "./firebase";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to verify session from Next.js (or just trust the frontend for this demo? No, we should verify)
// Actually, Next.js can send the user ID in the headers securely if Next.js verifies the session first.
// Let's implement a middleware that expects `x-user-id` from the trusted frontend proxy.
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId as string;
  next();
};

app.post("/api/upload/init", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { filename, contentType, sizeBytes } = req.body;

    if (!filename || !contentType || !sizeBytes) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    const { uploadUrl, mediaId, storagePath } = await generateUploadUrl(userId, filename, contentType, sizeBytes);
    await createMediaRecord(userId, mediaId, filename, contentType, sizeBytes, storagePath);

    return res.json({ uploadUrl, mediaId });
  } catch (error: any) {
    console.error("Upload init error:", error);
    if (error.message === "File too large") {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/upload/complete", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { mediaId } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: "Missing mediaId" });
    }

    await markMediaProcessing(userId, mediaId);
    return res.json({ status: "success" });
  } catch (error) {
    console.error("Upload complete error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
