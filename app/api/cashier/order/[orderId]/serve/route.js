import { db } from "../../../../../../lib/firebaseAdmin";
import { success, error } from "../../../../../../lib/response";

export async function POST(req, { params }) {
    try {
      const { orderId } = await params;
      if (!orderId) throw new Error("Order ID is required");
  
      // Update order status
      await db.collection("orders").doc(orderId).update({ status: "served" });
  
      // Optional: Update all items as served too
      const itemsSnap = await db
        .collection("order_items")
        .where("orderId", "==", orderId)
        .get();
  
      const batch = db.batch();
      itemsSnap.docs.forEach(doc => {
        batch.update(doc.ref, { status: "served" });
      });
      await batch.commit();
  
      return success(
        { orderId, status: "served" },
        "Order marked as served"
      );
  
    } catch (err) {
      console.error(err);
      return error(err.message || "Failed to serve order", 500);
    }
  }