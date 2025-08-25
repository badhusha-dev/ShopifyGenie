interface TranslationKeys {
  // Navigation
  'nav.dashboard': string;
  'nav.inventory': string;
  'nav.customers': string;
  'nav.subscriptions': string;
  'nav.loyalty': string;
  'nav.reports': string;
  'nav.customerPortal': string;
  'nav.aiInsights': string;
  'nav.aiRecommendations': string;
  'nav.advancedInventory': string;
  'nav.vendorManagement': string;
  'nav.userManagement': string;
  'nav.systemSettings': string;
  'nav.integrations': string;
  
  // Common actions
  'common.add': string;
  'common.edit': string;
  'common.delete': string;
  'common.save': string;
  'common.cancel': string;
  'common.close': string;
  'common.search': string;
  'common.filter': string;
  'common.export': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.warning': string;
  'common.info': string;
  
  // Dashboard
  'dashboard.title': string;
  'dashboard.subtitle': string;
  'dashboard.totalProducts': string;
  'dashboard.lowStockItems': string;
  'dashboard.totalOrders': string;
  'dashboard.totalRevenue': string;
  'dashboard.recentActivity': string;
  
  // Inventory
  'inventory.title': string;
  'inventory.addProduct': string;
  'inventory.productName': string;
  'inventory.sku': string;
  'inventory.stock': string;
  'inventory.price': string;
  'inventory.category': string;
  'inventory.lowStock': string;
  
  // Notifications
  'notifications.title': string;
  'notifications.markAllRead': string;
  'notifications.noNotifications': string;
  'notifications.lowStock': string;
  'notifications.newOrder': string;
  'notifications.systemAlert': string;
  
  // System settings
  'system.title': string;
  'system.generalSettings': string;
  'system.notificationSettings': string;
  'system.securitySettings': string;
  'system.auditLogs': string;
  'system.permissions': string;
  
  // Integrations
  'integrations.title': string;
  'integrations.paymentGateway': string;
  'integrations.emailMarketing': string;
  'integrations.smsNotifications': string;
  'integrations.accounting': string;
  'integrations.configure': string;
  'integrations.test': string;
  'integrations.enabled': string;
  'integrations.disabled': string;
}

type Translations = {
  [K in keyof TranslationKeys]: TranslationKeys[K];
};

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.inventory': 'Inventory',
    'nav.customers': 'Customers', 
    'nav.subscriptions': 'Subscriptions',
    'nav.loyalty': 'Loyalty',
    'nav.reports': 'Reports',
    'nav.customerPortal': 'Customer Portal',
    'nav.aiInsights': 'AI Insights',
    'nav.aiRecommendations': 'AI Recommendations',
    'nav.advancedInventory': 'Advanced Inventory',
    'nav.vendorManagement': 'Vendor Management',
    'nav.userManagement': 'User Management',
    'nav.systemSettings': 'System Settings',
    'nav.integrations': 'Integrations',
    
    // Common actions
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    
    // Dashboard
    'dashboard.title': 'Dashboard Overview',
    'dashboard.subtitle': 'Welcome back to your inventory management system',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.lowStockItems': 'Low Stock Items',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Inventory
    'inventory.title': 'Inventory Management',
    'inventory.addProduct': 'Add Product',
    'inventory.productName': 'Product Name',
    'inventory.sku': 'SKU',
    'inventory.stock': 'Stock',
    'inventory.price': 'Price',
    'inventory.category': 'Category',
    'inventory.lowStock': 'Low Stock',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark All Read',
    'notifications.noNotifications': 'No notifications',
    'notifications.lowStock': 'Low Stock Alert',
    'notifications.newOrder': 'New Order',
    'notifications.systemAlert': 'System Alert',
    
    // System settings
    'system.title': 'System Settings',
    'system.generalSettings': 'General Settings',
    'system.notificationSettings': 'Notification Settings',
    'system.securitySettings': 'Security Settings',
    'system.auditLogs': 'Audit Logs',
    'system.permissions': 'Permissions',
    
    // Integrations
    'integrations.title': 'Integrations',
    'integrations.paymentGateway': 'Payment Gateway',
    'integrations.emailMarketing': 'Email Marketing',
    'integrations.smsNotifications': 'SMS Notifications',
    'integrations.accounting': 'Accounting',
    'integrations.configure': 'Configure',
    'integrations.test': 'Test Connection',
    'integrations.enabled': 'Enabled',
    'integrations.disabled': 'Disabled'
  } as Translations,
  
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.inventory': 'Inventario',
    'nav.customers': 'Clientes',
    'nav.subscriptions': 'Suscripciones',
    'nav.loyalty': 'Lealtad',
    'nav.reports': 'Reportes',
    'nav.customerPortal': 'Portal del Cliente',
    'nav.aiInsights': 'Perspectivas IA',
    'nav.aiRecommendations': 'Recomendaciones IA',
    'nav.advancedInventory': 'Inventario Avanzado',
    'nav.vendorManagement': 'Gestión de Proveedores',
    'nav.userManagement': 'Gestión de Usuarios',
    'nav.systemSettings': 'Configuración del Sistema',
    'nav.integrations': 'Integraciones',
    
    // Common actions
    'common.add': 'Agregar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',
    
    // Dashboard
    'dashboard.title': 'Resumen del Panel',
    'dashboard.subtitle': 'Bienvenido de vuelta a tu sistema de gestión de inventario',
    'dashboard.totalProducts': 'Total de Productos',
    'dashboard.lowStockItems': 'Artículos con Poco Stock',
    'dashboard.totalOrders': 'Total de Pedidos',
    'dashboard.totalRevenue': 'Ingresos Totales',
    'dashboard.recentActivity': 'Actividad Reciente',
    
    // Inventory
    'inventory.title': 'Gestión de Inventario',
    'inventory.addProduct': 'Agregar Producto',
    'inventory.productName': 'Nombre del Producto',
    'inventory.sku': 'SKU',
    'inventory.stock': 'Stock',
    'inventory.price': 'Precio',
    'inventory.category': 'Categoría',
    'inventory.lowStock': 'Poco Stock',
    
    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.markAllRead': 'Marcar Todo como Leído',
    'notifications.noNotifications': 'Sin notificaciones',
    'notifications.lowStock': 'Alerta de Poco Stock',
    'notifications.newOrder': 'Nuevo Pedido',
    'notifications.systemAlert': 'Alerta del Sistema',
    
    // System settings
    'system.title': 'Configuración del Sistema',
    'system.generalSettings': 'Configuración General',
    'system.notificationSettings': 'Configuración de Notificaciones',
    'system.securitySettings': 'Configuración de Seguridad',
    'system.auditLogs': 'Registros de Auditoría',
    'system.permissions': 'Permisos',
    
    // Integrations
    'integrations.title': 'Integraciones',
    'integrations.paymentGateway': 'Pasarela de Pago',
    'integrations.emailMarketing': 'Marketing por Email',
    'integrations.smsNotifications': 'Notificaciones SMS',
    'integrations.accounting': 'Contabilidad',
    'integrations.configure': 'Configurar',
    'integrations.test': 'Probar Conexión',
    'integrations.enabled': 'Habilitado',
    'integrations.disabled': 'Deshabilitado'
  } as Translations,
  
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.inventory': 'Inventaire',
    'nav.customers': 'Clients',
    'nav.subscriptions': 'Abonnements',
    'nav.loyalty': 'Fidélité',
    'nav.reports': 'Rapports',
    'nav.customerPortal': 'Portail Client',
    'nav.aiInsights': 'Insights IA',
    'nav.aiRecommendations': 'Recommandations IA',
    'nav.advancedInventory': 'Inventaire Avancé',
    'nav.vendorManagement': 'Gestion des Fournisseurs',
    'nav.userManagement': 'Gestion des Utilisateurs',
    'nav.systemSettings': 'Paramètres Système',
    'nav.integrations': 'Intégrations',
    
    // Common actions
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',
    
    // Dashboard
    'dashboard.title': 'Aperçu du Tableau de Bord',
    'dashboard.subtitle': 'Bienvenue dans votre système de gestion d\'inventaire',
    'dashboard.totalProducts': 'Total des Produits',
    'dashboard.lowStockItems': 'Articles en Rupture',
    'dashboard.totalOrders': 'Total des Commandes',
    'dashboard.totalRevenue': 'Chiffre d\'Affaires Total',
    'dashboard.recentActivity': 'Activité Récente',
    
    // Inventory
    'inventory.title': 'Gestion d\'Inventaire',
    'inventory.addProduct': 'Ajouter un Produit',
    'inventory.productName': 'Nom du Produit',
    'inventory.sku': 'SKU',
    'inventory.stock': 'Stock',
    'inventory.price': 'Prix',
    'inventory.category': 'Catégorie',
    'inventory.lowStock': 'Stock Faible',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Marquer Tout comme Lu',
    'notifications.noNotifications': 'Aucune notification',
    'notifications.lowStock': 'Alerte de Stock Faible',
    'notifications.newOrder': 'Nouvelle Commande',
    'notifications.systemAlert': 'Alerte Système',
    
    // System settings
    'system.title': 'Paramètres Système',
    'system.generalSettings': 'Paramètres Généraux',
    'system.notificationSettings': 'Paramètres de Notification',
    'system.securitySettings': 'Paramètres de Sécurité',
    'system.auditLogs': 'Journaux d\'Audit',
    'system.permissions': 'Permissions',
    
    // Integrations
    'integrations.title': 'Intégrations',
    'integrations.paymentGateway': 'Passerelle de Paiement',
    'integrations.emailMarketing': 'Marketing par Email',
    'integrations.smsNotifications': 'Notifications SMS',
    'integrations.accounting': 'Comptabilité',
    'integrations.configure': 'Configurer',
    'integrations.test': 'Tester la Connexion',
    'integrations.enabled': 'Activé',
    'integrations.disabled': 'Désactivé'
  } as Translations
};

type SupportedLocale = keyof typeof translations;

class I18n {
  private currentLocale: SupportedLocale = 'en';
  private listeners: Array<() => void> = [];

  constructor() {
    // Load locale from localStorage or browser
    const savedLocale = localStorage.getItem('locale') as SupportedLocale;
    if (savedLocale && translations[savedLocale]) {
      this.currentLocale = savedLocale;
    } else {
      // Try to get from browser language
      const browserLang = navigator.language.split('-')[0] as SupportedLocale;
      if (translations[browserLang]) {
        this.currentLocale = browserLang;
      }
    }
  }

  getCurrentLocale(): SupportedLocale {
    return this.currentLocale;
  }

  setLocale(locale: SupportedLocale): void {
    if (translations[locale]) {
      this.currentLocale = locale;
      localStorage.setItem('locale', locale);
      this.notifyListeners();
    }
  }

  t<K extends keyof TranslationKeys>(key: K): string {
    return translations[this.currentLocale][key] || translations.en[key] || key;
  }

  getAvailableLocales(): Array<{ code: SupportedLocale; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' }
    ];
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const i18n = new I18n();
export type { SupportedLocale, TranslationKeys };