import { success, error } from "../../../../../lib/response";
import { db } from "../../../../../lib/firebaseAdmin";

export async function POST(req, context) {
  try {
    // unwrap params from context
    const params = await context.params;  
    const itemId = params.itemId;  

    if (!itemId) throw new Error("Item ID is required");

    const { status } = await req.json();
    if (!status) throw new Error("Status is required");

    const itemRef = db.collection("order_items").doc(itemId);
    const itemSnap = await itemRef.get();
    if (!itemSnap.exists) throw new Error("Order item not found");

    await itemRef.update({ status });

    return success({ itemId, status }, "Order item status updated successfully");

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to update order item", 500);
  }
}