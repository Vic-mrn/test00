import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reportsTable, usersTable, equipmentTable } from "@workspace/db";
import { CreateReportBody, UpdateReportBody, ListReportsQueryParams } from "@workspace/api-zod";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

function formatReport(report: any, equipment: any, reportedBy: any, receivedBy: any, assignedTo: any, resolvedBy: any) {
  const resolutionTime = report.resolvedAt
    ? Math.round((new Date(report.resolvedAt).getTime() - new Date(report.createdAt).getTime()) / 60000)
    : null;

  return {
    id: report.id,
    title: report.title,
    description: report.description,
    status: report.status,
    priority: report.priority,
    equipmentId: report.equipmentId,
    equipment: equipment ? { ...equipment, createdAt: equipment.createdAt.toISOString() } : null,
    reportedById: report.reportedById,
    reportedBy: reportedBy ? { ...reportedBy, createdAt: reportedBy.createdAt.toISOString() } : null,
    receivedById: report.receivedById,
    receivedBy: receivedBy ? { ...receivedBy, createdAt: receivedBy.createdAt.toISOString() } : null,
    assignedToId: report.assignedToId,
    assignedTo: assignedTo ? { ...assignedTo, createdAt: assignedTo.createdAt.toISOString() } : null,
    resolvedById: report.resolvedById,
    resolvedBy: resolvedBy ? { ...resolvedBy, createdAt: resolvedBy.createdAt.toISOString() } : null,
    notes: report.notes,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    resolvedAt: report.resolvedAt ? report.resolvedAt.toISOString() : null,
    resolutionTime,
  };
}

router.get("/reports", async (req, res) => {
  try {
    const query = ListReportsQueryParams.parse(req.query);

    const conditions: any[] = [];
    if (query.status) conditions.push(eq(reportsTable.status, query.status as any));
    if (query.assignedTo) conditions.push(eq(reportsTable.assignedToId, query.assignedTo));
    if (query.equipmentId) conditions.push(eq(reportsTable.equipmentId, query.equipmentId));

    const reports = await db
      .select()
      .from(reportsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(reportsTable.createdAt);

    const [equipmentList, usersList] = await Promise.all([
      db.select().from(equipmentTable),
      db.select().from(usersTable),
    ]);

    const equipmentMap = new Map(equipmentList.map(e => [e.id, e]));
    const usersMap = new Map(usersList.map(u => [u.id, u]));

    const result = reports.map(r => formatReport(
      r,
      equipmentMap.get(r.equipmentId),
      r.reportedById ? usersMap.get(r.reportedById) : null,
      r.receivedById ? usersMap.get(r.receivedById) : null,
      r.assignedToId ? usersMap.get(r.assignedToId) : null,
      r.resolvedById ? usersMap.get(r.resolvedById) : null,
    ));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const body = CreateReportBody.parse(req.body);
    const [report] = await db.insert(reportsTable).values({
      ...body,
      status: "pending",
    }).returning();

    const [equipment, reportedBy, receivedBy] = await Promise.all([
      db.select().from(equipmentTable).where(eq(equipmentTable.id, report.equipmentId)).then(r => r[0]),
      db.select().from(usersTable).where(eq(usersTable.id, report.reportedById)).then(r => r[0]),
      report.receivedById
        ? db.select().from(usersTable).where(eq(usersTable.id, report.receivedById)).then(r => r[0])
        : Promise.resolve(null),
    ]);

    res.status(201).json(formatReport(report, equipment, reportedBy, receivedBy, null, null));
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const [equipmentList, usersList] = await Promise.all([
      db.select().from(equipmentTable).where(eq(equipmentTable.id, report.equipmentId)),
      db.select().from(usersTable),
    ]);

    const usersMap = new Map(usersList.map(u => [u.id, u]));

    res.json(formatReport(
      report,
      equipmentList[0],
      report.reportedById ? usersMap.get(report.reportedById) : null,
      report.receivedById ? usersMap.get(report.receivedById) : null,
      report.assignedToId ? usersMap.get(report.assignedToId) : null,
      report.resolvedById ? usersMap.get(report.resolvedById) : null,
    ));
  } catch (err) {
    req.log.error({ err }, "Failed to get report");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/reports/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateReportBody.parse(req.body);

    const [existing] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Report not found" });
    }

    const updates: any = { ...body, updatedAt: new Date() };

    if (body.status === "resolved" && existing.status !== "resolved") {
      updates.resolvedAt = new Date();
    }

    const [report] = await db
      .update(reportsTable)
      .set(updates)
      .where(eq(reportsTable.id, id))
      .returning();

    const [equipmentList, usersList] = await Promise.all([
      db.select().from(equipmentTable).where(eq(equipmentTable.id, report.equipmentId)),
      db.select().from(usersTable),
    ]);

    const usersMap = new Map(usersList.map(u => [u.id, u]));

    res.json(formatReport(
      report,
      equipmentList[0],
      report.reportedById ? usersMap.get(report.reportedById) : null,
      report.receivedById ? usersMap.get(report.receivedById) : null,
      report.assignedToId ? usersMap.get(report.assignedToId) : null,
      report.resolvedById ? usersMap.get(report.resolvedById) : null,
    ));
  } catch (err) {
    req.log.error({ err }, "Failed to update report");
    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const reports = await db.select().from(reportsTable);

    const total = reports.length;
    const pending = reports.filter(r => r.status === "pending").length;
    const inProgress = reports.filter(r => r.status === "in_progress").length;
    const resolved = reports.filter(r => r.status === "resolved").length;
    const cancelled = reports.filter(r => r.status === "cancelled").length;

    const resolvedReports = reports.filter(r => r.status === "resolved" && r.resolvedAt);
    const avgResolutionTime = resolvedReports.length > 0
      ? resolvedReports.reduce((acc, r) => {
          const minutes = Math.round((new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime()) / 60000);
          return acc + minutes;
        }, 0) / resolvedReports.length
      : 0;

    res.json({ total, pending, inProgress, resolved, cancelled, avgResolutionTime });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
