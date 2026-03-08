import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminAnalytics } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    // 1. Extract the ID token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const idToken = authHeader.slice(7);

    // 2. Verify the token
    const decoded = await getAuth().verifyIdToken(idToken);

    // 3. Check if the UID matches the admin UID
    const adminUid = process.env.ADMIN_UID;
    if (!adminUid || decoded.uid !== adminUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Fetch and return analytics data
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  } catch (err) {
    console.error("Admin analytics error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
