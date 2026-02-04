import { db } from "../../../lib/firebaseAdmin";
import { success, error } from "../../../lib/response";

export async function POST(req) {
  try {
    const { tableId, customerName, customerPhone, items } = await req.json();

    // Validation
    if (!tableId || !customerName || !customerPhone) {
      throw new Error("Missing table or customer information");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No menu items selected");
    }

    // Create new session
    const sessionRef = await db.collection("sessions").add({
      tableId,
      customerName,
      customerPhone,
      status: "active",
      createdAt: new Date()
    });
    const sessionId = sessionRef.id;

    // Create order
    const orderRef = await db.collection("orders").add({
      sessionId,
      status: "pending",
      createdAt: new Date()
    });

    // Create order_items in batch
    const batch = db.batch();

    for (const item of items) {
      const { menuId, qty, specialRequest } = item;
      if (!menuId || !qty) continue; // skip invalid items

      const menuSnap = await db.collection("menu").doc(menuId).get();
      if (!menuSnap.exists) throw new Error(`Menu item ${menuId} not found`);

      const menuData = menuSnap.data();

      batch.set(db.collection("order_items").doc(), {
        orderId: orderRef.id,
        menuId,
        name: menuData.menu_name,
        price: menuData.menu_price,
        qty,
        specialRequest: specialRequest || "",
        status: "pending"
      });
    }

    await batch.commit();

    return success(
      { sessionId, orderId: orderRef.id },
      "Order confirmed and table reserved successfully"
    );

  } catch (err) {
    console.error(err);
    return error(err.message || "Failed to confirm order", 500);
  }
}