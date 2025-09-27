# Company Settings Module

This module provides comprehensive company settings management functionality.

## Setup Instructions

1. **Generate Prisma Client**: After adding the CompanySettings model to the schema, run:

   ```bash
   npx prisma generate
   ```

2. **Run Database Migration**: Apply the schema changes to your database:
   ```bash
   npx prisma db push
   ```

## Model Structure

The CompanySettings model includes:

### Company Information

- `company_name`: Company name
- `company_registration_number`: Official registration number

### Address Information

- `address`: Street address
- `city`: City
- `state`: State/Province
- `country`: Country
- `zip_code`: Postal/ZIP code

### Contact Information

- `telephone`: Phone number
- `email_from_name`: Email sender name
- `system_email`: System email address

### Tax Information

- `tax_number_enabled`: Boolean flag for tax number
- `tax_number_type`: 'VAT' or 'GST'
- `tax_number_value`: Actual tax number

### Multitenancy

- `owner_id`: Owner user ID
- `workspace_id`: Workspace ID
- `user_id`: User ID

## API Endpoints

- `POST /company-settings` - Create company settings
- `GET /company-settings` - Get all company settings
- `GET /company-settings/workspace/:workspaceId` - Get settings by workspace
- `GET /company-settings/:id` - Get settings by ID
- `PATCH /company-settings/:id` - Update settings by ID
- `PATCH /company-settings/workspace/:workspaceId` - Update settings by workspace
- `DELETE /company-settings/:id` - Soft delete settings
- `DELETE /company-settings/:id/hard` - Permanently delete settings

## Usage Example

```typescript
// Create company settings
const settings = await companySettingsService.create(
  {
    company_name: 'Acme Corp',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zip_code: '10001',
    telephone: '+1-555-0123',
    system_email: 'noreply@acmecorp.com',
    tax_number_enabled: true,
    tax_number_type: 'VAT',
    tax_number_value: 'VAT123456789',
  },
  ownerId,
  workspaceId,
  userId,
);

// Update by workspace
const updatedSettings = await companySettingsService.updateByWorkspace(
  workspaceId,
  {
    company_name: 'Updated Company Name',
  },
);
```
