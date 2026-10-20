import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(signUpload(new URL(req.url).searchParams.get("folder") ?? "")); }
  catch { return NextResponse.json({ error: "Bad folder" }, { status: 400 }); }
}
