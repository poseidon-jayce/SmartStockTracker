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
  SupplierActivity
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
    
    this.initializeData();
  }
  
  private initializeData() {
    // Create default user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      fullName: 'John Doe',
      role: 'admin',
      locationId: null
    });
    
    // Create default locations
    const warehouseA = this.createLocation({
      name: 'Warehouse A',
      address: '123 Main St, Warehouse District',
      type: 'warehouse'
    });
    
    const store1 = this.createLocation({
      name: 'Store 1',
      address: '456 Retail Ave, Shopping Mall',
      type: 'store'
    });
    
    const store2 = this.createLocation({
      name: 'Store 2',
      address: '789 Commerce Blvd, Downtown',
      type: 'store'
    });
    
    // Create default suppliers
    const techDistributors = this.createSupplier({
      name: 'Tech Distributors Inc.',
      contactName: 'Sarah Johnson',
      email: 'sjohnson@techdist.example',
      phone: '555-123-4567',
      address: '100 Supplier Road, Tech Park',
      active: true
    });
    
    const globalGadget = this.createSupplier({
      name: 'Global Gadget Supply',
      contactName: 'Mike Williams',
      email: 'mike@globalgadget.example',
      phone: '555-987-6543',
      address: '200 Import Street, Harbor District',
      active: true
    });
    
    const electronicsWholesale = this.createSupplier({
      name: 'Electronics Wholesale',
      contactName: 'Emma Taylor',
      email: 'etaylor@ewholesale.example',
      phone: '555-456-7890',
      address: '300 Bulk Avenue, Industrial Zone',
      active: true
    });
    
    // Create products
    const headphones = this.createProduct({
      name: 'Premium Wireless Headphones',
      sku: 'WH-1000XM5',
      barcode: '1234567890123',
      category: 'Electronics',
      description: 'High-quality wireless headphones with noise cancellation',
      unitPrice: 299.99,
      reorderPoint: 15,
      imageUrl: null
    });
    
    const smarthub = this.createProduct({
      name: 'Smart Home Hub',
      sku: 'SHH-200',
      barcode: '2345678901234',
      category: 'Smart Home',
      description: 'Central hub for controlling smart home devices',
      unitPrice: 129.99,
      reorderPoint: 10,
      imageUrl: null
    });
    
    const camera = this.createProduct({
      name: '4K Action Camera',
      sku: 'AC-4K-PRO',
      barcode: '3456789012345',
      category: 'Photography',
      description: 'Professional 4K action camera with waterproof case',
      unitPrice: 249.99,
      reorderPoint: 8,
      imageUrl: null
    });
    
    const watch = this.createProduct({
      name: 'Fitness Tracker Watch',
      sku: 'FTW-350',
      barcode: '4567890123456',
      category: 'Wearables',
      description: 'Advanced fitness tracker with heart rate monitoring',
      unitPrice: 89.99,
      reorderPoint: 20,
      imageUrl: null
    });
    
    const tablet = this.createProduct({
      name: 'Tablet Pro 11"',
      sku: 'TP-11-2023',
      barcode: '5678901234567',
      category: 'Electronics',
      description: '11" professional tablet with stylus support',
      unitPrice: 499.99,
      reorderPoint: 15,
      imageUrl: null
    });
    
    // Create inventory
    this.createInventory({
      productId: headphones.id,
      locationId: warehouseA.id,
      quantity: 5
    });
    
    this.createInventory({
      productId: smarthub.id,
      locationId: warehouseA.id,
      quantity: 12
    });
    
    this.createInventory({
      productId: camera.id,
      locationId: warehouseA.id,
      quantity: 3
    });
    
    this.createInventory({
      productId: watch.id,
      locationId: warehouseA.id,
      quantity: 45
    });
    
    this.createInventory({
      productId: tablet.id,
      locationId: warehouseA.id,
      quantity: 22
    });
    
    // Create supplier products
    this.createSupplierProduct({
      supplierId: techDistributors.id,
      productId: headphones.id,
      leadTime: 7,
      unitCost: 199.99
    });
    
    this.createSupplierProduct({
      supplierId: techDistributors.id,
      productId: smarthub.id,
      leadTime: 5,
      unitCost: 79.99
    });
    
    this.createSupplierProduct({
      supplierId: globalGadget.id,
      productId: camera.id,
      leadTime: 10,
      unitCost: 159.99
    });
    
    this.createSupplierProduct({
      supplierId: electronicsWholesale.id,
      productId: watch.id,
      leadTime: 3,
      unitCost: 49.99
    });
    
    this.createSupplierProduct({
      supplierId: electronicsWholesale.id,
      productId: tablet.id,
      leadTime: 7,
      unitCost: 349.99
    });
    
    // Create sales (for trend data)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      
      // Headphones sales - trending up
      if (i % 3 === 0) {
        this.createSale({
          locationId: store1.id,
          productId: headphones.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: 299.99,
          date
        });
      }
      
      // Smart Hub sales - consistent
      if (i % 2 === 0) {
        this.createSale({
          locationId: store1.id,
          productId: smarthub.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          unitPrice: 129.99,
          date
        });
      }
      
      // Camera sales - seasonal
      if (i > 20 && i % 2 === 0) {
        this.createSale({
          locationId: store2.id,
          productId: camera.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          unitPrice: 249.99,
          date
        });
      }
      
      // Watch sales - very popular
      this.createSale({
        locationId: store2.id,
        productId: watch.id,
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: 89.99,
        date
      });
      
      // Tablet sales - moderate
      if (i % 4 === 0) {
        this.createSale({
          locationId: store1.id,
          productId: tablet.id,
          quantity: 1,
          unitPrice: 499.99,
          date
        });
      }
    }
    
    // Create initial predictions
    this.createPrediction({
      productId: headphones.id,
      locationId: warehouseA.id,
      predictedDemand: 30,
      confidence: 0.82,
      period: '30days'
    });
    
    this.createPrediction({
      productId: smarthub.id,
      locationId: warehouseA.id,
      predictedDemand: 28,
      confidence: 0.75,
      period: '30days'
    });
    
    this.createPrediction({
      productId: camera.id,
      locationId: warehouseA.id,
      predictedDemand: 18,
      confidence: 0.68,
      period: '30days'
    });
    
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
    const newUser: User = { ...user, id };
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
    const newProduct: Product = { ...product, id };
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
    const newLocation: Location = { ...location, id };
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
      ...inventory, 
      id, 
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
    const newSupplier: Supplier = { ...supplier, id };
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
      ...sale, 
      id, 
      date: sale.date || new Date() 
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
    
    return inventoryItems.map(inv => {
      const product = products.find(p => p.id === inv.productId);
      if (!product) throw new Error(`Product not found for inventory item: ${inv.id}`);
      
      let status = 'In Stock';
      if (inv.quantity <= product.reorderPoint * 0.5) {
        status = 'Low Stock';
      } else if (inv.quantity <= product.reorderPoint) {
        status = 'Medium Stock';
      }
      
      return {
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
      };
    });
  }
  
  async getPredictionsWithProducts(locationId?: number): Promise<PredictionWithProduct[]> {
    const predictions = await this.getPredictions(undefined, locationId);
    const products = await this.getProducts();
    const inventoryItems = await this.getInventory(locationId);
    
    return predictions.map(pred => {
      const product = products.find(p => p.id === pred.productId);
      if (!product) throw new Error(`Product not found for prediction: ${pred.id}`);
      
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
      
      return {
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
      };
    });
  }
  
  async getSupplierActivity(): Promise<SupplierActivity> {
    const suppliers = await this.getSuppliers();
    const orders = await this.getSupplierOrders();
    
    // Pending responses - suppliers with pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const pending = pendingOrders.map(order => {
      const supplier = suppliers.find(s => s.id === order.supplierId);
      if (!supplier) throw new Error(`Supplier not found for order: ${order.id}`);
      
      const daysAgo = Math.floor((Date.now() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: supplier.id,
        name: supplier.name,
        requestedAgo: daysAgo === 0 ? 'Today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`
      };
    });
    
    // Recent updates
    const recentOrders = orders
      .filter(order => order.status !== 'pending')
      .sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime())
      .slice(0, 3);
    
    const updates = recentOrders.map(order => {
      const supplier = suppliers.find(s => s.id === order.supplierId);
      if (!supplier) throw new Error(`Supplier not found for order: ${order.id}`);
      
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
      
      return {
        id: supplier.id,
        name: supplier.name,
        action,
        orderNumber: `#${order.id + 4470}`,
        timestamp
      };
    });
    
    return { pending, updates };
  }
  
  async getInventoryStats(locationId?: number): Promise<{
    totalValue: number;
    lowStockCount: number;
    pendingOrders: number;
    activeSuppliers: number;
  }> {
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
  }
}

export const storage = new MemStorage();
