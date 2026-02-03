import { db } from "../lib/firebaseAdmin";

export async function getAllMenu() {
  const snapshot = await db.collection("menu").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
