import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { CreateUserBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.name);
    res.json(users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const body = CreateUserBody.parse(req.body);
    const [user] = await db.insert(usersTable).values(body).returning();
    res.status(201).json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
