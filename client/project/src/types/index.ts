export interface Category {
  id: string;
  title: string;
  FournisseurId: string;
  imgSrc: string;
  subtitle: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface Fournisseur {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  image: string;
  matriculeFiscale: string;
  openingHours: string;
  useUserAddress: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  title: string;
  prixHTVA: number;
  tva: number;
  Tags: string[];
  prixTTC: number;
  categoryId: string;
  FournisseurId: string;
  fournisseurName?: string;
  imageURL: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  stockQuantity: number;
  discount: number;
  unit: string;
  review: Review[];
  rating?: number;
  feature: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  cin: string;
  imageUrl: string;
  status: 'Active' | 'Inactive';
  role: 'client' | 'admin' | 'fournisseur';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  promoCode?: string;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
}

export interface DeliveryAddress {
  street: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface MasterOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  
  // Totaux globaux
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;
  
  // Informations de commande
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  promoCode: string; // Changed from optional to required string (can be empty)
  orderNotes: string; // Changed from optional to required string (can be empty)
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  
  // Relations
  subOrderIds: string[];
  fournisseurCount: number;
}

export interface SubOrder {
  id: string;
  masterOrderId: string;
  fournisseurId: string;
  fournisseurName: string;
  
  // Informations client (dupliquées pour faciliter les requêtes)
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  
  // Produits de ce fournisseur uniquement
  items: OrderItem[];
  
  // Totaux pour ce fournisseur
  subtotal: number;
  deliveryFee: number;
  tax: number;
  promoDiscount: number;
  total: number;
  
  // Statut spécifique au fournisseur
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Informations de livraison (dupliquées)
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  orderNotes: string; // Changed from optional to required string (can be empty)
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
}