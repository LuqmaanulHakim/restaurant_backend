import { db } from "../../../../../lib/firebaseAdmin";
import { success, error } from "../../../../../lib/response";

export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) throw new Error("Missing sessionId");

    // Get session
    const sessionRef = db.collection("sessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();
    if (!sessionSnap.exists) throw new Error("Session not found");

    // Update session status
    await sessionRef.update({ status: "completed", completedAt: new Date() });

    // Get all orders for this session
    const ordersSnap = await db.collection("orders")
      .where("sessionId", "==", sessionId)
      .get();

    const batch = db.batch();

    // Update all orders status to "completed"
    ordersSnap.docs.forEach(orderDoc => {
      batch.update(db.collection("orders").doc(orderDoc.id), { status: "completed" });
    });

    await batch.commit();

    return success({ sessionId }, "Session completed and table paid successfully");

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to complete session", 500);
  }
}