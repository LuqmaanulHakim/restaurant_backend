import { db } from "../../../lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const ref = db.collection("test").doc("ping");

  await ref.set({
    message: "Firebase connected",
    time: new Date(),
  });

  const snap = await ref.get();

  return NextResponse.json(snap.data());
}
