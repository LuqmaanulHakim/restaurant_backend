import { getAllMenu } from "../../../services/menu.service";
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