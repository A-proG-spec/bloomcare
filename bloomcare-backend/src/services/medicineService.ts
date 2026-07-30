import mongoose from "mongoose";
import Medicine from "../models/Medicine";
import Pharmacy from "../models/Pharmacy";
import { logger } from "../config/logger";

interface ICreateMedicineData {
  name: string;
  genericName?: string;
  category: string;
  manufacturer: string;
  description?: string;
  image?: string;
}

interface IUpdateMedicineData {
  name?: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
}

interface IAddMedicineToPharmacyData {
  pharmacyId: string;
  medicineId: string;
  price: number;
  quantity: number;
}

interface IUpdateMedicineStockData {
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  price?: number;
}

class MedicineService {
  // Create a new medicine (Admin only)
  async createMedicine(data: ICreateMedicineData) {
    const { name, genericName, category, manufacturer, description, image } = data;

    // Check if medicine already exists
    const existingMedicine = await Medicine.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    } as any);

    if (existingMedicine) {
      throw new Error("Medicine already exists");
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      category,
      manufacturer,
      description,
      image: image || "",
    } as any);

    logger.info(`Medicine created: ${medicine.name} (${medicine._id})`);

    return medicine;
  }

  // Get all medicines with filters
  async getMedicines(
    search?: string,
    category?: string,
    manufacturer?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query: any = {};

    // Search by name or generic name
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (manufacturer) {
      query.manufacturer = { $regex: manufacturer, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Medicine.countDocuments(query),
    ]);

    return {
      medicines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single medicine by ID
  async getMedicineById(medicineId: string) {
    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      throw new Error("Medicine not found");
    }

    // Get pharmacies that have this medicine
    const pharmacies = await Pharmacy.find({
      "medicines.medicine": medicineId,
    } as any)
      .select("name address phone image rating medicines.$")
      .limit(20);

    const pharmaciesWithPrice = pharmacies.map((pharmacy) => {
      const medicineStock = pharmacy.medicines.find(
        (med) => med.medicine.toString() === medicineId
      );
      return {
        pharmacyId: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        image: pharmacy.image,
        rating: pharmacy.rating,
        price: medicineStock?.price || 0,
        quantity: medicineStock?.quantity || 0,
        stockStatus: medicineStock?.stockStatus || "Out of Stock",
      };
    });

    return {
      medicine,
      availableAt: pharmaciesWithPrice,
    };
  }

  // Update medicine (Admin only)
  async updateMedicine(medicineId: string, data: IUpdateMedicineData) {
    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      throw new Error("Medicine not found");
    }

    // Check if name conflicts (if name is being updated)
    if (data.name) {
      const existingMedicine = await Medicine.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
        _id: { $ne: medicineId },
      } as any);

      if (existingMedicine) {
        throw new Error("Medicine with this name already exists");
      }
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      medicineId,
      data,
      { new: true, runValidators: true }
    );

    logger.info(`Medicine updated: ${updatedMedicine?.name} (${medicineId})`);

    return updatedMedicine;
  }

  // Delete medicine (Admin only)
  async deleteMedicine(medicineId: string) {
    const medicine = await Medicine.findById(medicineId);
    
    if (!medicine) {
      throw new Error("Medicine not found");
    }

    // Check if medicine is used in any pharmacy
    const pharmaciesWithMedicine = await Pharmacy.findOne({
      "medicines.medicine": medicineId,
    } as any);

    if (pharmaciesWithMedicine) {
      throw new Error("Cannot delete medicine as it's being used by pharmacies. Remove it from pharmacies first.");
    }

    await Medicine.findByIdAndDelete(medicineId);

    logger.info(`Medicine deleted: ${medicine.name} (${medicineId})`);

    return { success: true, message: "Medicine deleted successfully" };
  }

  // Add medicine to pharmacy inventory
  async addMedicineToPharmacy(data: IAddMedicineToPharmacyData) {
    const { pharmacyId, medicineId, price, quantity } = data;

    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      throw new Error("Medicine not found");
    }

    // Check if medicine already in pharmacy
    const existingMedicine = pharmacy.medicines.find(
      (med) => med.medicine.toString() === medicineId
    );

    if (existingMedicine) {
      throw new Error("Medicine already exists in this pharmacy. Use update stock endpoint instead.");
    }

    // Determine stock status
    let stockStatus: "In Stock" | "Low Stock" | "Out of Stock" = "Out of Stock";
    if (quantity > 10) {
      stockStatus = "In Stock";
    } else if (quantity > 0 && quantity <= 10) {
      stockStatus = "Low Stock";
    }

    // Add medicine to pharmacy
    await Pharmacy.findByIdAndUpdate(
      pharmacyId,
      {
        $push: {
          medicines: {
            medicine: medicineId,
            price,
            quantity,
            stockStatus,
          },
        },
      } as any,
      { new: true }
    );

    logger.info(`Medicine ${medicineId} added to pharmacy ${pharmacyId}`);

    return {
      success: true,
      message: "Medicine added to pharmacy successfully",
      medicine: {
        id: medicineId,
        name: medicine.name,
        price,
        quantity,
        stockStatus,
      },
    };
  }

  // Update medicine stock in pharmacy
  async updateMedicineStock(data: IUpdateMedicineStockData) {
    const { pharmacyId, medicineId, quantity, price } = data;

    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      throw new Error("Medicine not found");
    }

    // Check if medicine is in pharmacy
    const medicineIndex = pharmacy.medicines.findIndex(
      (med) => med.medicine.toString() === medicineId
    );

    if (medicineIndex === -1) {
      throw new Error("Medicine not found in this pharmacy");
    }

    // Determine stock status
    let stockStatus: "In Stock" | "Low Stock" | "Out of Stock" = "Out of Stock";
    if (quantity > 10) {
      stockStatus = "In Stock";
    } else if (quantity > 0 && quantity <= 10) {
      stockStatus = "Low Stock";
    }

    // Build update object
    const updateObj: any = {
      "medicines.$.quantity": quantity,
      "medicines.$.stockStatus": stockStatus,
    };

    if (price !== undefined) {
      updateObj["medicines.$.price"] = price;
    }

    // Update medicine stock
    await Pharmacy.findOneAndUpdate(
      {
        _id: pharmacyId,
        "medicines.medicine": medicineId,
      } as any,
      {
        $set: updateObj,
      } as any,
      { new: true }
    );

    logger.info(`Medicine ${medicineId} stock updated in pharmacy ${pharmacyId}`);

    return {
      success: true,
      message: "Medicine stock updated successfully",
      medicine: {
        id: medicineId,
        name: medicine.name,
        quantity,
        price: price || pharmacy.medicines[medicineIndex].price,
        stockStatus,
      },
    };
  }

  // Remove medicine from pharmacy
  async removeMedicineFromPharmacy(pharmacyId: string, medicineId: string) {
    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Check if medicine is in pharmacy
    const medicineIndex = pharmacy.medicines.findIndex(
      (med) => med.medicine.toString() === medicineId
    );

    if (medicineIndex === -1) {
      throw new Error("Medicine not found in this pharmacy");
    }

    // Remove medicine from pharmacy
    await Pharmacy.findByIdAndUpdate(
      pharmacyId,
      {
        $pull: {
          medicines: { medicine: medicineId },
        },
      } as any,
      { new: true }
    );

    logger.info(`Medicine ${medicineId} removed from pharmacy ${pharmacyId}`);

    return {
      success: true,
      message: "Medicine removed from pharmacy successfully",
    };
  }

  // Get medicines by pharmacy
  async getMedicinesByPharmacy(
    pharmacyId: string,
    search?: string,
    inStockOnly?: boolean,
    page: number = 1,
    limit: number = 10
  ) {
    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const skip = (page - 1) * limit;

    // Build query
    let medicines = pharmacy.medicines;

    // Filter by in stock
    if (inStockOnly) {
      medicines = medicines.filter((med) => med.quantity > 0);
    }

    // Search by name (requires populating medicines)
    const medicineIds = medicines.map((med) => med.medicine);
    
    const query: any = {};
    if (medicineIds.length > 0) {
      query._id = { $in: medicineIds };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
      ];
    }

    const populatedMedicines = await Medicine.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Attach pharmacy-specific data
    const medicinesWithPharmacyData = populatedMedicines.map((medicine) => {
      const pharmacyMedicine = pharmacy.medicines.find(
        (med) => med.medicine.toString() === medicine._id.toString()
      );
      return {
        ...medicine.toObject(),
        price: pharmacyMedicine?.price || 0,
        quantity: pharmacyMedicine?.quantity || 0,
        stockStatus: pharmacyMedicine?.stockStatus || "Out of Stock",
      };
    });

    return {
      medicines: medicinesWithPharmacyData,
      pagination: {
        page,
        limit,
        total: medicinesWithPharmacyData.length,
        pages: Math.ceil(medicinesWithPharmacyData.length / limit),
      },
    };
  }

  // Get categories (for filters)
  async getCategories() {
    const categories = await Medicine.distinct("category");
    return categories.filter((cat) => cat && cat.trim() !== "");
  }

  // Get manufacturers (for filters)
  async getManufacturers() {
    const manufacturers = await Medicine.distinct("manufacturer");
    return manufacturers.filter((man) => man && man.trim() !== "");
  }

  // Search medicines (autocomplete)
  async searchMedicines(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } },
      ],
    } as any)
      .limit(limit)
      .select("name genericName category image");

    return medicines;
  }
}

export default new MedicineService();