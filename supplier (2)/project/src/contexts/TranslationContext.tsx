import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation Context
export const TranslationContext = createContext<{
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (key: string) => string;
}>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string) => key
});

export const useTranslation = () => useContext(TranslationContext);

// Translation dictionaries
const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.orders': 'Commandes',
    'nav.products': 'Produits',
    'nav.categories': 'Catégories',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',

    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.welcome': 'Bienvenue sur votre tableau de bord',
    'dashboard.welcome_back': 'Bienvenue',
    'dashboard.business_overview': 'Voici un aperçu complet de votre activité avec des analyses avancées.',
    'dashboard.refresh': 'Actualiser',
    'dashboard.estimated_delivery_time': 'Temps de livraison estimé',
    'dashboard.delivery_description': 'Affiché aux clients sur les fiches produits et lors du paiement.',
    'dashboard.minutes': 'minutes',
    'dashboard.save': 'Enregistrer',
    'dashboard.sales_overview': 'Aperçu des ventes (6 derniers mois)',
    'dashboard.monthly_orders': 'Commandes mensuelles (6 derniers mois)',
    'dashboard.recent_orders': 'Commandes Récentes',
    'dashboard.no_recent_orders': 'Aucune commande récente trouvée',
    'dashboard.order_id': 'ID Commande',
    'dashboard.customer': 'Client',
    'dashboard.total': 'Total',
    'dashboard.status': 'Statut',
    'dashboard.payment': 'Paiement',
    'dashboard.date': 'Date',
    'dashboard.stats': 'Statistiques',
    'dashboard.total_orders': 'Total Commandes',
    'dashboard.pending_orders': 'Commandes en Attente',
    'dashboard.today_orders': 'Commandes Aujourd\'hui',

    // Orders
    'orders.title': 'Gestion des Commandes',
    'orders.manage_description': 'Gérer les commandes de vos produits',
    'orders.all_orders': 'Toutes les Commandes',
    'orders.pending': 'En Attente',
    'orders.confirmed': 'Confirmée',
    'orders.preparing': 'En Préparation',
    'orders.ready': 'Prête',
    'orders.delivered': 'Livrée',
    'orders.cancelled': 'Annulée',
    'orders.customer': 'Client',
    'orders.total': 'Total',
    'orders.status': 'Statut',
    'orders.date': 'Date',
    'orders.actions': 'Actions',
    'orders.view_details': 'Voir Détails',
    'orders.mark_ready': 'Marquer Prête',
    'orders.mark_delivered': 'Marquer Livrée',
    'orders.cancel_order': 'Annuler Commande',
    'orders.no_orders': 'Aucune commande trouvée',
    'orders.create_supplier_profile': 'Créez d\'abord votre profil fournisseur',
    'orders.supplier_profile_description': 'Vous devez configurer votre profil fournisseur avant de pouvoir voir les commandes.',
    'orders.go_to_supplier_profile': 'Aller au profil fournisseur',
    'orders.no_orders_yet': 'Aucune commande pour l\'instant',
    'orders.orders_will_appear_here': 'Les commandes de vos produits apparaîtront ici une fois que les clients commenceront à acheter.',
    'orders.search_orders': 'Rechercher des commandes',
    'orders.search_placeholder': 'Rechercher par nom de client, email ou ID de commande...',
    'orders.status_filter': 'Filtre de statut',
    'orders.all_statuses': 'Tous les statuts',
    'orders.date_filter': 'Filtre de date',
    'orders.all_time': 'Tout le temps',
    'orders.today': 'Aujourd\'hui',
    'orders.last_7_days': '7 derniers jours',
    'orders.last_30_days': '30 derniers jours',
    'orders.clear_filters': 'Effacer les filtres',
    'orders.order_details': 'Détails de la commande',
    'orders.customer_info': 'Informations client',
    'orders.delivery_address': 'Adresse de livraison',
    'orders.delivery_instructions': 'Instructions de livraison',
    'orders.order_notes': 'Notes de commande',
    'orders.update_order_status': 'Mettre à jour le statut de la commande',
    'orders.update_payment_status': 'Mettre à jour le statut de paiement',
    'orders.order_items': 'Articles de la commande',
    'orders.order_summary': 'Résumé de la commande',
    'orders.subtotal': 'Sous-total',
    'orders.delivery_fee': 'Frais de livraison',
    'orders.tax': 'Taxe',
    'orders.payment_info': 'Informations de paiement',
    'orders.payment_method': 'Méthode de paiement',
    'orders.payment_status': 'Statut de paiement',
    'orders.total_orders': 'Total des commandes',
    'orders.pending_orders': 'Commandes en attente',
    'orders.processing_orders': 'Commandes en cours',
    'orders.shipped_orders': 'Commandes expédiées',
    'orders.delivered_orders': 'Commandes livrées',

    // Products
    'products.title': 'Gestion des Produits',
    'products.add_product': 'Ajouter Produit',
    'products.edit_product': 'Modifier Produit',
    'products.delete_product': 'Supprimer Produit',
    'products.name': 'Nom',
    'products.price': 'Prix',
    'products.category': 'Catégorie',
    'products.stock': 'Stock',
    'products.status': 'Statut',
    'products.actions': 'Actions',

    // Categories
    'categories.title': 'Gestion des Catégories',
    'categories.add_category': 'Ajouter Catégorie',
    'categories.edit_category': 'Modifier Catégorie',
    'categories.delete_category': 'Supprimer Catégorie',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Tout marquer comme lu',
    'notifications.no_notifications': 'Aucune notification',
    'notifications.new_order': 'Nouvelle commande reçue',
    'notifications.order_updated': 'Commande mise à jour',

    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.close': 'Fermer',
    'common.back': 'Retour',

    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.switch_to': 'Changer de langue'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orders',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to your dashboard',
    'dashboard.welcome_back': 'Welcome back',
    'dashboard.business_overview': 'Here\'s your comprehensive business overview with advanced analytics.',
    'dashboard.refresh': 'Refresh',
    'dashboard.estimated_delivery_time': 'Estimated Delivery Time',
    'dashboard.delivery_description': 'Shown to customers on product cards and during checkout.',
    'dashboard.minutes': 'minutes',
    'dashboard.save': 'Save',
    'dashboard.sales_overview': 'Sales Overview (Last 6 Months)',
    'dashboard.monthly_orders': 'Monthly Orders (Last 6 Months)',
    'dashboard.recent_orders': 'Recent Orders',
    'dashboard.no_recent_orders': 'No recent orders found',
    'dashboard.order_id': 'Order ID',
    'dashboard.customer': 'Customer',
    'dashboard.total': 'Total',
    'dashboard.status': 'Status',
    'dashboard.payment': 'Payment',
    'dashboard.date': 'Date',
    'dashboard.stats': 'Statistics',
    'dashboard.total_orders': 'Total Orders',
    'dashboard.pending_orders': 'Pending Orders',
    'dashboard.today_orders': 'Today\'s Orders',

    // Orders
    'orders.title': 'Order Management',
    'orders.manage_description': 'Manage orders for your products',
    'orders.all_orders': 'All Orders',
    'orders.pending': 'Pending',
    'orders.confirmed': 'Confirmed',
    'orders.preparing': 'Preparing',
    'orders.ready': 'Ready',
    'orders.delivered': 'Delivered',
    'orders.cancelled': 'Cancelled',
    'orders.customer': 'Customer',
    'orders.total': 'Total',
    'orders.status': 'Status',
    'orders.date': 'Date',
    'orders.actions': 'Actions',
    'orders.view_details': 'View Details',
    'orders.mark_ready': 'Mark Ready',
    'orders.mark_delivered': 'Mark Delivered',
    'orders.cancel_order': 'Cancel Order',
    'orders.no_orders': 'No orders found',
    'orders.create_supplier_profile': 'Create Your Supplier Profile First',
    'orders.supplier_profile_description': 'You need to set up your supplier profile before you can view orders.',
    'orders.go_to_supplier_profile': 'Go to Supplier Profile',
    'orders.no_orders_yet': 'No Orders Yet',
    'orders.orders_will_appear_here': 'Orders for your products will appear here once customers start purchasing.',
    'orders.search_orders': 'Search Orders',
    'orders.search_placeholder': 'Search by customer name, email, or order ID...',
    'orders.status_filter': 'Status Filter',
    'orders.all_statuses': 'All Statuses',
    'orders.date_filter': 'Date Filter',
    'orders.all_time': 'All Time',
    'orders.today': 'Today',
    'orders.last_7_days': 'Last 7 Days',
    'orders.last_30_days': 'Last 30 Days',
    'orders.clear_filters': 'Clear Filters',
    'orders.order_details': 'Order Details',
    'orders.customer_info': 'Customer Information',
    'orders.delivery_address': 'Delivery Address',
    'orders.delivery_instructions': 'Delivery Instructions',
    'orders.order_notes': 'Order Notes',
    'orders.update_order_status': 'Update Order Status',
    'orders.update_payment_status': 'Update Payment Status',
    'orders.order_items': 'Order Items',
    'orders.order_summary': 'Order Summary',
    'orders.subtotal': 'Subtotal',
    'orders.delivery_fee': 'Delivery Fee',
    'orders.tax': 'Tax',
    'orders.payment_info': 'Payment Information',
    'orders.payment_method': 'Payment Method',
    'orders.payment_status': 'Payment Status',
    'orders.total_orders': 'Total Orders',
    'orders.pending_orders': 'Pending Orders',
    'orders.processing_orders': 'Processing Orders',
    'orders.shipped_orders': 'Shipped Orders',
    'orders.delivered_orders': 'Delivered Orders',

    // Products
    'products.title': 'Product Management',
    'products.add_product': 'Add Product',
    'products.edit_product': 'Edit Product',
    'products.delete_product': 'Delete Product',
    'products.name': 'Name',
    'products.price': 'Price',
    'products.category': 'Category',
    'products.stock': 'Stock',
    'products.status': 'Status',
    'products.actions': 'Actions',

    // Categories
    'categories.title': 'Category Management',
    'categories.manage_description': 'Organize your products into categories',
    'categories.add_category': 'Add Category',
    'categories.edit_category': 'Edit Category',
    'categories.delete_category': 'Delete Category',
    'categories.create_supplier_profile': 'Create Your Supplier Profile First',
    'categories.supplier_profile_description': 'You need to set up your supplier profile before you can manage categories.',
    'categories.go_to_supplier_profile': 'Go to Supplier Profile',
    'categories.no_categories_yet': 'No Categories Yet',
    'categories.create_first_category': 'Create your first category to start organizing your products.',
    'categories.create_first_category_button': 'Create First Category',
    'categories.edit_category_title': 'Edit Category',
    'categories.add_new_category': 'Add New Category',
    'categories.choose_category_type': 'Choose Category Type',
    'categories.predefined_categories': 'Predefined Categories',
    'categories.custom_category': 'Custom Category',
    'categories.select_from_predefined': 'Select from Predefined Categories',
    'categories.category_name': 'Category Name',
    'categories.enter_category_name': 'Enter category name',
    'categories.select_from_above': 'Select from predefined categories above',
    'categories.description': 'Description',
    'categories.enter_description': 'Enter category description',
    'categories.category_image_url': 'Category Image URL',
    'categories.enter_image_url': 'Enter image URL',
    'categories.update_category': 'Update Category',
    'categories.add_category_button': 'Add Category',
    'categories.edit': 'Edit',
    'categories.delete': 'Delete',
    'categories.delete_confirm': 'Are you sure you want to delete this category? This will also delete all products in this category.',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.mark_all_read': 'Mark All as Read',
    'notifications.no_notifications': 'No notifications',
    'notifications.new_order': 'New order received',
    'notifications.order_updated': 'Order updated',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.close': 'Close',
    'common.back': 'Back',

    // Language
    'language.french': 'Français',
    'language.english': 'English',
    'language.switch_to': 'Switch Language'
  }
};

// Translation Provider Component
export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'fr' | 'en'>(() => {
    // Load language from localStorage or default to French
    const saved = localStorage.getItem('supplier-language');
    return (saved === 'en' || saved === 'fr') ? saved : 'fr';
  });

  const setLanguage = (lang: 'fr' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('supplier-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  useEffect(() => {
    // Save language preference
    localStorage.setItem('supplier-language', language);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};