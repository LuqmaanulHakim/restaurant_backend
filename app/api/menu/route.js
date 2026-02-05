import { getAllMenu, createMenu } from "../../../services/menu.service";
import { success, error } from "../../../lib/response";

export async function GET() {
  try {
    const menu = await getAllMenu();
    return success(menu, "Menu fetched successfully");
  } catch (err) {
    console.error(err);
    return error("Failed to fetch menu", 500);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { menu_name, menu_price, category, type } = body;

    if (!menu_name || menu_price === undefined || !category) {
      return error("Missing required fields", 400);
    }

    if (!["meal", "drink", "dessert"].includes(category)) {
      return error("Invalid category", 400);
    }

    const newMenu = await createMenu({
      menu_name,
      menu_price,
      category,
      type: type ?? null,
    });

    return success(newMenu, "Menu created successfully");
  } catch (err) {
    console.error(err);
    return error("Failed to create menu", 500);
  }
}

export async function OPTIONS() {
  return options();
}