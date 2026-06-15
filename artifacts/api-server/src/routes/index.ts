import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import packagesRouter from "./packages";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import galleryRouter from "./gallery";
import contactRouter from "./contact";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(packagesRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(galleryRouter);
router.use(contactRouter);
router.use(adminRouter);

export default router;
