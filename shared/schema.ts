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
  // Added for GST
  stateCode: text("state_code"), // State code for IGST determination
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
  // Added for GST and price revaluation
  hsnCode: text("hsn_code"), // HSN code for GST
  gstRate: real("gst_rate"), // GST rate (percentage)
  lastPriceUpdate: timestamp("last_price_update"),
  originalCost: real("original_cost"), // Original cost for tracking price changes
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  lastPriceUpdate: true,
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
  // Added for GST
  gstNumber: text("gst_number"), // GSTIN
  panNumber: text("pan_number"), // PAN for taxation
  stateCode: text("state_code"), // For IGST determination
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
  // Added for payment tracking
  paymentStatus: text("payment_status").default("pending"), // pending, partial, paid
  paymentDueDate: timestamp("payment_due_date"),
  totalAmount: real("total_amount"),
  paidAmount: real("paid_amount").default(0),
});

export const insertSupplierOrderSchema = createInsertSchema(supplierOrders).omit({
  id: true,
  orderDate: true,
  paidAmount: true,
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  // Added for GST
  hsnCode: text("hsn_code"),
  gstRate: real("gst_rate"),
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
  // Link to invoice if applicable
  invoiceId: integer("invoice_id"),
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

// New tables for the requested features

// Invoices (for GST compliance and printing)
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address"),
  customerGstin: text("customer_gstin"),
  customerStateCode: text("customer_state_code"),
  invoiceDate: timestamp("invoice_date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  locationId: integer("location_id").notNull(), // From which location
  subtotal: real("subtotal").notNull(),
  cgstAmount: real("cgst_amount").default(0),
  sgstAmount: real("sgst_amount").default(0),
  igstAmount: real("igst_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("unpaid"), // unpaid, partial, paid
  notes: text("notes"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceDate: true,
});

// Invoice Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  hsnCode: text("hsn_code"),
  gstRate: real("gst_rate").notNull(),
  cgstRate: real("cgst_rate").default(0),
  sgstRate: real("sgst_rate").default(0),
  igstRate: real("igst_rate").default(0),
  amount: real("amount").notNull(), // Pre-tax amount
  totalAmount: real("total_amount").notNull(), // Including tax
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

// Price Revaluations
export const priceRevaluations = pgTable("price_revaluations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  oldPrice: real("old_price").notNull(),
  newPrice: real("new_price").notNull(),
  revaluationDate: timestamp("revaluation_date").notNull().defaultNow(),
  reason: text("reason").notNull(),
  userId: integer("user_id").notNull(), // Who performed the change
});

export const insertPriceRevaluationSchema = createInsertSchema(priceRevaluations).omit({
  id: true,
  revaluationDate: true,
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "invoice" or "supplierOrder"
  entityId: integer("entity_id").notNull(),
  amount: real("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(), // cash, bank transfer, etc.
  reference: text("reference"), // Reference number
  notes: text("notes"),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paymentDate: true,
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

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type PriceRevaluation = typeof priceRevaluations.$inferSelect;
export type InsertPriceRevaluation = z.infer<typeof insertPriceRevaluationSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Extended schemas for joined data
export const productWithInventorySchema = z.object({
  id: z.number(),
  name: z.string(),
  sku: z.string(),
  barcode: z.string().optional().nullable(),
  category: z.string(),
  description: z.string().optional().nullable(),
  unitPrice: z.number(),
  reorderPoint: z.number(),
  imageUrl: z.string().optional().nullable(),
  quantity: z.number(),
  locationId: z.number(),
  status: z.enum(['Low Stock', 'Medium Stock', 'In Stock']),
  // Added for GST
  hsnCode: z.string().optional().nullable(),
  gstRate: z.number().optional().nullable(),
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

// New composite types for the requested features

export const invoiceWithItemsSchema = z.object({
  invoice: z.object({
    id: z.number(),
    invoiceNumber: z.string(),
    customerName: z.string(),
    customerAddress: z.string().nullable().optional(),
    customerGstin: z.string().nullable().optional(),
    customerStateCode: z.string().nullable().optional(),
    invoiceDate: z.date(),
    dueDate: z.date().nullable().optional(),
    subtotal: z.number(),
    cgstAmount: z.number(),
    sgstAmount: z.number(),
    igstAmount: z.number(),
    totalAmount: z.number(),
    status: z.string(),
    notes: z.string().nullable().optional(),
    locationDetails: z.object({
      name: z.string(),
      address: z.string().nullable().optional(),
      stateCode: z.string().nullable().optional(),
    }).optional(),
  }),
  items: z.array(z.object({
    id: z.number(),
    productId: z.number(),
    productName: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    hsnCode: z.string().nullable().optional(),
    gstRate: z.number(),
    cgstRate: z.number().optional(),
    sgstRate: z.number().optional(),
    igstRate: z.number().optional(),
    amount: z.number(),
    totalAmount: z.number(),
  })),
});

export type InvoiceWithItems = z.infer<typeof invoiceWithItemsSchema>;

export const paymentSummarySchema = z.object({
  upcoming: z.array(z.object({
    id: z.number(),
    entityType: z.string(),
    entityName: z.string(),
    amount: z.number(),
    dueDate: z.date(),
    daysRemaining: z.number(),
    status: z.string(),
  })),
  toPay: z.number(),
  toReceive: z.number(),
  overdueCount: z.number(),
});

export type PaymentSummary = z.infer<typeof paymentSummarySchema>;

export const gstSummarySchema = z.object({
  month: z.string(),
  year: z.number(),
  outwardSupplies: z.object({
    taxableAmount: z.number(),
    cgst: z.number(),
    sgst: z.number(),
    igst: z.number(),
    total: z.number(),
  }),
  inwardSupplies: z.object({
    taxableAmount: z.number(),
    cgst: z.number(),
    sgst: z.number(),
    igst: z.number(),
    total: z.number(),
  }),
  netTax: z.object({
    cgst: z.number(),
    sgst: z.number(),
    igst: z.number(),
    total: z.number(),
  }),
});

export type GstSummary = z.infer<typeof gstSummarySchema>;
