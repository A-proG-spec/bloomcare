import { Router } from "express";
import medicineController from "../controllers/medicineController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
    createMedicineSchema,
    updateMedicineSchema,
    addMedicineToPharmacySchema,
    updateMedicineStockSchema,
} from "../validations/medicineValidation";

const router = Router();

// Public routes (no authentication required)
router.get("/", medicineController.getMedicines);
router.get("/categories", medicineController.getCategories);
router.get("/manufacturers", medicineController.getManufacturers);
router.get("/search", medicineController.searchMedicines);
router.get("/pharmacy/:pharmacyId", medicineController.getMedicinesByPharmacy);
router.get("/:id", medicineController.getMedicineById);

// Admin only routes
router.post(
    "/",
    authenticate,
    authorize("admin"),
    validate(createMedicineSchema),
    medicineController.createMedicine
);

router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    validate(updateMedicineSchema),
    medicineController.updateMedicine
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    medicineController.deleteMedicine
);

// Pharmacy owner routes
router.post(
    "/pharmacy/add",
    authenticate,
    authorize("pharmacy_owner", "admin"),
    validate(addMedicineToPharmacySchema),
    medicineController.addMedicineToPharmacy
);

router.put(
    "/pharmacy/stock",
    authenticate,
    authorize("pharmacy_owner", "admin"),
    validate(updateMedicineStockSchema),
    medicineController.updateMedicineStock
);

router.delete(
    "/pharmacy/:pharmacyId/:medicineId",
    authenticate,
    authorize("pharmacy_owner", "admin"),
    medicineController.removeMedicineFromPharmacy
);

export default router;