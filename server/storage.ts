import {
  User,
  InsertUser,
  Product,
  InsertProduct,
  Location,
  InsertLocation,
  Inventory,
  InsertInventory,
  Supplier,
  InsertSupplier,
  SupplierProduct,
  InsertSupplierProduct,
  SupplierOrder,
  InsertSupplierOrder,
  OrderItem,
  InsertOrderItem,
  Sale,
  InsertSale,
  Prediction,
  InsertPrediction,
  ProductWithInventory,
  PredictionWithProduct,
  SupplierActivity,
  // New types for tax, invoice, payments, and price revaluation
  Invoice,
  InvoiceItem,
  InsertInvoice,
  InsertInvoiceItem,
  InvoiceWithItems,
  Payment,
  InsertPayment,
  PaymentSummary,
  PriceRevaluation,
  InsertPriceRevaluation,
  GstSummary
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  
  // Inventory
  getInventory(locationId?: number): Promise<Inventory[]>;
  getProductInventory(productId: number, locationId?: number): Promise<Inventory[]>;
  updateInventory(id: number, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  
  // Supplier Products
  getSupplierProducts(supplierId: number): Promise<SupplierProduct[]>;
  createSupplierProduct(supplierProduct: InsertSupplierProduct): Promise<SupplierProduct>;
  
  // Supplier Orders
  getSupplierOrders(supplierId?: number): Promise<SupplierOrder[]>;
  createSupplierOrder(order: InsertSupplierOrder): Promise<SupplierOrder>;
  updateSupplierOrder(id: number, order: Partial<InsertSupplierOrder>): Promise<SupplierOrder | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Sales
  getSales(productId?: number, locationId?: number, startDate?: Date, endDate?: Date): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Predictions
  getPredictions(productId?: number, locationId?: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  
  // Invoices - New for GST tax calculation and invoice printing
  getInvoices(status?: string, startDate?: Date, endDate?: Date): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // Invoice Items - New for GST tax calculation
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  
  // Price Revaluations - New for price fluctuations
  getPriceRevaluations(productId?: number, startDate?: Date, endDate?: Date): Promise<PriceRevaluation[]>;
  createPriceRevaluation(revaluation: InsertPriceRevaluation): Promise<PriceRevaluation>;
  
  // Payments - New for payment tracking
  getPayments(entityType?: string, status?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Composite operations
  getInventoryWithProducts(locationId?: number): Promise<ProductWithInventory[]>;
  getPredictionsWithProducts(locationId?: number): Promise<PredictionWithProduct[]>;
  getSupplierActivity(): Promise<SupplierActivity>;
  getInventoryStats(locationId?: number): Promise<{
    totalValue: number;
    lowStockCount: number;
    pendingOrders: number;
    activeSuppliers: number;
  }>;
  
  // New composite operations
  getInvoiceWithItems(invoiceId: number): Promise<InvoiceWithItems | undefined>;
  getPaymentSummary(): Promise<PaymentSummary>;
  getGstSummary(month: number, year: number): Promise<GstSummary>;
  calculateGstForItem(unitPrice: number, quantity: number, gstRate: number, isInterState: boolean): Promise<{
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private locations: Map<number, Location>;
  private inventory: Map<number, Inventory>;
  private suppliers: Map<number, Supplier>;
  private supplierProducts: Map<number, SupplierProduct>;
  private supplierOrders: Map<number, SupplierOrder>;
  private orderItems: Map<number, OrderItem>;
  private sales: Map<number, Sale>;
  private predictions: Map<number, Prediction>;
  // New storage maps for the requested features
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private priceRevaluations: Map<number, PriceRevaluation>;
  private payments: Map<number, Payment>;
  
  private userId: number = 1;
  private productId: number = 1;
  private locationId: number = 1;
  private inventoryId: number = 1;
  private supplierId: number = 1;
  private supplierProductId: number = 1;
  private supplierOrderId: number = 1;
  private orderItemId: number = 1;
  private saleId: number = 1;
  private predictionId: number = 1;
  // New IDs for the requested features
  private invoiceId: number = 1;
  private invoiceItemId: number = 1;
  private priceRevaluationId: number = 1;
  private paymentId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.locations = new Map();
    this.inventory = new Map();
    this.suppliers = new Map();
    this.supplierProducts = new Map();
    this.supplierOrders = new Map();
    this.orderItems = new Map();
    this.sales = new Map();
    this.predictions = new Map();
    // Initialize new maps for additional features
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.priceRevaluations = new Map();
    this.payments = new Map();
    
    // Initialize data directly
    this.initializeData();
  }
  
  private initializeData() {
    // Create default user directly (not using async methods)
    const adminId = this.userId++;
    const admin: User = {
      id: adminId,
      username: 'admin',
      password: 'admin123',
      fullName: 'John Doe',
      role: 'admin',
      locationId: null
    };
    this.users.set(adminId, admin);
    
    // Create default locations directly
    const warehouseAId = this.locationId++;
    const warehouseA: Location = {
      id: warehouseAId,
      name: 'Warehouse A',
      address: '123 Main St, Warehouse District',
      type: 'warehouse'
    };
    this.locations.set(warehouseAId, warehouseA);
    
    const store1Id = this.locationId++;
    const store1: Location = {
      id: store1Id,
      name: 'Store 1',
      address: '456 Retail Ave, Shopping Mall',
      type: 'store'
    };
    this.locations.set(store1Id, store1);
    
    const store2Id = this.locationId++;
    const store2: Location = {
      id: store2Id,
      name: 'Store 2',
      address: '789 Commerce Blvd, Downtown',
      type: 'store'
    };
    this.locations.set(store2Id, store2);
    
    // Create default suppliers directly
    const techDistributorsId = this.supplierId++;
    const techDistributors: Supplier = {
      id: techDistributorsId,
      name: 'Tech Distributors Inc.',
      contactName: 'Sarah Johnson',
      email: 'sjohnson@techdist.example',
      phone: '555-123-4567',
      address: '100 Supplier Road, Tech Park',
      active: true
    };
    this.suppliers.set(techDistributorsId, techDistributors);
    
    const globalGadgetId = this.supplierId++;
    const globalGadget: Supplier = {
      id: globalGadgetId,
      name: 'Global Gadget Supply',
      contactName: 'Mike Williams',
      email: 'mike@globalgadget.example',
      phone: '555-987-6543',
      address: '200 Import Street, Harbor District',
      active: true
    };
    this.suppliers.set(globalGadgetId, globalGadget);
    
    const electronicsWholesaleId = this.supplierId++;
    const electronicsWholesale: Supplier = {
      id: electronicsWholesaleId,
      name: 'Electronics Wholesale',
      contactName: 'Emma Taylor',
      email: 'etaylor@ewholesale.example',
      phone: '555-456-7890',
      address: '300 Bulk Avenue, Industrial Zone',
      active: true
    };
    this.suppliers.set(electronicsWholesaleId, electronicsWholesale);
    
    // Create products directly
    const headphonesId = this.productId++;
    const headphones: Product = {
      id: headphonesId,
      name: 'Premium Wireless Headphones',
      sku: 'WH-1000XM5',
      barcode: '1234567890123',
      category: 'Electronics',
      description: 'High-quality wireless headphones with noise cancellation',
      unitPrice: 299.99,
      reorderPoint: 15,
      imageUrl: null
    };
    this.products.set(headphonesId, headphones);
    
    const smarthubId = this.productId++;
    const smarthub: Product = {
      id: smarthubId,
      name: 'Smart Home Hub',
      sku: 'SHH-200',
      barcode: '2345678901234',
      category: 'Smart Home',
      description: 'Central hub for controlling smart home devices',
      unitPrice: 129.99,
      reorderPoint: 10,
      imageUrl: null
    };
    this.products.set(smarthubId, smarthub);
    
    const cameraId = this.productId++;
    const camera: Product = {
      id: cameraId,
      name: '4K Action Camera',
      sku: 'AC-4K-PRO',
      barcode: '3456789012345',
      category: 'Photography',
      description: 'Professional 4K action camera with waterproof case',
      unitPrice: 249.99,
      reorderPoint: 8,
      imageUrl: null
    };
    this.products.set(cameraId, camera);
    
    const watchId = this.productId++;
    const watch: Product = {
      id: watchId,
      name: 'Fitness Tracker Watch',
      sku: 'FTW-350',
      barcode: '4567890123456',
      category: 'Wearables',
      description: 'Advanced fitness tracker with heart rate monitoring',
      unitPrice: 89.99,
      reorderPoint: 20,
      imageUrl: null
    };
    this.products.set(watchId, watch);
    
    const tabletId = this.productId++;
    const tablet: Product = {
      id: tabletId,
      name: 'Tablet Pro 11"',
      sku: 'TP-11-2023',
      barcode: '5678901234567',
      category: 'Electronics',
      description: '11" professional tablet with stylus support',
      unitPrice: 499.99,
      reorderPoint: 15,
      imageUrl: null
    };
    this.products.set(tabletId, tablet);
    
    // Create inventory directly
    const inv1Id = this.inventoryId++;
    const inv1: Inventory = {
      id: inv1Id,
      productId: headphones.id,
      locationId: warehouseA.id,
      quantity: 5,
      lastUpdated: new Date()
    };
    this.inventory.set(inv1Id, inv1);
    
    const inv2Id = this.inventoryId++;
    const inv2: Inventory = {
      id: inv2Id,
      productId: smarthub.id,
      locationId: warehouseA.id,
      quantity: 12,
      lastUpdated: new Date()
    };
    this.inventory.set(inv2Id, inv2);
    
    const inv3Id = this.inventoryId++;
    const inv3: Inventory = {
      id: inv3Id,
      productId: camera.id,
      locationId: warehouseA.id,
      quantity: 3,
      lastUpdated: new Date()
    };
    this.inventory.set(inv3Id, inv3);
    
    const inv4Id = this.inventoryId++;
    const inv4: Inventory = {
      id: inv4Id,
      productId: watch.id,
      locationId: warehouseA.id,
      quantity: 45,
      lastUpdated: new Date()
    };
    this.inventory.set(inv4Id, inv4);
    
    const inv5Id = this.inventoryId++;
    const inv5: Inventory = {
      id: inv5Id,
      productId: tablet.id,
      locationId: warehouseA.id,
      quantity: 22,
      lastUpdated: new Date()
    };
    this.inventory.set(inv5Id, inv5);
    
    // Create supplier products directly
    const sp1Id = this.supplierProductId++;
    const sp1: SupplierProduct = {
      id: sp1Id,
      supplierId: techDistributors.id,
      productId: headphones.id,
      leadTime: 7,
      unitCost: 199.99
    };
    this.supplierProducts.set(sp1Id, sp1);
    
    const sp2Id = this.supplierProductId++;
    const sp2: SupplierProduct = {
      id: sp2Id,
      supplierId: techDistributors.id,
      productId: smarthub.id,
      leadTime: 5,
      unitCost: 79.99
    };
    this.supplierProducts.set(sp2Id, sp2);
    
    const sp3Id = this.supplierProductId++;
    const sp3: SupplierProduct = {
      id: sp3Id,
      supplierId: globalGadget.id,
      productId: camera.id,
      leadTime: 10,
      unitCost: 159.99
    };
    this.supplierProducts.set(sp3Id, sp3);
    
    const sp4Id = this.supplierProductId++;
    const sp4: SupplierProduct = {
      id: sp4Id,
      supplierId: electronicsWholesale.id,
      productId: watch.id,
      leadTime: 3,
      unitCost: 49.99
    };
    this.supplierProducts.set(sp4Id, sp4);
    
    const sp5Id = this.supplierProductId++;
    const sp5: SupplierProduct = {
      id: sp5Id,
      supplierId: electronicsWholesale.id,
      productId: tablet.id,
      leadTime: 7,
      unitCost: 349.99
    };
    this.supplierProducts.set(sp5Id, sp5);
    
    // Create sales (for trend data)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      
      // Headphones sales - trending up
      if (i % 3 === 0) {
        // Create sales record
        const sale: InsertSale = {
          locationId: store1.id,
          productId: headphones.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: 299.99
        };
        
        // Use direct set to bypass createSale method for initialization
        const saleId = this.saleId++;
        const saleObj: Sale = {
          ...sale,
          id: saleId,
          date: date
        };
        this.sales.set(saleId, saleObj);
      }
      
      // Smart Hub sales - consistent
      if (i % 2 === 0) {
        // Create sales record
        const sale: InsertSale = {
          locationId: store1.id,
          productId: smarthub.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          unitPrice: 129.99
        };
        
        // Use direct set to bypass createSale method for initialization
        const saleId = this.saleId++;
        const saleObj: Sale = {
          ...sale,
          id: saleId,
          date: date
        };
        this.sales.set(saleId, saleObj);
      }
      
      // Camera sales - seasonal
      if (i > 20 && i % 2 === 0) {
        // Create sales record
        const sale: InsertSale = {
          locationId: store2.id,
          productId: camera.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          unitPrice: 249.99
        };
        
        // Use direct set to bypass createSale method for initialization
        const saleId = this.saleId++;
        const saleObj: Sale = {
          ...sale,
          id: saleId,
          date: date
        };
        this.sales.set(saleId, saleObj);
      }
      
      // Watch sales - very popular
      {
        // Create sales record
        const sale: InsertSale = {
          locationId: store2.id,
          productId: watch.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          unitPrice: 89.99
        };
        
        // Use direct set to bypass createSale method for initialization
        const saleId = this.saleId++;
        const saleObj: Sale = {
          ...sale,
          id: saleId,
          date: date
        };
        this.sales.set(saleId, saleObj);
      }
      
      // Tablet sales - moderate
      if (i % 4 === 0) {
        // Create sales record
        const sale: InsertSale = {
          locationId: store1.id,
          productId: tablet.id,
          quantity: 1,
          unitPrice: 499.99
        };
        
        // Use direct set to bypass createSale method for initialization
        const saleId = this.saleId++;
        const saleObj: Sale = {
          ...sale,
          id: saleId,
          date: date
        };
        this.sales.set(saleId, saleObj);
      }
    }
    
    // Create initial predictions directly
    const pred1Id = this.predictionId++;
    const pred1: Prediction = {
      id: pred1Id,
      productId: headphones.id,
      locationId: warehouseA.id,
      predictedDemand: 30,
      confidence: 0.82,
      period: '30days',
      generatedAt: new Date()
    };
    this.predictions.set(pred1Id, pred1);
    
    const pred2Id = this.predictionId++;
    const pred2: Prediction = {
      id: pred2Id,
      productId: smarthub.id,
      locationId: warehouseA.id,
      predictedDemand: 28,
      confidence: 0.75,
      period: '30days',
      generatedAt: new Date()
    };
    this.predictions.set(pred2Id, pred2);
    
    const pred3Id = this.predictionId++;
    const pred3: Prediction = {
      id: pred3Id,
      productId: camera.id,
      locationId: warehouseA.id,
      predictedDemand: 18,
      confidence: 0.68,
      period: '30days',
      generatedAt: new Date()
    };
    this.predictions.set(pred3Id, pred3);
    
    // Create supplier orders
    const pendingOrder = this.createSupplierOrder({
      supplierId: techDistributors.id,
      status: 'pending',
      expectedDelivery: null,
      notes: 'Awaiting confirmation'
    });
    
    this.createOrderItem({
      orderId: pendingOrder.id,
      productId: headphones.id,
      quantity: 25,
      unitPrice: 199.99
    });
    
    const shippedOrder = this.createSupplierOrder({
      supplierId: globalGadget.id,
      status: 'shipped',
      expectedDelivery: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      notes: 'Tracking: SHP123456789'
    });
    
    this.createOrderItem({
      orderId: shippedOrder.id,
      productId: camera.id,
      quantity: 15,
      unitPrice: 159.99
    });
  }
  
  // User implementation
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      id,
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      role: user.role || 'user',
      locationId: user.locationId || null
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Product implementation
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }
  
  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.barcode === barcode);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || null,
      category: product.category,
      description: product.description || null,
      unitPrice: product.unitPrice,
      reorderPoint: product.reorderPoint,
      imageUrl: product.imageUrl || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Location implementation
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationId++;
    const newLocation: Location = { 
      id,
      name: location.name,
      type: location.type,
      address: location.address || null
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }
  
  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) return undefined;
    
    const updatedLocation: Location = { ...existingLocation, ...location };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }
  
  // Inventory implementation
  async getInventory(locationId?: number): Promise<Inventory[]> {
    const allInventory = Array.from(this.inventory.values());
    if (locationId !== undefined) {
      return allInventory.filter(item => item.locationId === locationId);
    }
    return allInventory;
  }
  
  async getProductInventory(productId: number, locationId?: number): Promise<Inventory[]> {
    const allInventory = Array.from(this.inventory.values());
    if (locationId !== undefined) {
      return allInventory.filter(item => item.productId === productId && item.locationId === locationId);
    }
    return allInventory.filter(item => item.productId === productId);
  }
  
  async updateInventory(id: number, inventory: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const existingInventory = this.inventory.get(id);
    if (!existingInventory) return undefined;
    
    const updatedInventory: Inventory = { 
      ...existingInventory, 
      ...inventory,
      lastUpdated: new Date()
    };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }
  
  async createInventory(inventory: InsertInventory): Promise<Inventory> {
    const id = this.inventoryId++;
    const newInventory: Inventory = { 
      id,
      locationId: inventory.locationId,
      productId: inventory.productId,
      quantity: inventory.quantity,
      lastUpdated: new Date() 
    };
    this.inventory.set(id, newInventory);
    return newInventory;
  }
  
  // Supplier implementation
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }
  
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierId++;
    const newSupplier: Supplier = { 
      id,
      name: supplier.name,
      address: supplier.address || null,
      contactName: supplier.contactName || null,
      email: supplier.email || null,
      phone: supplier.phone || null,
      active: supplier.active !== undefined ? supplier.active : true
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }
  
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existingSupplier = this.suppliers.get(id);
    if (!existingSupplier) return undefined;
    
    const updatedSupplier: Supplier = { ...existingSupplier, ...supplier };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }
  
  // Supplier Products implementation
  async getSupplierProducts(supplierId: number): Promise<SupplierProduct[]> {
    return Array.from(this.supplierProducts.values())
      .filter(sp => sp.supplierId === supplierId);
  }
  
  async createSupplierProduct(supplierProduct: InsertSupplierProduct): Promise<SupplierProduct> {
    const id = this.supplierProductId++;
    const newSupplierProduct: SupplierProduct = { ...supplierProduct, id };
    this.supplierProducts.set(id, newSupplierProduct);
    return newSupplierProduct;
  }
  
  // Supplier Orders implementation
  async getSupplierOrders(supplierId?: number): Promise<SupplierOrder[]> {
    const allOrders = Array.from(this.supplierOrders.values());
    if (supplierId !== undefined) {
      return allOrders.filter(order => order.supplierId === supplierId);
    }
    return allOrders;
  }
  
  async createSupplierOrder(order: InsertSupplierOrder): Promise<SupplierOrder> {
    const id = this.supplierOrderId++;
    const newOrder: SupplierOrder = { 
      ...order, 
      id, 
      orderDate: new Date() 
    };
    this.supplierOrders.set(id, newOrder);
    return newOrder;
  }
  
  async updateSupplierOrder(id: number, order: Partial<InsertSupplierOrder>): Promise<SupplierOrder | undefined> {
    const existingOrder = this.supplierOrders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder: SupplierOrder = { ...existingOrder, ...order };
    this.supplierOrders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Items implementation
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
  
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
  
  // Sales implementation
  async getSales(productId?: number, locationId?: number, startDate?: Date, endDate?: Date): Promise<Sale[]> {
    let sales = Array.from(this.sales.values());
    
    if (productId !== undefined) {
      sales = sales.filter(sale => sale.productId === productId);
    }
    
    if (locationId !== undefined) {
      sales = sales.filter(sale => sale.locationId === locationId);
    }
    
    if (startDate !== undefined) {
      sales = sales.filter(sale => sale.date >= startDate);
    }
    
    if (endDate !== undefined) {
      sales = sales.filter(sale => sale.date <= endDate);
    }
    
    return sales;
  }
  
  async createSale(sale: InsertSale): Promise<Sale> {
    const id = this.saleId++;
    const newSale: Sale = { 
      id,
      locationId: sale.locationId,
      productId: sale.productId,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      date: new Date()
    };
    this.sales.set(id, newSale);
    return newSale;
  }
  
  // Predictions implementation
  async getPredictions(productId?: number, locationId?: number): Promise<Prediction[]> {
    let predictions = Array.from(this.predictions.values());
    
    if (productId !== undefined) {
      predictions = predictions.filter(pred => pred.productId === productId);
    }
    
    if (locationId !== undefined) {
      predictions = predictions.filter(pred => pred.locationId === locationId);
    }
    
    return predictions;
  }
  
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.predictionId++;
    const newPrediction: Prediction = { 
      ...prediction, 
      id, 
      generatedAt: new Date() 
    };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }
  
  // Composite operations
  async getInventoryWithProducts(locationId?: number): Promise<ProductWithInventory[]> {
    const inventoryItems = await this.getInventory(locationId);
    const products = await this.getProducts();
    
    const result: ProductWithInventory[] = [];
    
    for (const inv of inventoryItems) {
      const product = products.find(p => p.id === inv.productId);
      if (!product) {
        console.error(`Product not found for inventory item: ${inv.id}`);
        continue; // Skip this item instead of throwing an error
      }
      
      let status = 'In Stock';
      if (inv.quantity <= product.reorderPoint * 0.5) {
        status = 'Low Stock';
      } else if (inv.quantity <= product.reorderPoint) {
        status = 'Medium Stock';
      }
      
      result.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        description: product.description,
        unitPrice: product.unitPrice,
        reorderPoint: product.reorderPoint,
        imageUrl: product.imageUrl,
        quantity: inv.quantity,
        locationId: inv.locationId,
        status: status as 'Low Stock' | 'Medium Stock' | 'In Stock'
      });
    }
    
    return result;
  }
  
  async getPredictionsWithProducts(locationId?: number): Promise<PredictionWithProduct[]> {
    const predictions = await this.getPredictions(undefined, locationId);
    const products = await this.getProducts();
    const inventoryItems = await this.getInventory(locationId);
    
    const result: PredictionWithProduct[] = [];
    
    for (const pred of predictions) {
      const product = products.find(p => p.id === pred.productId);
      if (!product) {
        console.error(`Product not found for prediction: ${pred.id}`);
        continue; // Skip this item instead of throwing an error
      }
      
      const inventory = inventoryItems.find(i => 
        i.productId === pred.productId && 
        (locationId === undefined || i.locationId === locationId)
      );
      
      const currentStock = inventory ? inventory.quantity : 0;
      const recommendedOrder = Math.max(0, pred.predictedDemand - currentStock);
      
      let status = 'In Stock';
      if (currentStock <= product.reorderPoint * 0.5) {
        status = 'Low Stock';
      } else if (currentStock <= product.reorderPoint) {
        status = 'Medium Stock';
      }
      
      result.push({
        id: pred.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentStock,
        predictedDemand: pred.predictedDemand,
        recommendedOrder,
        confidence: pred.confidence,
        status: status as 'Low Stock' | 'Medium Stock' | 'In Stock'
      });
    }
    
    return result;
  }
  
  async getSupplierActivity(): Promise<SupplierActivity> {
    const suppliers = await this.getSuppliers();
    const orders = await this.getSupplierOrders();
    
    // Pending responses - suppliers with pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const pending: { id: number; name: string; requestedAgo: string }[] = [];
    
    for (const order of pendingOrders) {
      const supplier = suppliers.find(s => s.id === order.supplierId);
      if (!supplier) {
        console.error(`Supplier not found for order: ${order.id}`);
        continue; // Skip this item instead of throwing an error
      }
      
      const daysAgo = Math.floor((Date.now() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24));
      pending.push({
        id: supplier.id,
        name: supplier.name,
        requestedAgo: daysAgo === 0 ? 'Today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`
      });
    }
    
    // Recent updates
    const recentOrders = orders
      .filter(order => order.status !== 'pending')
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
      .slice(0, 3);
    
    const updates: { id: number; name: string; action: string; orderNumber: string; timestamp: string }[] = [];
    
    for (const order of recentOrders) {
      const supplier = suppliers.find(s => s.id === order.supplierId);
      if (!supplier) {
        console.error(`Supplier not found for order: ${order.id}`);
        continue; // Skip this item instead of throwing an error
      }
      
      let action = '';
      switch (order.status) {
        case 'confirmed':
          action = 'confirmed delivery of order';
          break;
        case 'shipped':
          action = 'shipped order';
          break;
        case 'delivered':
          action = 'delivered order';
          break;
        case 'canceled':
          action = 'canceled order';
          break;
        default:
          action = 'updated order';
      }
      
      // Format timestamp
      const date = order.orderDate;
      const now = new Date();
      let timestamp = '';
      
      if (date.toDateString() === now.toDateString()) {
        timestamp = `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      } else if (date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
        timestamp = `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        timestamp = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
      }
      
      updates.push({
        id: supplier.id,
        name: supplier.name,
        action,
        orderNumber: `#${order.id + 4470}`,
        timestamp
      });
    }
    
    return { pending, updates };
  }
  
  async getInventoryStats(locationId?: number): Promise<{
    totalValue: number;
    lowStockCount: number;
    pendingOrders: number;
    activeSuppliers: number;
  }> {
    try {
      const inventoryItems = await this.getInventoryWithProducts(locationId);
      const orders = await this.getSupplierOrders();
      const suppliers = await this.getSuppliers();
      
      const totalValue = inventoryItems.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);
      
      const lowStockCount = inventoryItems.filter(item => 
        item.status === 'Low Stock' || item.status === 'Medium Stock').length;
      
      const pendingOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'confirmed').length;
      
      const activeSuppliers = suppliers.filter(supplier => supplier.active).length;
      
      return {
        totalValue,
        lowStockCount,
        pendingOrders,
        activeSuppliers
      };
    } catch (error) {
      console.error("Error getting inventory stats:", error);
      // Return default values instead of throwing an error
      return {
        totalValue: 0,
        lowStockCount: 0,
        pendingOrders: 0,
        activeSuppliers: 0
      };
    }
  }

  // ***** New methods for Invoice Management *****

  async getInvoices(status?: string, startDate?: Date, endDate?: Date): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());
    
    if (status) {
      invoices = invoices.filter(invoice => invoice.status === status);
    }
    
    if (startDate) {
      invoices = invoices.filter(invoice => invoice.invoiceDate >= startDate);
    }
    
    if (endDate) {
      invoices = invoices.filter(invoice => invoice.invoiceDate <= endDate);
    }
    
    return invoices;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const newInvoice: Invoice = {
      id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress || null,
      customerGstin: invoice.customerGstin || null,
      customerStateCode: invoice.customerStateCode || null,
      invoiceDate: new Date(),
      dueDate: invoice.dueDate || null,
      locationId: invoice.locationId,
      subtotal: invoice.subtotal,
      cgstAmount: invoice.cgstAmount || 0,
      sgstAmount: invoice.sgstAmount || 0,
      igstAmount: invoice.igstAmount || 0,
      totalAmount: invoice.totalAmount,
      status: invoice.status || 'unpaid',
      notes: invoice.notes || null
    };
    
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice: Invoice = { ...existingInvoice, ...invoice };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(item => item.invoiceId === invoiceId);
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.invoiceItemId++;
    const newItem: InvoiceItem = {
      id,
      invoiceId: item.invoiceId,
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      hsnCode: item.hsnCode || null,
      gstRate: item.gstRate,
      cgstRate: item.cgstRate || 0,
      sgstRate: item.sgstRate || 0,
      igstRate: item.igstRate || 0,
      amount: item.amount,
      totalAmount: item.totalAmount
    };
    
    this.invoiceItems.set(id, newItem);
    return newItem;
  }

  // ***** New methods for Price Revaluation *****

  async getPriceRevaluations(productId?: number, startDate?: Date, endDate?: Date): Promise<PriceRevaluation[]> {
    let revaluations = Array.from(this.priceRevaluations.values());
    
    if (productId) {
      revaluations = revaluations.filter(rev => rev.productId === productId);
    }
    
    if (startDate) {
      revaluations = revaluations.filter(rev => rev.revaluationDate >= startDate);
    }
    
    if (endDate) {
      revaluations = revaluations.filter(rev => rev.revaluationDate <= endDate);
    }
    
    return revaluations;
  }

  async createPriceRevaluation(revaluation: InsertPriceRevaluation): Promise<PriceRevaluation> {
    const id = this.priceRevaluationId++;
    
    // Get the product for updating its price
    const product = this.products.get(revaluation.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    
    // Create the revaluation record
    const newRevaluation: PriceRevaluation = {
      id,
      productId: revaluation.productId,
      oldPrice: revaluation.oldPrice,
      newPrice: revaluation.newPrice,
      revaluationDate: new Date(),
      reason: revaluation.reason,
      userId: revaluation.userId
    };
    
    // Update the product price
    this.updateProduct(product.id, { 
      unitPrice: revaluation.newPrice,
      lastPriceUpdate: new Date()
    });
    
    this.priceRevaluations.set(id, newRevaluation);
    return newRevaluation;
  }

  // ***** New methods for Payment Tracking *****

  async getPayments(entityType?: string, status?: string): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());
    
    if (entityType) {
      payments = payments.filter(payment => payment.entityType === entityType);
    }
    
    return payments;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const newPayment: Payment = {
      id,
      entityType: payment.entityType,
      entityId: payment.entityId,
      amount: payment.amount,
      paymentDate: new Date(),
      paymentMethod: payment.paymentMethod,
      reference: payment.reference || null,
      notes: payment.notes || null
    };
    
    // Update the payment status of the entity
    if (payment.entityType === 'invoice') {
      const invoice = this.invoices.get(payment.entityId);
      if (invoice) {
        const totalPaid = Array.from(this.payments.values())
          .filter(p => p.entityType === 'invoice' && p.entityId === payment.entityId)
          .reduce((sum, p) => sum + p.amount, 0) + payment.amount;
        
        let newStatus = 'unpaid';
        if (totalPaid >= invoice.totalAmount) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'partial';
        }
        
        this.updateInvoice(payment.entityId, { status: newStatus });
      }
    } else if (payment.entityType === 'supplierOrder') {
      const order = this.supplierOrders.get(payment.entityId);
      if (order && order.totalAmount) {
        const totalPaid = Array.from(this.payments.values())
          .filter(p => p.entityType === 'supplierOrder' && p.entityId === payment.entityId)
          .reduce((sum, p) => sum + p.amount, 0) + payment.amount;
        
        let newStatus = 'pending';
        if (totalPaid >= order.totalAmount) {
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'partial';
        }
        
        this.updateSupplierOrder(payment.entityId, { 
          paymentStatus: newStatus,
          paidAmount: totalPaid
        });
      }
    }
    
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment: Payment = { ...existingPayment, ...payment };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // ***** New composite operations *****

  async getInvoiceWithItems(invoiceId: number): Promise<InvoiceWithItems | undefined> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return undefined;
    
    const items = Array.from(this.invoiceItems.values())
      .filter(item => item.invoiceId === invoiceId);
    
    // Add product names to the items
    const itemsWithProductNames = await Promise.all(items.map(async item => {
      const product = this.products.get(item.productId);
      return {
        ...item,
        productName: product ? product.name : 'Unknown Product'
      };
    }));
    
    // Get location details
    const location = this.locations.get(invoice.locationId);
    const locationDetails = location ? {
      name: location.name,
      address: location.address,
      stateCode: location.stateCode
    } : undefined;
    
    return {
      invoice: {
        ...invoice,
        locationDetails
      },
      items: itemsWithProductNames
    };
  }

  async getPaymentSummary(): Promise<PaymentSummary> {
    const today = new Date();
    
    // Get upcoming invoice payments (to receive)
    const unpaidInvoices = Array.from(this.invoices.values())
      .filter(inv => inv.status !== 'paid' && inv.dueDate !== null);
    
    // Get upcoming supplier order payments (to pay)
    const unpaidOrders = Array.from(this.supplierOrders.values())
      .filter(order => order.paymentStatus !== 'paid' && order.paymentDueDate !== null);
    
    const upcoming = [
      ...unpaidInvoices.map(inv => ({
        id: inv.id,
        entityType: 'invoice',
        entityName: inv.customerName,
        amount: inv.totalAmount - (Array.from(this.payments.values())
          .filter(p => p.entityType === 'invoice' && p.entityId === inv.id)
          .reduce((sum, p) => sum + p.amount, 0)),
        dueDate: inv.dueDate as Date,
        daysRemaining: Math.ceil((inv.dueDate as Date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        status: inv.status
      })),
      ...unpaidOrders.map(order => ({
        id: order.id,
        entityType: 'supplierOrder',
        entityName: (() => {
          const supplier = this.suppliers.get(order.supplierId);
          return supplier ? supplier.name : 'Unknown Supplier';
        })(),
        amount: (order.totalAmount || 0) - (order.paidAmount || 0),
        dueDate: order.paymentDueDate as Date,
        daysRemaining: Math.ceil((order.paymentDueDate as Date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        status: order.paymentStatus || 'pending'
      }))
    ];
    
    // Calculate totals
    const toPay = unpaidOrders.reduce((sum, order) => sum + ((order.totalAmount || 0) - (order.paidAmount || 0)), 0);
    const toReceive = unpaidInvoices.reduce((sum, inv) => {
      const paidAmount = Array.from(this.payments.values())
        .filter(p => p.entityType === 'invoice' && p.entityId === inv.id)
        .reduce((sum, p) => sum + p.amount, 0);
      return sum + (inv.totalAmount - paidAmount);
    }, 0);
    
    // Count overdue items
    const overdueCount = upcoming.filter(item => item.daysRemaining < 0).length;
    
    return {
      upcoming,
      toPay,
      toReceive,
      overdueCount
    };
  }

  async getGstSummary(month: number, year: number): Promise<GstSummary> {
    // Define the date range for the given month and year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    // Get all invoices within the date range
    const periodInvoices = Array.from(this.invoices.values())
      .filter(inv => inv.invoiceDate >= startDate && inv.invoiceDate <= endDate);
    
    // Get all supplier orders within the date range
    const periodOrders = Array.from(this.supplierOrders.values())
      .filter(order => order.orderDate >= startDate && order.orderDate <= endDate);
    
    // Calculate outward GST (sales)
    const outwardTaxableAmount = periodInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const outwardCgst = periodInvoices.reduce((sum, inv) => sum + inv.cgstAmount, 0);
    const outwardSgst = periodInvoices.reduce((sum, inv) => sum + inv.sgstAmount, 0);
    const outwardIgst = periodInvoices.reduce((sum, inv) => sum + inv.igstAmount, 0);
    const outwardTotal = outwardCgst + outwardSgst + outwardIgst;
    
    // Calculate inward GST (purchases)
    let inwardTaxableAmount = 0;
    let inwardCgst = 0;
    let inwardSgst = 0;
    let inwardIgst = 0;
    
    // This is estimated as we don't have GST details for orders directly
    for (const order of periodOrders) {
      if (!order.totalAmount) continue;
      
      // Estimate GST amounts from order items
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id);
      
      for (const item of items) {
        const product = this.products.get(item.productId);
        const gstRate = item.gstRate || (product?.gstRate || 18); // Default to 18%
        
        const itemSubtotal = item.quantity * item.unitPrice;
        inwardTaxableAmount += itemSubtotal;
        
        // Check if supplier is inter-state
        const supplier = this.suppliers.get(order.supplierId);
        const orderLocation = await this.getLocation(1); // Default warehouse
        const isInterState = supplier?.stateCode && orderLocation?.stateCode && 
                             supplier.stateCode !== orderLocation.stateCode;
        
        if (isInterState) {
          inwardIgst += itemSubtotal * (gstRate / 100);
        } else {
          const halfGst = itemSubtotal * (gstRate / 200); // Divide by 2 for CGST/SGST
          inwardCgst += halfGst;
          inwardSgst += halfGst;
        }
      }
    }
    
    const inwardTotal = inwardCgst + inwardSgst + inwardIgst;
    
    // Calculate net tax
    const netCgst = outwardCgst - inwardCgst;
    const netSgst = outwardSgst - inwardSgst;
    const netIgst = outwardIgst - inwardIgst;
    const netTotal = netCgst + netSgst + netIgst;
    
    // Get month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      month: monthNames[month - 1],
      year,
      outwardSupplies: {
        taxableAmount: outwardTaxableAmount,
        cgst: outwardCgst,
        sgst: outwardSgst,
        igst: outwardIgst,
        total: outwardTotal
      },
      inwardSupplies: {
        taxableAmount: inwardTaxableAmount,
        cgst: inwardCgst,
        sgst: inwardSgst,
        igst: inwardIgst,
        total: inwardTotal
      },
      netTax: {
        cgst: netCgst,
        sgst: netSgst,
        igst: netIgst,
        total: netTotal
      }
    };
  }

  async calculateGstForItem(unitPrice: number, quantity: number, gstRate: number, isInterState: boolean): Promise<{
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  }> {
    const subtotal = unitPrice * quantity;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (isInterState) {
      // For inter-state sales, only IGST applies
      igst = subtotal * (gstRate / 100);
    } else {
      // For intra-state sales, CGST and SGST applies
      cgst = subtotal * (gstRate / 200); // Half rate for CGST
      sgst = subtotal * (gstRate / 200); // Half rate for SGST
    }
    
    const total = subtotal + cgst + sgst + igst;
    
    return {
      subtotal,
      cgst,
      sgst,
      igst,
      total
    };
  }
}

export const storage = new MemStorage();
