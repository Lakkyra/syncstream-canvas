import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { generateUploadUrl } from "./services/upload";
import { markMediaProcessing, createMediaRecord } from "./services/media";

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

app.get("/api/media", requireAuth, async (req: any, res: any) => {
  try {
    const { supabase } = require("./supabase");
    const { data: media, error } = await supabase
      .from('media')
      .select('id, filename, status, created_at, size_bytes')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map db fields to frontend MediaItem type
    const mapped = media.map((item: any) => ({
      id: item.id,
      filename: item.filename,
      status: item.status,
      createdAt: item.created_at,
      sizeBytes: item.size_bytes
    }));
    
    return res.json(mapped);
  } catch (err: any) {
    console.error("Get media error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/upload/init", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { filename, contentType, sizeBytes } = req.body;

    if (!filename || !contentType || !sizeBytes) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    const { uploadUrl, token, mediaId, storagePath } = await generateUploadUrl(userId, filename, contentType, sizeBytes);
    await createMediaRecord(userId, mediaId, filename, contentType, sizeBytes, storagePath);

    return res.json({ uploadUrl, token, mediaId });
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

    // [LOCAL DEV ONLY] Automatically trigger the transcoder microservice 
    // In production, Supabase Webhooks handle this automatically.
    const { supabase } = require("./supabase");
    
    // Simulate event payload
    const payload = {
      record: {
        id: mediaId,
        user_id: userId,
        storage_path: req.body.storagePath // Assume we pass storagePath or fetch it
      }
    };

    // We'll just fetch the storagePath since we need it
    const { data: mediaRecord } = await supabase.from('media').select('storage_path').eq('id', mediaId).single();
    
    if (mediaRecord) {
      try {
        await fetch("http://localhost:8080/transcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket: "media",
            name: mediaRecord.storage_path,
            mediaId: mediaId
          }),
        });
      } catch (err) {
        console.error("Local transcoder webhook failed. Is it running on port 8080?", err);
      }
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Upload complete error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/room/end", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { mediaId } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: "Missing mediaId" });
    }

    const { supabase } = require("./supabase");
    
    // 1. Delete from DB
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .match({ id: mediaId, user_id: userId });

    if (dbError) throw new Error("DB Delete failed: " + dbError.message);

    // 2. Delete all related files from Storj S3 (original + hls)
    // Both are under users/userId/uploads/mediaId and users/userId/hls/mediaId
    // Actually, to make it simple we can just delete the two prefixes:
    await deleteMediaPrefix(`users/${userId}/uploads/${mediaId}/`);
    await deleteMediaPrefix(`users/${userId}/hls/${mediaId}/`);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Room end error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("chat-message", ({ roomId, user, text }) => {
    // Ephemeral message broadcast to room (no DB save)
    const message = {
      id: Math.random().toString(36).substring(7),
      user,
      text,
      timestamp: Date.now(),
    };
    io.to(roomId).emit("chat-message", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
