# Contact Management API Documentation

## Overview

The Contact Management system provides comprehensive functionality for managing contacts, groups, bulk operations, import/export, and duplicate detection with advanced search and filtering capabilities.

## Features

### 🔍 Advanced Search & Filtering
- Text search across name, phone, email, and notes
- Filter by tags, groups, email presence, notes presence
- Date range filtering (created date)
- Multiple sorting options
- Pagination support

### 🏷️ Tags & Custom Fields
- Add custom tags to contacts
- Store custom fields with flexible JSON structure
- Bulk tag operations (add/remove)
- Tag-based filtering and search

### 👥 Contact Groups
- Create and manage contact groups
- Add/remove contacts to/from groups
- Group-based filtering
- Bulk group operations

### 📊 Bulk Operations
- Delete multiple contacts
- Add/remove contacts to/from groups
- Add/remove tags in bulk
- Update fields in bulk

### 📤 Import/Export
- CSV import with validation
- Update existing contacts on import
- Export with filtering
- Error reporting for failed imports

### 🔄 Duplicate Management
- Automatic duplicate detection
- Intelligent contact merging
- Data consolidation from duplicates

## API Endpoints

### Basic Contact Operations

#### Get Contacts (with Advanced Filtering)
```http
GET /api/contacts?page=1&limit=20&search=john&tags=customer,vip&groups=group1&hasEmail=true&sortBy=name&sortOrder=asc
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of contacts per page
- `search` (string): Search term for name, phone, email, notes
- `tags` (string): Comma-separated list of tags to filter by
- `groups` (string): Comma-separated list of group IDs to filter by
- `hasEmail` (boolean): Filter contacts with/without email
- `hasNotes` (boolean): Filter contacts with/without notes
- `createdAfter` (ISO date): Filter contacts created after date
- `createdBefore` (ISO date): Filter contacts created before date
- `sortBy` (string): Sort field (name, phone, email, createdAt, updatedAt)
- `sortOrder` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact_id",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "notes": "Important customer",
      "tags": ["customer", "vip"],
      "customFields": {
        "company": "Acme Corp",
        "birthday": "1990-01-01"
      },
      "groups": [
        {
          "contactGroup": {
            "id": "group_id",
            "name": "VIP Customers",
            "color": "#ff0000"
          }
        }
      ],
      "_count": {
        "messageRecipients": 15
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "pages": 5,
  "stats": {
    "totalContacts": 100,
    "withEmail": 80,
    "withNotes": 50,
    "inGroups": 30
  }
}
```

#### Create Contact
```http
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "notes": "Important customer",
  "tags": ["customer", "vip"],
  "customFields": {
    "company": "Acme Corp",
    "birthday": "1990-01-01"
  }
}
```

#### Update Contact
```http
PUT /api/contacts/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "tags": ["customer", "premium"],
  "customFields": {
    "company": "Acme Corp",
    "birthday": "1990-01-01",
    "lastPurchase": "2023-12-01"
  }
}
```

### Advanced Search

#### Search Contacts (Autocomplete)
```http
GET /api/contacts/search?q=john&limit=10
```

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact_id",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    }
  ]
}
```

#### Get All Tags
```http
GET /api/contacts/tags
```

**Response:**
```json
{
  "tags": ["customer", "vip", "premium", "lead"]
}
```

#### Get Contact Statistics
```http
GET /api/contacts/stats
```

**Response:**
```json
{
  "totalContacts": 100,
  "withEmail": 80,
  "withNotes": 50,
  "inGroups": 30
}
```

### Bulk Operations

#### Perform Bulk Operation
```http
POST /api/contacts/bulk-operation
Content-Type: application/json

{
  "operation": "add_tags",
  "contactIds": ["contact1", "contact2", "contact3"],
  "data": {
    "tags": ["new-tag", "bulk-updated"]
  }
}
```

**Available Operations:**
- `delete`: Delete multiple contacts
- `add_to_group`: Add contacts to a group
  ```json
  {
    "operation": "add_to_group",
    "contactIds": ["contact1", "contact2"],
    "data": { "groupId": "group_id" }
  }
  ```
- `remove_from_group`: Remove contacts from a group
- `add_tags`: Add tags to contacts
  ```json
  {
    "operation": "add_tags",
    "contactIds": ["contact1", "contact2"],
    "data": { "tags": ["tag1", "tag2"] }
  }
  ```
- `remove_tags`: Remove tags from contacts
- `update_field`: Update a specific field
  ```json
  {
    "operation": "update_field",
    "contactIds": ["contact1", "contact2"],
    "data": { "field": "notes", "value": "Bulk updated notes" }
  }
  ```

**Response:**
```json
{
  "success": 3,
  "failed": 0,
  "errors": []
}
```

### Import/Export

#### Import Contacts
```http
POST /api/contacts/import
Content-Type: application/json

{
  "contacts": [
    {
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "notes": "Imported contact",
      "tags": ["imported", "customer"],
      "customFields": {
        "source": "csv_import"
      }
    }
  ],
  "updateExisting": true
}
```

**Response:**
```json
{
  "total": 100,
  "created": 80,
  "updated": 15,
  "skipped": 5,
  "errors": [
    {
      "row": 3,
      "error": "Invalid phone number format"
    }
  ]
}
```

#### Export Contacts
```http
GET /api/contacts/export?format=csv&tags=customer&hasEmail=true
```

**Query Parameters:** Same as Get Contacts filtering, plus:
- `format` (string): Export format (currently supports 'csv')

**Response:**
```json
{
  "contacts": [
    {
      "id": "contact_id",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "notes": "Important customer",
      "tags": "customer, vip",
      "customFields": "{\"company\":\"Acme Corp\"}",
      "groups": "VIP Customers, Premium",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "format": "csv",
  "exportedAt": "2023-12-01T10:00:00.000Z"
}
```

### Duplicate Management

#### Find Duplicates
```http
GET /api/contacts/duplicates
```

**Response:**
```json
{
  "duplicates": [
    {
      "phone": "+1234567890",
      "confidence": "high",
      "contacts": [
        {
          "id": "contact1",
          "name": "John Doe",
          "phone": "+1234567890",
          "email": "john@example.com"
        },
        {
          "id": "contact2",
          "name": "J. Doe",
          "phone": "+1 (234) 567-8900",
          "email": "john.doe@example.com"
        }
      ]
    }
  ],
  "total": 1
}
```

#### Merge Duplicates
```http
POST /api/contacts/merge-duplicates
Content-Type: application/json

{
  "primaryContactId": "contact1",
  "duplicateContactIds": ["contact2", "contact3"]
}
```

**Response:**
```json
{
  "message": "Contacts merged successfully",
  "contact": {
    "id": "contact1",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "notes": "Important customer\n\n--- Merged from J. Doe ---\nAdditional notes",
    "tags": ["customer", "vip", "premium"],
    "customFields": {
      "company": "Acme Corp",
      "birthday": "1990-01-01",
      "mergedFrom": ["contact2", "contact3"]
    }
  }
}
```

### Contact Groups

#### Get Contact Groups
```http
GET /api/contacts/groups
```

**Response:**
```json
{
  "groups": [
    {
      "id": "group_id",
      "name": "VIP Customers",
      "description": "High value customers",
      "color": "#ff0000",
      "_count": {
        "contacts": 25
      },
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Contact Group
```http
POST /api/contacts/groups
Content-Type: application/json

{
  "name": "VIP Customers",
  "description": "High value customers",
  "color": "#ff0000"
}
```

#### Add Contacts to Group
```http
POST /api/contacts/groups/:groupId/contacts
Content-Type: application/json

{
  "contactIds": ["contact1", "contact2", "contact3"]
}
```

#### Remove Contacts from Group
```http
DELETE /api/contacts/groups/:groupId/contacts
Content-Type: application/json

{
  "contactIds": ["contact1", "contact2"]
}
```

## Advanced Usage Examples

### Complex Filtering
```javascript
// Get VIP customers with email, created in last 30 days, sorted by name
const response = await fetch('/api/contacts?' + new URLSearchParams({
  tags: 'vip,customer',
  hasEmail: 'true',
  createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  sortBy: 'name',
  sortOrder: 'asc',
  limit: '50'
}));
```

### Bulk Tag Management
```javascript
// Add tags to multiple contacts
await fetch('/api/contacts/bulk-operation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'add_tags',
    contactIds: selectedContactIds,
    data: { tags: ['campaign-2023', 'email-sent'] }
  })
});
```

### CSV Import with Error Handling
```javascript
const importResult = await fetch('/api/contacts/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contacts: csvData,
    updateExisting: true
  })
});

const result = await importResult.json();
console.log(`Created: ${result.created}, Updated: ${result.updated}`);
if (result.errors.length > 0) {
  console.log('Import errors:', result.errors);
}
```

### Duplicate Detection and Merging
```javascript
// Find and resolve duplicates
const duplicatesResponse = await fetch('/api/contacts/duplicates');
const { duplicates } = await duplicatesResponse.json();

for (const duplicateGroup of duplicates) {
  if (duplicateGroup.confidence === 'high') {
    const [primary, ...duplicates] = duplicateGroup.contacts;
    
    await fetch('/api/contacts/merge-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryContactId: primary.id,
        duplicateContactIds: duplicates.map(d => d.id)
      })
    });
  }
}
```

## Error Handling

### Common Error Responses

#### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "phone",
      "message": "Please provide a valid phone number"
    }
  ]
}
```

#### Not Found Error
```json
{
  "error": "Contact not found"
}
```

#### Bulk Operation Error
```json
{
  "success": 2,
  "failed": 1,
  "errors": ["Contact contact3 not found or access denied"]
}
```

## Performance Considerations

1. **Pagination**: Always use pagination for large contact lists
2. **Filtering**: Use specific filters to reduce result sets
3. **Bulk Operations**: Process large operations in batches
4. **Search**: Use the search endpoint for autocomplete functionality
5. **Caching**: Consider caching frequently accessed data like tags and groups

## Rate Limiting

- Standard API rate limits apply (1000 requests per hour per user)
- Bulk operations have additional limits (100 contacts per operation)
- Import operations limited to 1000 contacts per request
- Export operations limited to 10000 contacts per request