import { getMenuById, updateMenu, deleteMenu } from "../../../../services/menu.service";
import { success, error } from "../../../../lib/response";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return error("Menu ID is required", 400);
    }

    const menu = await getMenuById(id);

    if (!menu) {
      return error("Menu not found", 404);
    }

    return success(menu, "Menu fetched successfully");
  } catch (err) {
    console.error(err);
    return error("Failed to fetch menu", 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { menu_name, menu_price, category, type } = body;

    if (!id) {
      return error("Menu ID is required", 400);
    }

    // Check if menu exists
    const existingMenu = await getMenuById(id);
    if (!existingMenu) {
      return error("Menu not found", 404);
    }

    // Validate required fields if provided
    if (category && !["meal", "drink", "dessert"].includes(category)) {
      return error("Invalid category", 400);
    }

    if (menu_price !== undefined && typeof menu_price !== "number") {
      return error("Menu price must be a number", 400);
    }

    const updatedMenu = await updateMenu(id, {
      menu_name: menu_name ?? existingMenu.menu_name,
      menu_price: menu_price ?? existingMenu.menu_price,
      category: category ?? existingMenu.category,
      type: type !== undefined ? type : existingMenu.type,
    });

    return success(updatedMenu, "Menu updated successfully");
  } catch (err) {
    console.error(err);
    return error("Failed to update menu", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return error("Menu ID is required", 400);
    }

    // Check if menu exists
    const existingMenu = await getMenuById(id);
    if (!existingMenu) {
      return error("Menu not found", 404);
    }

    await deleteMenu(id);

    return success({ id }, "Menu deleted successfully");
  } catch (err) {
    console.error(err);
    return error("Failed to delete menu", 500);
  }
}

export async function OPTIONS() {
  return options();
}