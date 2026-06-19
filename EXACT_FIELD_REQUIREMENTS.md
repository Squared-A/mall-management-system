# Exact Field Requirements from Backend Models

## 1. TENANT Model
**REQUIRED:** None - ALL fields are optional
```javascript
Schema Fields:
- mallId: ObjectId (optional)
- userId: ObjectId (optional)
- businessName: String (optional)
- tradeLicense: String (optional)
- tinNumber: Number (optional)
- emergencyContact: Number (optional)
+ Auto: _id, createdAt, updatedAt, __v
```

**Status:** ✅ Form already correct

---

## 2. SHOP Model
**REQUIRED:** None - ALL fields are optional
```javascript
Schema Fields:
- mallId: ObjectId (optional)
- shopNumber: Number (optional)
- floor: Number (optional)
- size: Number (optional)
- monthlyRent: Number (optional)
- category: String (optional)
- status: String enum ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"] (optional)
+ Auto: _id, createdAt, updatedAt, __v
```

**Status:** ⚠️ Need to check form status enum values

---

## 3. STAFF Model
**REQUIRED:** email only
```javascript
Schema Fields:
- mallId: ObjectId (optional)
- fullName: String (optional)
- position: String (optional)
- salary: Number (optional)
- phone: Number (optional)
- email: String (REQUIRED - unique, lowercase)
- shift: String (optional)
+ Auto: _id, createdAt, updatedAt, __v
```

**Status:** ✅ Form updated to match

---

## 4. MALL Model
**REQUIRED:** name, address, city, floors, totalShops, description, logo (7 fields)
```javascript
Required Fields:
- name: String (required)
- address: String (required)
- city: String (required)
- floors: Number (required)
- totalShops: Number (required)
- description: String (required)
- logo: String (required)

Optional Fields:
- ownerId: ObjectId (optional)
- status: String enum ["PENDING", "APPROVED", "REJECTED"] (optional, default: "PENDING")
- isDeleted: Boolean (optional, default: false)
+ Auto: _id, createdAt, updatedAt, __v
```

**Status:** ✅ Form updated to match

---

## Summary: Required vs Optional

| Model | Required Fields | Optional Fields | Status |
|-------|-----------------|-----------------|--------|
| Tenant | None | All 6 fields | ✅ No validation needed |
| Shop | None | All 7 fields | ⚠️ Need enum check |
| Staff | email | fullName, position, salary, phone, shift | ✅ Email required |
| Mall | 7 fields | ownerId, status, isDeleted | ✅ All 7 required in form |

---

## Field Name Mappings (Final)

### TENANT (All Optional)
```
Frontend → Backend
businessName → businessName ✓
tradeLicense → tradeLicense ✓
tinNumber → tinNumber ✓
emergencyContact → emergencyContact ✓
```

### SHOP (All Optional - Status Enum Check Needed)
```
Frontend → Backend
shopNumber → shopNumber ✓
floor → floor ✓
size → size ✓
monthlyRent → monthlyRent ✓
category → category ✓
status → status (MUST be: "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE")
```

### STAFF (Email Required)
```
Frontend → Backend
fullName → fullName ✓
email → email ✓ (REQUIRED)
phone → phone (convert to Number) ✓
position → position ✓
salary → salary ✓
shift → shift ✓
```

### MALL (7 Fields Required)
```
Frontend → Backend
name → name ✓ (required)
address → address ✓ (required)
city → city ✓ (required)
floors → floors ✓ (required)
totalShops → totalShops ✓ (required)
description → description ✓ (required)
logo → logo ✓ (required)
status → status (optional, default: "PENDING")
```

---

## Action Items

1. ✅ **Tenant Form** - All fields optional (form is correct)
2. ⚠️ **Shop Form** - Check status enum values in form
3. ✅ **Staff Form** - Email required, others optional (fixed)
4. ✅ **Mall Form** - 7 fields required (fixed)

