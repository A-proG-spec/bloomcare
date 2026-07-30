import mongoose, { Types } from "mongoose";
import Pharmacy, { IPharmacy } from "../models/Pharmacy";
import PharmacyApplication from "../models/PharmacyApplication";
import User from "../models/User";
import { logger } from "../config/logger";
import notificationService from "./notificationService";

interface IApplicationData {
  userId: string;
  pharmacyName: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  openingHours?: any;
}

interface IReviewData {
  applicationId: string;
  status: "approved" | "rejected";
  adminNotes?: string;
  adminId: string;
}

class PharmacyService {
  async getPharmacies(
    search?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 20
  ) {
    // ✅ FIXED: Properly typed query with $or condition
    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [pharmacies, total] = await Promise.all([
      Pharmacy.find(query)
        .populate("owner", "fullName email phone")
        .populate("medicines.medicine", "name genericName category")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Pharmacy.countDocuments(query),
    ]);

    return {
      pharmacies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMyPharmacyOrApplication(userId: string) {
    // 1. Check if user owns a pharmacy (approved)
    // ✅ FIXED: Use new Types.ObjectId()
    const pharmacy = await Pharmacy.findOne({ 
      owner: new Types.ObjectId(userId) 
    })
      .populate("owner", "fullName email phone")
      .populate("medicines.medicine", "name genericName category image");

    if (pharmacy) {
      return {
        status: "approved",
        pharmacy,
        application: null,
      };
    }

    // 2. Check if user has an application (pending or rejected)
    // ✅ FIXED: Use new Types.ObjectId()
    const application = await PharmacyApplication.findOne({ 
      user: new Types.ObjectId(userId) 
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email");

    if (application) {
      return {
        status: application.status,
        pharmacy: null,
        application,
      };
    }

    // 3. No pharmacy and no application
    return {
      status: "none",
      pharmacy: null,
      application: null,
    };
  }

  async getPharmacyById(id: string) {
    const pharmacy = await Pharmacy.findById(id)
      .populate("owner", "fullName email phone")
      .populate("medicines.medicine", "name genericName category manufacturer image");

    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    return pharmacy;
  }

  async applyForPharmacy(data: IApplicationData) {
    const { userId, ...applicationData } = data;

    // Check if user already has a pharmacy
    // ✅ FIXED: Use new Types.ObjectId()
    const existingPharmacy = await Pharmacy.findOne({ 
      owner: new Types.ObjectId(userId) 
    });
    if (existingPharmacy) {
      throw new Error("You already own a pharmacy");
    }

    // Check if user already has a pending application
    // ✅ FIXED: Use new Types.ObjectId()
    const existingApplication = await PharmacyApplication.findOne({
      user: new Types.ObjectId(userId),
      status: "pending",
    });
    if (existingApplication) {
      throw new Error("You already have a pending pharmacy application");
    }

    // Check if user already has a rejected application (can reapply after 30 days)
    // ✅ FIXED: Use new Types.ObjectId()
    const rejectedApplication = await PharmacyApplication.findOne({
      user: new Types.ObjectId(userId),
      status: "rejected",
    });
    if (rejectedApplication) {
      const daysSinceRejection = Math.floor(
        (Date.now() - rejectedApplication.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceRejection < 30) {
        throw new Error(`You can reapply after ${30 - daysSinceRejection} days`);
      }
    }

    // Create application
    // ✅ FIXED: Use new Types.ObjectId()
    const application = await PharmacyApplication.create({
      user: new Types.ObjectId(userId),
      pharmacyName: applicationData.pharmacyName,
      address: applicationData.address,
      latitude: applicationData.latitude,
      longitude: applicationData.longitude,
      phone: applicationData.phone,
      email: applicationData.email,
      website: applicationData.website,
      openingHours: applicationData.openingHours,
      status: "pending",
    });

    // Update user's application status
    // ✅ FIXED: Use new Types.ObjectId()
    await User.findByIdAndUpdate(
      new Types.ObjectId(userId), 
      {
        pharmacyApplication: {
          status: "pending",
          submittedAt: new Date(),
        },
      }
    );

    logger.info(`Pharmacy application submitted by user ${userId}`);

    return application;
  }

  async getMyApplication(userId: string) {
    // ✅ FIXED: Use new Types.ObjectId()
    const application = await PharmacyApplication.findOne({
      user: new Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    if (!application) {
      throw new Error("No pharmacy application found");
    }

    return application;
  }

  async getMyPharmacy(userId: string) {
    // ✅ FIXED: Use new Types.ObjectId()
    const pharmacy = await Pharmacy.findOne({ 
      owner: new Types.ObjectId(userId) 
    })
      .populate("owner", "fullName email phone")
      .populate("medicines.medicine", "name genericName category image");

    if (!pharmacy) {
      throw new Error("You don't own a pharmacy");
    }

    return pharmacy;
  }

  async getAllApplications(status?: string, page: number = 1, limit: number = 10) {
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      PharmacyApplication.find(query)
        .populate("user", "fullName email phone image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PharmacyApplication.countDocuments(query),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async reviewApplication(data: IReviewData) {
    const { applicationId, status, adminNotes, adminId } = data;

    try {
      const application = await PharmacyApplication.findById(applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      if (application.status !== "pending") {
        throw new Error(`Application is already ${application.status}`);
      }

      // Update application
      application.status = status;
      application.adminNotes = adminNotes || "";
      // ✅ FIXED: Use new Types.ObjectId() instead of mongoose.Types.ObjectId
      application.reviewedBy = new Types.ObjectId(adminId);
      application.reviewedAt = new Date();
      await application.save();

      // Update user's application status
      const userId = application.user;
      // ✅ FIXED: Use new Types.ObjectId()
      await User.findByIdAndUpdate(
        new Types.ObjectId(userId), 
        {
          pharmacyApplication: {
            status: status,
            submittedAt: application.createdAt,
            reviewedAt: new Date(),
            rejectionReason: status === "rejected" ? adminNotes : undefined,
          },
        }
      );

      let pharmacy = null;

      if (status === "approved") {
        // Create pharmacy
        // ✅ FIXED: Use new Types.ObjectId() for owner
        pharmacy = await Pharmacy.create({
          name: application.pharmacyName,
          owner: new Types.ObjectId(application.user),
          address: application.address,
          latitude: application.latitude,
          longitude: application.longitude,
          phone: application.phone,
          email: application.email,
          website: application.website,
          openingHours: application.openingHours,
          isActive: true,
        });

        // Update user role
        // ✅ FIXED: Use new Types.ObjectId()
        await User.findByIdAndUpdate(
          new Types.ObjectId(application.user), 
          {
            role: "pharmacy_owner",
            ownedPharmacy: pharmacy._id,
          }
        );

        // Send notification
        await notificationService.createNotification({
          userId: application.user.toString(),
          title: "Pharmacy Approved! 🎉",
          message: `Your pharmacy "${application.pharmacyName}" has been approved. You can now start managing your inventory.`,
          type: "pharmacy",
          referenceId: pharmacy._id.toString(),
          referenceType: "pharmacy",
          icon: "🏥",
          link: `/pharmacy/${pharmacy._id}`,
        });

        logger.info(`Pharmacy application approved for user ${application.user}`);
      } else {
        // Send rejection notification
        await notificationService.createNotification({
          userId: application.user.toString(),
          title: "Pharmacy Application Status",
          message: `Your pharmacy application "${application.pharmacyName}" was not approved. ${adminNotes || ""}`,
          type: "pharmacy",
          referenceId: application._id.toString(),
          referenceType: "application",
          icon: "❌",
        });

        logger.info(`Pharmacy application rejected for user ${application.user}`);
      }

      return {
        application,
        pharmacy: pharmacy,
      };
    } catch (error: any) {
      logger.error("Error reviewing application:", error);
      throw new Error(error.message || "Failed to review application");
    }
  }

  async updatePharmacy(userId: string, updateData: any) {
    // ✅ FIXED: Use new Types.ObjectId()
    const pharmacy = await Pharmacy.findOne({ 
      owner: new Types.ObjectId(userId) 
    });
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      pharmacy._id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Pharmacy updated for user ${userId}`);

    return updatedPharmacy;
  }

  async getNearbyPharmacies(lat: number, lng: number, radius: number = 10) {
    // Using MongoDB's geospatial query
    const pharmacies = await Pharmacy.find({
      isActive: true,
      latitude: { $gte: lat - radius / 111, $lte: lat + radius / 111 },
      longitude: { $gte: lng - radius / 111, $lte: lng + radius / 111 },
    })
      .populate("medicines.medicine")
      .limit(50);

    // Calculate distance for each pharmacy
    const pharmaciesWithDistance = pharmacies.map((pharmacy) => {
      const distance = this.calculateDistance(
        lat,
        lng,
        pharmacy.latitude,
        pharmacy.longitude
      );
      return {
        ...pharmacy.toObject(),
        distance: Math.round(distance * 10) / 10,
      };
    });

    // Sort by distance
    return pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export default new PharmacyService();