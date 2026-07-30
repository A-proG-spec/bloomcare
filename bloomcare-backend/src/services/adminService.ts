import mongoose from "mongoose";
import User from "../models/User";
import Pharmacy from "../models/Pharmacy";
import PharmacyApplication from "../models/PharmacyApplication";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem"; // ADD THIS IMPORT
import Review from "../models/Review";
import Medicine from "../models/Medicine";
import Notification from "../models/Notification"; // ADD THIS IMPORT (with alias to avoid conflict)
import { logger } from "../config/logger";

class AdminService {
  // ============ DASHBOARD OVERVIEW ============

  async getDashboardStats() {
    const [
      totalUsers,
      totalPharmacies,
      totalOrders,
      totalReviews,
      totalMedicines,
      pendingApplications,
      todayOrders,
      revenueData,
    ] = await Promise.all([
      User.countDocuments(),
      Pharmacy.countDocuments({ isActive: true } as any), // ADDED as any
      Order.countDocuments(),
      Review.countDocuments(),
      Medicine.countDocuments(),
      PharmacyApplication.countDocuments({ status: "pending" } as any), // ADDED as any
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      } as any),
      this.getRevenueByPeriod("month"),
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "fullName email")
      .populate("pharmacy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent users
    const recentUsers = await User.find()
      .select("-password -refreshToken -otp -otpExpires")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent pharmacy applications
    const recentApplications = await PharmacyApplication.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      stats: {
        totalUsers,
        totalPharmacies,
        totalOrders,
        totalReviews,
        totalMedicines,
        pendingApplications,
        todayOrders,
        totalRevenue: revenueData.total,
      },
      recent: {
        orders: recentOrders,
        users: recentUsers,
        applications: recentApplications,
      },
    };
  }

  // ============ USER MANAGEMENT ============

  async getUsers(
    search?: string,
    role?: string,
    isEmailVerified?: boolean,
    page: number = 1,
    limit: number = 10
  ) {
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isEmailVerified !== undefined) {
      query.isEmailVerified = isEmailVerified;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken -otp -otpExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("ownedPharmacy", "name"),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId)
      .select("-password -refreshToken -otp -otpExpires")
      .populate("ownedPharmacy", "name address phone");

    if (!user) {
      throw new Error("User not found");
    }

    // Get user stats
    const [orderCount, reviewCount, totalSpent] = await Promise.all([
      Order.countDocuments({ user: userId } as any), // ADDED as any
      Review.countDocuments({ user: userId } as any), // ADDED as any
      Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: "Delivered" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    return {
      user,
      stats: {
        orderCount,
        reviewCount,
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
      },
    };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't allow changing own role
    if (user._id.toString() === userId) {
      throw new Error("Cannot change your own role");
    }

    user.role = role as any;
    await user.save();

    logger.info(`User ${userId} role updated to ${role}`);

    return user;
  }

  async deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't allow deleting self
    if (user._id.toString() === userId) {
      throw new Error("Cannot delete your own account");
    }

    // Check if user owns a pharmacy
    if (user.role === "pharmacy_owner" && user.ownedPharmacy) {
      await Pharmacy.findByIdAndDelete(user.ownedPharmacy);
    }

    // Delete user's reviews
    await Review.deleteMany({ user: userId } as any); // ADDED as any

    // Delete user's notifications
    await Notification.deleteMany({ user: userId } as any); // ADDED as any

    await User.findByIdAndDelete(userId);

    logger.info(`User ${userId} deleted`);

    return { success: true, message: "User deleted successfully" };
  }

  // ============ PHARMACY MANAGEMENT ============

  async getAllPharmacies(
    search?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 10
  ) {
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [pharmacies, total] = await Promise.all([
      Pharmacy.find(query)
        .populate("owner", "fullName email phone")
        .sort({ createdAt: -1 })
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

  async togglePharmacyStatus(pharmacyId: string) {
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    pharmacy.isActive = !pharmacy.isActive;
    await pharmacy.save();

    logger.info(`Pharmacy ${pharmacyId} status toggled to ${pharmacy.isActive}`);

    return pharmacy;
  }

  // ============ PHARMACY APPLICATIONS ============

  async getPendingApplications(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      PharmacyApplication.find({ status: "pending" } as any) // ADDED as any
        .populate("user", "fullName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PharmacyApplication.countDocuments({ status: "pending" } as any), // ADDED as any
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

  // ============ ORDER MANAGEMENT ============

  async getAllOrders(
    status?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 10
  ) {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "fullName email phone")
        .populate("pharmacy", "name address phone")
        .populate({
          path: "items",
          populate: {
            path: "medicine",
            select: "name genericName category",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ============ ANALYTICS ============

  async getRevenueByPeriod(period: string = "month") {
    let groupFormat: any = {};
    let dateFormat: string = "";

    switch (period) {
      case "day":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        groupFormat = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        dateFormat = "Week %U, %Y";
        break;
      case "month":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        dateFormat = "%Y-%m";
        break;
      case "year":
        groupFormat = {
          year: { $year: "$createdAt" },
        };
        dateFormat = "%Y";
        break;
      default:
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        dateFormat = "%Y-%m";
    }

    const revenueData = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const total = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    return {
      data: revenueData,
      total: total.length > 0 ? total[0].total : 0,
    };
  }

  async getUserGrowth(period: string = "month") {
    let groupFormat: any = {};

    switch (period) {
      case "day":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "week":
        groupFormat = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "month":
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      case "year":
        groupFormat = {
          year: { $year: "$createdAt" },
        };
        break;
      default:
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
    }

    const growthData = await User.aggregate([
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return growthData;
  }

  async getOrderStatusDistribution() {
    const distribution = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return distribution;
  }

  async getTopPharmacies(limit: number = 10) {
    const topPharmacies = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: "$pharmacy",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "pharmacies",
          localField: "_id",
          foreignField: "_id",
          as: "pharmacy",
        },
      },
      { $unwind: "$pharmacy" },
      {
        $project: {
          pharmacyId: "$_id",
          name: "$pharmacy.name",
          address: "$pharmacy.address",
          totalOrders: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return topPharmacies;
  }

  async getTopMedicines(limit: number = 10) {
    const topMedicines = await OrderItem.aggregate([
      {
        $group: {
          _id: "$medicine",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "medicine",
        },
      },
      { $unwind: "$medicine" },
      {
        $project: {
          medicineId: "$_id",
          name: "$medicine.name",
          genericName: "$medicine.genericName",
          category: "$medicine.category",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return topMedicines;
  }

  async getFullAnalytics(period: string = "month") {
    const [revenue, userGrowth, orderStatus, topPharmacies, topMedicines] = await Promise.all([
      this.getRevenueByPeriod(period),
      this.getUserGrowth(period),
      this.getOrderStatusDistribution(),
      this.getTopPharmacies(5),
      this.getTopMedicines(5),
    ]);

    return {
      revenue,
      userGrowth,
      orderStatus,
      topPharmacies,
      topMedicines,
    };
  }
}

export default new AdminService();