// Types for the Fashion Resale Dashboard

export interface PurchaseItem {
  id: string;
  brand: Brand;
  category: Category;
  subcategory?: string;
  size: Size;
  color: string;
  purchase_price: number;
  purchase_date: string;
  platform: Platform;
  condition: Condition;
  notes?: string;
  status: ItemStatus;
  sale_price?: number;
  sale_date?: string;
  created_at: string;
}

export type Brand = 
  | 'Dior'
  | 'Chanel'
  | 'Isabel Marant'
  | 'Sandro'
  | 'Maje'
  | 'Zadig & Voltaire'
  | 'Celine'
  | 'Saint Laurent'
  | 'Gucci'
  | 'Prada'
  | 'Balenciaga'
  | 'Loewe'
  | 'Hermes'
  | 'Louis Vuitton'
  | 'Burberry'
  | 'Max Mara'
  | 'Acne Studios'
  | 'The Kooples'
  | 'Ba&sh'
  | 'Jacquemus'
  | 'Other';

export type Category = 
  | 'Dress'
  | 'Top'
  | 'Jacket'
  | 'Coat'
  | 'Pants'
  | 'Skirt'
  | 'Shoes'
  | 'Bag'
  | 'Accessory';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'One Size';

export type Platform = 'Vinted' | 'Vestiaire Collective';

export type Condition = 'New with tags' | 'Like new' | 'Good' | 'Fair';

export type ItemStatus = 'In Stock' | 'Sold';

export interface DashboardStats {
  totalItems: number;
  totalInStock: number;
  totalSold: number;
  totalSpent: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
}

export interface MonthlyStats {
  month: string;
  itemsBought: number;
  itemsSold: number;
  spent: number;
  revenue: number;
  profit: number;
}

export interface BrandPerformance {
  brand: Brand;
  itemsSold: number;
  averageMargin: number;
  averageTimeToSell: number;
  totalProfit: number;
}
