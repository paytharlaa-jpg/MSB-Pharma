export type UserRole = "SUPER_ADMIN" | "SALES" | "ACCOUNTS" | "INVENTORY";

export type PermissionAction =
  | "view_enquiries"
  | "manage_enquiries"
  | "view_products"
  | "manage_products"
  | "import_products"
  | "view_inventory"
  | "adjust_stock"
  | "view_customers"
  | "manage_customers"
  | "view_suppliers"
  | "manage_suppliers"
  | "view_po"
  | "manage_po"
  | "view_grn"
  | "manage_grn"
  | "view_quotations"
  | "manage_quotations"
  | "view_invoices"
  | "manage_invoices"
  | "record_payments"
  | "view_challans"
  | "manage_challans"
  | "view_reports"
  | "export_data"
  | "view_audit_logs"
  | "manage_users"
  | "manage_settings";

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  SUPER_ADMIN: [
    "view_enquiries",
    "manage_enquiries",
    "view_products",
    "manage_products",
    "import_products",
    "view_inventory",
    "adjust_stock",
    "view_customers",
    "manage_customers",
    "view_suppliers",
    "manage_suppliers",
    "view_po",
    "manage_po",
    "view_grn",
    "manage_grn",
    "view_quotations",
    "manage_quotations",
    "view_invoices",
    "manage_invoices",
    "record_payments",
    "view_challans",
    "manage_challans",
    "view_reports",
    "export_data",
    "view_audit_logs",
    "manage_users",
    "manage_settings",
  ],
  SALES: [
    "view_enquiries",
    "manage_enquiries",
    "view_products",
    "view_inventory",
    "view_customers",
    "manage_customers",
    "view_quotations",
    "manage_quotations",
    "view_reports",
    "export_data",
  ],
  ACCOUNTS: [
    "view_products",
    "view_customers",
    "view_suppliers",
    "view_po",
    "view_quotations",
    "view_invoices",
    "manage_invoices",
    "record_payments",
    "view_challans",
    "view_reports",
    "export_data",
  ],
  INVENTORY: [
    "view_products",
    "view_inventory",
    "adjust_stock",
    "view_suppliers",
    "view_po",
    "manage_po",
    "view_grn",
    "manage_grn",
    "view_challans",
    "manage_challans",
    "view_reports",
    "export_data",
  ],
};

export function hasPermission(role: UserRole | string, action: PermissionAction): boolean {
  const allowed = ROLE_PERMISSIONS[role as UserRole];
  if (!allowed) return false;
  return allowed.includes(action);
}

export function canAccessModule(role: UserRole | string, moduleName: string): boolean {
  if (role === "SUPER_ADMIN") return true;

  switch (moduleName) {
    case "enquiries":
      return role === "SALES";
    case "inventory":
      return role === "INVENTORY" || role === "SALES";
    case "products":
      return true; // All staff can view products
    case "customers":
      return role === "SALES" || role === "ACCOUNTS";
    case "suppliers":
      return role === "INVENTORY" || role === "ACCOUNTS";
    case "purchasing":
      return role === "INVENTORY" || role === "ACCOUNTS";
    case "grn":
      return role === "INVENTORY";
    case "quotations":
      return role === "SALES" || role === "ACCOUNTS";
    case "invoices":
      return role === "ACCOUNTS";
    case "challans":
      return role === "INVENTORY" || role === "ACCOUNTS";
    case "reports":
      return true;
    case "settings":
    case "audit-logs":
    case "users":
      return role === "SUPER_ADMIN";
    default:
      return false;
  }
}
