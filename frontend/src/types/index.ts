export interface Author {
  id: number;
  name: string;
  profile_picture?: string | null;
  bio?: string | null;
  email?: string | null;
  website?: string | null;
  books_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Publisher {
  id: number;
  name: string;
  logo_url?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  books_count?: number;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: number | null;
  parent_name?: string | null;
  books_count?: number;
  subcategories?: Category[];
  created_at?: string;
}

export interface BookAuthorBrief {
  id: number;
  name: string;
  profile_picture?: string | null;
}

export interface Book {
  id: number;
  title: string;
  subtitle?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  cover_image?: string | null;
  additional_images?: string[];

  isbn?: string | null;
  edition?: string | null;
  publication_year?: number | null;
  publisher_id?: number | null;
  publisher_name?: string | null;
  pages?: number | null;
  language: string;
  book_format: string;
  subject?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  subcategory_id?: number | null;
  subcategory_name?: string | null;

  selling_price: number;
  mrp: number;
  currency: string;

  is_draft: boolean;
  is_featured: boolean;
  availability_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  seo_title?: string | null;
  seo_description?: string | null;

  authors: BookAuthorBrief[];
  created_at: string;
  updated_at: string;
}

export interface BookFormData {
  title: string;
  subtitle?: string;
  short_description?: string;
  full_description?: string;
  cover_image?: string;
  additional_images?: string[];

  isbn?: string;
  edition?: string;
  publication_year?: number;
  publisher_id?: number;
  pages?: number;
  language: string;
  book_format: string;
  subject?: string;
  category_id?: number;
  subcategory_id?: number;

  selling_price: number;
  mrp: number;
  currency: string;

  is_draft: boolean;
  is_featured: boolean;
  availability_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  seo_title?: string;
  seo_description?: string;
  author_ids: number[];
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  file_size: number;
  mime_type: string;
  category: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  action_type: string;
  entity_type: string;
  entity_id?: number | null;
  entity_name?: string | null;
  description: string;
  ip_address?: string | null;
  timestamp: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'super-admin' | 'content_manager' | 'order_manager' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string | null;
}

export interface DashboardStats {
  total_books: number;
  published_books: number;
  draft_books: number;
  total_authors: number;
  total_categories: number;
  total_publishers: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  processing_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  recently_added_books: Book[];
  featured_books: Book[];
  recent_activity: ActivityLog[];
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  orders_count: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface TopSellingBook {
  book_id: number;
  title: string;
  cover_image?: string | null;
  units_sold: number;
  total_revenue: number;
}

export interface DashboardAnalytics {
  monthly_revenue: MonthlyRevenueItem[];
  order_status_distribution: OrderStatusCount[];
  top_selling_books: TopSellingBook[];
  recent_orders: Order[];
}

export interface LandingPageContent {
  id?: number;
  hero_heading: string;
  hero_description: string;
  hero_image?: string | null;
  featured_book_ids: number[];
  latest_publications: number[];
  popular_categories: number[];
  about_title: string;
  about_description: string;
  about_stats: { label: string; value: string }[];
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  footer_text: string;
  updated_at?: string;
}

export interface SiteSettings {
  id?: number;
  company_name: string;
  logo_url?: string | null;
  description: string;
  contact_email: string;
  phone: string;
  address: string;
  social_links: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  currency: string;
  catalogue_download_url?: string | null;
  maintenance_mode: boolean;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  book_id: number;
  title: string;
  price: number;
  quantity: number;
  cover_image?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city?: string;
  state?: string;
  pincode?: string;
  items_json: string;
  items?: OrderItem[];
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface PaginatedOrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GlobalSearchResults {
  query: string;
  books: Book[];
  authors: { id: number; name: string; profile_picture?: string | null; books_count: number }[];
  publishers: { id: number; name: string; logo_url?: string | null; books_count: number }[];
  orders: Order[];
}

export type NavigationTab = 
  | 'dashboard'
  | 'books'
  | 'authors'
  | 'categories'
  | 'publishers'
  | 'media'
  | 'landing'
  | 'settings'
  | 'orders'
  | 'users';
