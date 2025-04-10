import { pgTable, text, serial, integer, boolean, real, doublePrecision, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  locationId: integer("location_id"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  type: text("type").notNull(), // warehouse, store, etc.
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode").unique(),
  category: text("category").notNull(),
  description: text("description"),
  unitPrice: real("unit_price").notNull(),
  reorderPoint: integer("reorder_point").notNull(),
  imageUrl: text("image_url"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  locationId: integer("location_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  active: boolean("active").notNull().default(true),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

// SupplierProducts - which supplier provides which products
export const supplierProducts = pgTable("supplier_products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  productId: integer("product_id").notNull(),
  leadTime: integer("lead_time"), // in days
  unitCost: real("unit_cost"),
});

export const insertSupplierProductSchema = createInsertSchema(supplierProducts).omit({
  id: true,
});

// Orders to suppliers
export const supplierOrders = pgTable("supplier_orders", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, canceled
  expectedDelivery: timestamp("expected_delivery"),
  notes: text("notes"),
});

export const insertSupplierOrderSchema = createInsertSchema(supplierOrders).omit({
  id: true,
  orderDate: true,
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Sales (for trend analysis)
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
});

export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  date: true,
});

// AI Predictions
export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  locationId: integer("location_id").notNull(),
  predictedDemand: integer("predicted_demand").notNull(),
  confidence: real("confidence").notNull(),
  period: text("period").notNull(), // e.g., "30days", "60days"
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  generatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type SupplierProduct = typeof supplierProducts.$inferSelect;
export type InsertSupplierProduct = z.infer<typeof insertSupplierProductSchema>;

export type SupplierOrder = typeof supplierOrders.$inferSelect;
export type InsertSupplierOrder = z.infer<typeof insertSupplierOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSalesSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

// Extended schemas for joined data
export const productWithInventorySchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  barcode: z.string().optional(),
  category: z.string(),
  description: z.string().optional(),
  unitPrice: z.number(),
  reorderPoint: z.number(),
  imageUrl: z.string().optional(),
  quantity: z.number(),
  locationId: z.number(),
  status: z.enum(['Low Stock', 'Medium Stock', 'In Stock']),
});

export type ProductWithInventory = z.infer<typeof productWithInventorySchema>;

export const predictionWithProductSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  sku: z.string(),
  category: z.string(),
  currentStock: z.number(),
  predictedDemand: z.number(),
  recommendedOrder: z.number(),
  confidence: z.number(),
  status: z.enum(['Low Stock', 'Medium Stock', 'In Stock']),
});

export type PredictionWithProduct = z.infer<typeof predictionWithProductSchema>;

export const supplierActivitySchema = z.object({
  pending: z.array(z.object({
    id: z.number(),
    name: z.string(),
    requestedAgo: z.string(),
  })),
  updates: z.array(z.object({
    id: z.number(),
    name: z.string(),
    action: z.string(),
    orderNumber: z.string().optional(),
    timestamp: z.string(),
  })),
});

export type SupplierActivity = z.infer<typeof supplierActivitySchema>;
