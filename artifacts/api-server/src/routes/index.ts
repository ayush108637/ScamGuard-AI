import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamTrendsRouter from "./scam-trends";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scamTrendsRouter);

export default router;
