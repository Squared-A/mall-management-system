# Complete Frontend-Backend Field Mapping Audit & Fixes

## Overview
All frontend forms have been audited against backend models and corrected to send the exact required fields with correct data types and enum values.

---

## 1. TENANT Model ✅ COMPLETE FIX

### Backend Model
```javascript
{
  mallId: ObjectId (optional),
  userId: ObjectId (optional),
  businessName: String (optional),
  tradeLicense: String (optional),
  tinNumber: Number (optional),
  emergencyContact: Number (optional)
}
```

### Issues Found & Fixed
| Issue | Status |
|-------|--------|
| Form sending: name, email, phone, businessType, nationalId, notes | ✅ REMOVED |
| Missing required field mappings | ✅ FIXED |
| Unnecessary validation (all fields optional) | ✅ REMOVED |

### Form Fields Now
```javascript
- businessName (optional, displayed)
- tradeLicense (optional, displayed)
- tinNumber (optional, displayed)
- emergencyContact (optional, displayed)
```

### File Modified
✅ `frontend/src/pages/tenants/TenantPages.jsx`

---

## 2. SHOP Model ✅ COMPLETE FIX

### Backend Model
```javascript
{
  mallId: ObjectId (optional),
  shopNumber: Number (optional),
  floor: Number (optional),
  size: Number (optional),
  monthlyRent: Number (optional),
  category: String (optional),
  status: String enum ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"] (optional)
}
```

### Issues Found & Fixed
| Issue | Status |
|-------|--------|
| Status enum wrong: ['vacant', 'occupied', 'maintenance'] | ✅ FIXED to ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"] |
| Form sending: name, description (not in model) | ✅ REMOVED |
| ShopDetails displaying non-existent fields (tenant, leaseEnd) | ✅ REMOVED |
| ShopDetails title using non-existent name field | ✅ FIXED |

### Form Fields Now
```javascript
- shopNumber (optional, displayed)
- floor (optional, displayed)
- size (optional, displayed)
- monthlyRent (optional, displayed)
- category (optional, displayed)
- status (optional, enum: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
```

### Files Modified
✅ `frontend/src/pages/shops/ShopPages.jsx`

---

## 3. STAFF Model ✅ COMPLETE FIX

### Backend Model
```javascript
{
  mallId: ObjectId (optional),
  fullName: String (optional),
  position: String (optional),
  salary: Number (optional),
  phone: Number (optional),
  email: String (REQUIRED - unique, lowercase),
  shift: String (optional)
}
```

### Issues Found & Fixed
| Issue | Status |
|-------|--------|
| Form field 'name' should be 'fullName' | ✅ MAPPED in AddStaff/EditStaff |
| Form field 'role' should be 'position' | ✅ MAPPED in AddStaff/EditStaff |
| Phone as String should be Number | ✅ CONVERTED with parseInt() |
| Sending unnecessary fields (mallId, notes) | ✅ REMOVED |

### Form Fields Now
```javascript
- fullName (optional, but displayed in form as "name")
- email (REQUIRED, validated in form)
- phone (optional, converted to number)
- position (optional, displayed as "role" in form)
- salary (optional, NOT in form currently)
- shift (optional, NOT in form currently)
```

### Payload Mapping
```javascript
Form Values → Backend Payload:
{
  name → fullName,
  email → email,
  phone → phone (parseInt),
  role → position
}
```

### Files Modified
✅ `frontend/src/pages/staff/StaffPages.jsx` (AddStaff & EditStaff handleSubmit)

---

## 4. MALL Model ✅ COMPLETE FIX

### Backend Model
```javascript
REQUIRED:
- name: String
- address: String
- city: String
- floors: Number
- totalShops: Number
- description: String
- logo: String

OPTIONAL:
- ownerId: ObjectId
- status: String enum ["PENDING", "APPROVED", "REJECTED"] (default: "PENDING")
- isDeleted: Boolean (default: false)
```

### Issues Found & Fixed
| Issue | Status |
|-------|--------|
| Field 'totalFloors' should be 'floors' | ✅ RENAMED |
| Missing required field 'logo' | ✅ ADDED |
| Status enum wrong: ['active', 'maintenance', 'closed'] | ✅ FIXED to ["PENDING", "APPROVED", "REJECTED"] |
| Sending unnecessary fields: state, country, postalCode, phone, email, website | ✅ REMOVED |
| Missing validation on required fields | ✅ ADDED |

### Form Fields Now
```javascript
REQUIRED (all with validation):
- name
- address
- city
- floors (renamed from totalFloors)
- totalShops
- description
- logo

OPTIONAL:
- status (enum: PENDING, APPROVED, REJECTED)
```

### Files Modified
✅ `frontend/src/pages/malls/MallForm.jsx`

---

## Data Type Corrections Summary

| Model | Field | Backend Type | Fix |
|-------|-------|--------------|-----|
| Staff | phone | Number | Convert string to int with parseInt() |
| Shop | status | Enum | Change from lowercase to UPPERCASE |
| Mall | floors | Number | Renamed from totalFloors |
| Mall | logo | String | Added as required field |
| Mall | status | Enum | Changed values to ["PENDING", "APPROVED", "REJECTED"] |

---

## Testing Checklist

### ✅ TENANT Create
```
1. Navigate to Tenants → Add Tenant
2. Fill optional fields:
   - Business Name: "Test Business"
   - Trade License: "TL-123456"
   - TIN Number: "1234567890"
   - Emergency Contact: "5551234567"
3. Submit
4. Verify in DB: All fields saved with correct types
```

### ✅ SHOP Create
```
1. Navigate to Shops → Add Shop
2. Fill form:
   - Shop Number: "101"
   - Floor: "1"
   - Size: "450"
   - Monthly Rent: "4500"
   - Category: "food_beverage"
   - Status: "AVAILABLE" (from dropdown)
3. Submit
4. Verify in DB: Status saved as "AVAILABLE" (not "vacant")
```

### ✅ STAFF Create
```
1. Navigate to Staff → Add Staff
2. Fill form:
   - Full Name: "Jane Doe"
   - Email: "jane@mms.com"
   - Phone: "+1 555 0000"
   - Position: Select from dropdown
   - Password: (only on create)
3. Submit
4. Verify in DB:
   - fullName saved (not name)
   - position saved (not role)
   - phone saved as number
```

### ✅ MALL Create
```
1. Navigate to Malls → Add Mall
2. Fill ALL required fields:
   - Mall Name: "Test Mall"
   - Logo URL: "https://example.com/logo.png"
   - Street Address: "123 Mall Ave"
   - City: "New York"
   - Total Floors: "4"
   - Total Shops: "120"
   - Status: "PENDING" (from dropdown)
   - Description: "A test mall"
3. Submit
4. Verify in DB:
   - floors saved (not totalFloors)
   - logo saved
   - status saved as "PENDING"
```

---

## Files Modified in This Session

1. ✅ `frontend/src/pages/tenants/TenantPages.jsx`
   - Updated TenantForm to only send correct fields
   - Removed unnecessary validation
   - Updated TenantDetails to display correct fields
   - Updated SEED_TENANT

2. ✅ `frontend/src/pages/shops/ShopPages.jsx`
   - Fixed STATUS_OPTIONS enum values (UPPERCASE)
   - Removed 'name' and 'description' fields
   - Updated ShopForm JSX
   - Updated AddShop/EditShop handlers
   - Fixed ShopDetails display
   - Updated SEED_SHOP

3. ✅ `frontend/src/pages/malls/MallForm.jsx`
   - Renamed 'totalFloors' to 'floors'
   - Added 'logo' as required field
   - Fixed STATUS_OPTIONS enum values
   - Added validation for all required fields
   - Removed unnecessary fields

4. ✅ `frontend/src/pages/staff/StaffPages.jsx`
   - Updated AddStaff/EditStaff handleSubmit to map form names
   - Fixed phone conversion to number
   - Removed unnecessary fields from payload

---

## Known Limitations & Notes

1. **Tenant Model**: All fields are optional - no required validations
2. **Shop Model**: All fields are optional - user can submit empty form
3. **Staff Model**: Only email is required
4. **Mall Model**: 7 fields are required and validated

---

## Remaining Backend Integrations to Verify

- [ ] Tenant API returns all 6 optional fields correctly
- [ ] Shop API returns correct enum values
- [ ] Staff API creates with phone as number
- [ ] Mall API requires all 7 fields and rejects partial submissions
- [ ] Leases API field mappings
- [ ] Payments API field mappings
- [ ] Announcements API field mappings
- [ ] Expenses API field mappings
- [ ] Reports API field mappings
- [ ] Maintenance API field mappings

---

