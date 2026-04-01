import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { equipmentTable } from "@workspace/db";
import { CreateEquipmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/equipment", async (req, res) => {
  try {
    const equipment = await db.select().from(equipmentTable).orderBy(equipmentTable.name);
    res.json(equipment.map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list equipment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/equipment", async (req, res) => {
  try {
    const body = CreateEquipmentBody.parse(req.body);
    const [item] = await db.insert(equipmentTable).values(body).returning();
    res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create equipment");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
