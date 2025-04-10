import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertInventorySchema, 
  insertSupplierSchema, 
  insertSupplierOrderSchema,
  insertOrderItemSchema,
  insertSalesSchema
} from "@shared/schema";
import { predictDemand, analyzeInventory } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products
  app.get("/api/products", async (req: Request, res: Response) => {
    const products = await storage.getProducts();
    res.json(products);
  });
  
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  
  app.put("/api/products/:id", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, validatedData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  
  // Barcode lookup
  app.get("/api/barcode/:barcode", async (req: Request, res: Response) => {
    const barcode = req.params.barcode;
    const product = await storage.getProductByBarcode(barcode);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  // Locations
  app.get("/api/locations", async (req: Request, res: Response) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });
  
  // Inventory
  app.get("/api/inventory", async (req: Request, res: Response) => {
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
    
    try {
      const inventoryWithProducts = await storage.getInventoryWithProducts(locationId);
      res.json(inventoryWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory", error });
    }
  });
  
  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const inventory = await storage.createInventory(validatedData);
      res.status(201).json(inventory);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data", error });
    }
  });
  
  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    const inventoryId = parseInt(req.params.id);
    if (isNaN(inventoryId)) {
      return res.status(400).json({ message: "Invalid inventory ID" });
    }
    
    try {
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const updatedInventory = await storage.updateInventory(inventoryId, validatedData);
      
      if (!updatedInventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      
      res.json(updatedInventory);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data", error });
    }
  });
  
  // Update inventory via barcode scan
  app.post("/api/inventory/scan", async (req: Request, res: Response) => {
    const { barcode, locationId, quantityChange } = req.body;
    
    if (!barcode || !locationId || quantityChange === undefined) {
      return res.status(400).json({ message: "Required fields: barcode, locationId, quantityChange" });
    }
    
    try {
      // Find the product by barcode
      const product = await storage.getProductByBarcode(barcode);
      if (!product) {
        return res.status(404).json({ message: "Product not found for this barcode" });
      }
      
      // Find the inventory for this product and location
      const inventoryItems = await storage.getProductInventory(product.id, locationId);
      
      if (inventoryItems.length === 0) {
        // Create new inventory if it doesn't exist
        if (quantityChange <= 0) {
          return res.status(400).json({ message: "Cannot reduce quantity below 0" });
        }
        
        const newInventory = await storage.createInventory({
          productId: product.id,
          locationId,
          quantity: quantityChange
        });
        
        return res.status(201).json({
          message: "New inventory created",
          inventory: newInventory,
          product
        });
      } else {
        // Update existing inventory
        const inventoryItem = inventoryItems[0];
        const newQuantity = inventoryItem.quantity + quantityChange;
        
        if (newQuantity < 0) {
          return res.status(400).json({ message: "Cannot reduce quantity below 0" });
        }
        
        const updatedInventory = await storage.updateInventory(inventoryItem.id, {
          quantity: newQuantity
        });
        
        return res.json({
          message: "Inventory updated",
          inventory: updatedInventory,
          product
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating inventory", error });
    }
  });
  
  // Suppliers
  app.get("/api/suppliers", async (req: Request, res: Response) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });
  
  app.post("/api/suppliers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data", error });
    }
  });
  
  // Supplier Orders
  app.get("/api/supplier-orders", async (req: Request, res: Response) => {
    const supplierId = req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined;
    const orders = await storage.getSupplierOrders(supplierId);
    
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await storage.getOrderItems(order.id);
      return { ...order, items };
    }));
    
    res.json(ordersWithItems);
  });
  
  app.post("/api/supplier-orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      const validatedOrder = insertSupplierOrderSchema.parse(order);
      const newOrder = await storage.createSupplierOrder(validatedOrder);
      
      if (Array.isArray(items) && items.length > 0) {
        const orderItems = await Promise.all(items.map(async (item) => {
          const validatedItem = insertOrderItemSchema.parse({
            ...item,
            orderId: newOrder.id
          });
          return await storage.createOrderItem(validatedItem);
        }));
        
        return res.status(201).json({ order: newOrder, items: orderItems });
      }
      
      res.status(201).json({ order: newOrder, items: [] });
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  
  app.put("/api/supplier-orders/:id", async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    try {
      const validatedData = insertSupplierOrderSchema.partial().parse(req.body);
      const updatedOrder = await storage.updateSupplierOrder(orderId, validatedData);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  
  // Sales
  app.post("/api/sales", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSalesSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sales data", error });
    }
  });
  
  app.get("/api/sales/trends", async (req: Request, res: Response) => {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    try {
      const sales = await storage.getSales(productId, locationId, startDate, endDate);
      
      // Group by date
      const salesByDate = sales.reduce((acc, sale) => {
        const dateStr = sale.date.toISOString().split('T')[0];
        
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            quantity: 0,
            value: 0
          };
        }
        
        acc[dateStr].quantity += sale.quantity;
        acc[dateStr].value += sale.quantity * sale.unitPrice;
        
        return acc;
      }, {});
      
      // Convert to array and sort by date
      const trendsData = Object.values(salesByDate).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      res.json(trendsData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales trends", error });
    }
  });
  
  // Supplier Activity
  app.get("/api/supplier-activity", async (req: Request, res: Response) => {
    try {
      const activity = await storage.getSupplierActivity();
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Error fetching supplier activity", error });
    }
  });
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
    
    try {
      const stats = await storage.getInventoryStats(locationId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats", error });
    }
  });
  
  // AI Predictions
  app.get("/api/predictions", async (req: Request, res: Response) => {
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
    
    try {
      const predictions = await storage.getPredictionsWithProducts(locationId);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching predictions", error });
    }
  });
  
  app.post("/api/predictions/generate", async (req: Request, res: Response) => {
    const { productId, locationId, period = '30days' } = req.body;
    
    if (!productId || !locationId) {
      return res.status(400).json({ message: "Required fields: productId, locationId" });
    }
    
    try {
      // Get product info
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get sales history
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // Last 90 days
      
      const salesHistory = await storage.getSales(productId, locationId, startDate, endDate);
      
      // Format data for the AI
      const historicalData = salesHistory.map(sale => ({
        date: sale.date.toISOString().split('T')[0],
        quantity: sale.quantity
      }));
      
      // Generate prediction with AI
      const prediction = await predictDemand(
        productId,
        product.name,
        historicalData,
        period as '30days' | '60days' | '90days'
      );
      
      // Save prediction to storage
      const savedPrediction = await storage.createPrediction({
        productId,
        locationId,
        predictedDemand: prediction.predictedDemand,
        confidence: prediction.confidence,
        period
      });
      
      res.json({
        prediction: savedPrediction,
        product
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating prediction", error });
    }
  });
  
  app.post("/api/predictions/analyze", async (req: Request, res: Response) => {
    const { locationId, limit = 5 } = req.body;
    
    if (!locationId) {
      return res.status(400).json({ message: "Required field: locationId" });
    }
    
    try {
      // Get inventory data
      const inventoryItems = await storage.getInventoryWithProducts(locationId);
      
      // Get sales data for demand analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Prepare data for AI analysis
      const productsForAnalysis = await Promise.all(
        inventoryItems.map(async (item) => {
          const sales = await storage.getSales(item.id, locationId, startDate, endDate);
          const historicalDemand = sales.reduce((sum, sale) => sum + sale.quantity, 0);
          
          return {
            id: item.id,
            name: item.name,
            sku: item.sku,
            currentStock: item.quantity,
            reorderPoint: item.reorderPoint,
            historicalDemand,
            category: item.category
          };
        })
      );
      
      // Run AI analysis
      const recommendations = await analyzeInventory(productsForAnalysis, limit);
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Error analyzing inventory", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
