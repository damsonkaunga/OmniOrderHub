export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
}

export interface DriverInfo {
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  avatar: string;
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  etaMinutes: number;
  distanceKm: number;
}

export interface TrackingMilestone {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  locationName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  driverInfo?: DriverInfo;
  trackingTimeline: TrackingMilestone[];
  createdAt: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  deliveryPin: string;
  notes?: string;
  encryptedDataHash: string;
  encryptedPii: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  reserved: number;
  minThreshold: number;
  incomingStock: number;
  unit: string;
  weightKg: number;
  imageUrl: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked: string;
  supplier: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateAgainstUSD: number;
  name: string;
  locale: string;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'pt' | 'zh';

export interface EmailNotification {
  id: string;
  orderId?: string;
  orderNumber?: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: 'order_confirmation' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'weekly_insights' | 'low_stock' | '2fa_alert';
  htmlContent: string;
  sentAt: string;
  status: 'delivered' | 'sent' | 'opened';
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  category: 'order' | 'inventory' | 'weekly_insight' | 'security';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  meta?: Record<string, any>;
}

export interface WeeklySalesInsight {
  period: string;
  generatedAt: string;
  summary: string;
  keyTakeaways: string[];
  topRevenueCategory: string;
  growthRatePct: number;
  inventoryAlerts: string[];
  recommendedActions: string[];
  isAiGenerated: boolean;
}

export interface SalesReportMetrics {
  grossRevenue: number;
  netProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  activeDeliveries: number;
  inventoryHealthScore: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  salesByCountry: { country: string; orders: number; revenue: number; flag: string }[];
  topSellingItems: { name: string; sku: string; unitsSold: number; revenue: number }[];
  orderStatusCounts: Record<OrderStatus, number>;
}

export interface SecurityAuditRecord {
  id: string;
  action: string;
  user: string;
  ipAddress: string;
  timestamp: string;
  encryptionStandard: string;
  details: string;
  verified: boolean;
}
