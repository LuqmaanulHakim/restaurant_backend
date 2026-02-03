import { db } from "../lib/firebaseAdmin";

// Start or get active session for a table
export async function startSession(tableId, customerName = "") {
  if (!tableId) throw new Error("Table ID required");

  // Check active session
  const snapshot = await db.collection("sessions")
    .where("tableId", "==", tableId)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (!snapshot.empty) {
    // Return existing session
    const doc = snapshot.docs[0];
    return { sessionId: doc.id, ...doc.data() };
  }

  // Create new session
  const sessionRef = await db.collection("sessions").add({
    tableId,
    customerName,
    status: "active",
    createdAt: new Date()
  });

  const snap = await sessionRef.get();

  return { sessionId: snap.id, ...snap.data() };
}
