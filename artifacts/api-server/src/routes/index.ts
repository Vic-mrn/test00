import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import equipmentRouter from "./equipment";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(equipmentRouter);
router.use(reportsRouter);

export default router;
