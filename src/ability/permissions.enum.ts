export enum Permissions {
  // tenant
  tenant_management_read = 'tenant_management_read',
  tenant_management_create = 'tenant_management_create',
  tenant_management_update = 'tenant_management_update',
  tenant_management_show = 'tenant_management_show',
  tenant_management_delete = 'tenant_management_delete',
  // user
  user_management_read = 'user_management_read',
  user_management_create = 'user_management_create',
  user_management_update = 'user_management_update',
  user_management_show = 'user_management_show',
  user_management_delete = 'user_management_delete',
  // role
  role_management_read = 'role_management_read',
  role_management_create = 'role_management_create',
  role_management_update = 'role_management_update',
  role_management_show = 'role_management_show',
  role_management_delete = 'role_management_delete',
  // CRM
  crm_manage = 'crm_manage',
  crm_create = 'crm_create',
  crm_read = 'crm_read',
  crm_update = 'crm_update',
  crm_delete = 'crm_delete',

  // Customer
  customer_manage = 'customer_manage',
  customer_create = 'customer_create',
  customer_read = 'customer_read',
  customer_update = 'customer_update',
  customer_delete = 'customer_delete',
  customer_view = 'customer_view',

  // vendor
  vendor_manage = 'vendor_manage',
  vendor_create = 'vendor_create',
  vendor_read = 'vendor_read',
  vendor_update = 'vendor_update',
  vendor_delete = 'vendor_delete',
  vendor_view = 'vendor_view',

  // Accounting
  accounting_manage = 'accounting_manage',
  accounting_create = 'accounting_create',
  accounting_read = 'accounting_read',
  accounting_update = 'accounting_update',
  accounting_delete = 'accounting_delete',
}
