// src/routes/pharmacyRoutes.ts

import { Router } from "express";
import pharmacyController from "../controllers/pharmacyController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { 
  pharmacyApplicationSchema, 
  pharmacyUpdateSchema,
  applicationReviewSchema 
} from "../validations/pharmacyValidation";
import { upload } from "../middleware/uploadMiddleware";
import Pharmacy from "../models/Pharmacy";

const router = Router();

// ===== PUBLIC ROUTES (STATIC FIRST) =====
router.get("/", pharmacyController.getPharmacies);              // LIST
router.get("/nearby", pharmacyController.getNearbyPharmacies);  // NEARBY

// ===== PROTECTED ROUTES (STATIC PATHS FIRST) =====
router.post(
  "/apply",
  authenticate,
  validate(pharmacyApplicationSchema),
  pharmacyController.applyForPharmacy
);

router.get(
  "/my-application",              // <-- static
  authenticate,
  pharmacyController.getMyApplication
);

router.get(
  "/my-pharmacy",                 // <-- static (moved before /:id)
  authenticate,
  pharmacyController.getMyPharmacy
);

router.put(
  "/update",                      // <-- static
  authenticate,
  validate(pharmacyUpdateSchema),
  pharmacyController.updatePharmacy
);

// ===== DYNAMIC ROUTE (MUST BE LAST) =====
router.get(
  "/:id",                         // <-- dynamic, catches any string after /pharmacy/
  pharmacyController.getPharmacyById
);

// ===== ADMIN ROUTES =====
router.get(
  "/applications",                // <-- static
  authenticate,
  authorize("admin"),
  pharmacyController.getAllApplications
);

router.put(
  "/applications/:id/review",     // <-- static pattern, but better to keep after static
  authenticate,
  authorize("admin"),
  validate(applicationReviewSchema),
  pharmacyController.reviewApplication
);

// ===== Image Upload =====
router.post(
  "/upload-image",                // <-- static
  authenticate,
  authorize("pharmacy_owner", "admin"),
  upload.single("image"),
  async (req: any, res: any) => {
    // ...
  }
);

export default router;