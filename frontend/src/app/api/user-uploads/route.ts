import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/backend/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy the request to our standalone Express backend
    const backendRes = await fetch("http://localhost:4000/api/media", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "x-user-id": session.user.id 
      }
    });

    const data = await backendRes.json();
    
    if (!backendRes.ok) {
      return NextResponse.json({ error: data.error || "Backend error" }, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Get media error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
