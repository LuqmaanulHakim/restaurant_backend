import { db } from "../lib/firebaseAdmin";

export async function getAllMenu() {
  const snapshot = await db.collection("menu").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

const PREFIX_MAP = {
  meal: "M",
  drink: "D",
  dessert: "C",
};

/**
 * @param {Object} params
 * @param {string} params.menu_name
 * @param {number} params.menu_price
 * @param {"meal" | "drink" | "dessert"} params.category
 * @param {string | null} [params.type]
 */
export async function createMenu({
  menu_name,
  menu_price,
  category,
  type,
}) {
  const prefix = PREFIX_MAP[category];

  const menuRef = db.collection("menu");

  // get latest ID by prefix
  const snap = await menuRef
    .where("id", ">=", prefix)
    .where("id", "<", prefix + "Z")
    .orderBy("id", "desc")
    .limit(1)
    .get();

  let nextNumber = 1;

  if (!snap.empty) {
    const lastId = snap.docs[0].data().id; // M009
    nextNumber = parseInt(lastId.slice(1)) + 1;
  }

  const newId = `${prefix}${String(nextNumber).padStart(3, "0")}`;

  const data = {
    id: newId,
    menu_name,
    menu_price,
    category,
    type
  };

  await menuRef.doc(newId).set(data);

  return data;
}

/**
 * @param {string} id
 */
export async function getMenuById(id) {
  const doc = await db.collection("menu").doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

/**
 * @param {string} id
 * @param {Object} updates
 * @param {string} [updates.menu_name]
 * @param {number} [updates.menu_price]
 * @param {"meal" | "drink" | "dessert"} [updates.category]
 * @param {string | null} [updates.type]
 */
export async function updateMenu(id, updates) {
  const menuRef = db.collection("menu").doc(id);

  await menuRef.update(updates);

  const updatedDoc = await menuRef.get();

  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  };
}

/**
 * @param {string} id
 */
export async function deleteMenu(id) {
  await db.collection("menu").doc(id).delete();
}