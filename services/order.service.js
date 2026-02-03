import { db } from "../lib/firebaseAdmin";

export async function createOrder({ sessionId, items }) {
  if (!sessionId || !items || items.length === 0) {
    throw new Error("Invalid order data");
  }

  // 1️⃣ Create the order document
  const orderRef = await db.collection("orders").add({
    sessionId,
    status: "pending",
    createdAt: new Date(),
  });

  // 2️⃣ Create order items in batch
  const batch = db.batch();

  // Loop through items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Fetch menu document
    const menuSnap = await db.collection("menu").doc(item.menuId).get();

    if (!menuSnap.exists) {
      throw new Error(`Menu item ${item.menuId} not found`);
    }

    const menuData = menuSnap.data();

    // Safety check for your current fields
    if (!menuData.menu_name || menuData.menu_price === undefined) {
      throw new Error(`Menu item ${item.menuId} is missing menu_name or menu_price`);
    }

    // Create order item
    const itemRef = db.collection("order_items").doc();
    batch.set(itemRef, {
      orderId: orderRef.id,
      menuId: item.menuId,
      name: menuData.menu_name,      // map to "name"
      price: menuData.menu_price,    // map to "price"
      qty: item.qty,
      status: "pending",
    });
  }

  // Commit batch
  await batch.commit();

  return {
    orderId: orderRef.id,
    sessionId,
  };
}

// Fetch all active orders for Chef
export async function getActiveOrders() {
  const snapshot = await db.collection("orders")
    .where("status", "!=", "completed") // pending or preparing or ready
    .orderBy("createdAt", "asc")
    .get();

  const orders = [];

  for (const doc of snapshot.docs) {
    const orderData = doc.data();
    orderData.id = doc.id;

    // Fetch order items
    const itemsSnap = await db.collection("order_items")
      .where("orderId", "==", doc.id)
      .get();

    const items = itemsSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    orderData.items = items;

    orders.push(orderData);
  }

  return orders;
}

// Update order status
export async function updateOrderStatus(orderId, newStatus) {
  if (!orderId || !newStatus) throw new Error("Invalid parameters");

  const orderRef = db.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) throw new Error("Order not found");

  await orderRef.update({
    status: newStatus
  });

  return { orderId, status: newStatus };
}
