import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType, sizeBytes } = await request.json();

    // Proxy the request to our standalone Express backend
    const backendRes = await fetch("http://localhost:4000/api/upload/init", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-user-id": session.user.id 
      },
      body: JSON.stringify({ filename, contentType, sizeBytes }),
    });

    const data = await backendRes.json();
    
    if (!backendRes.ok) {
      return NextResponse.json({ error: data.error || "Backend error" }, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Upload init error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
