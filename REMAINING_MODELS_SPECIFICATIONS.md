# Remaining Models Field Specifications

## 1. LEASE Model

### Backend Requirements
```javascript
REQUIRED:
- startDate: Date
- endDate: Date
- monthlyRent: Number
- deposit: Number

OPTIONAL:
- mallId: ObjectId
- tenantId: ObjectId
- shopId: ObjectId
- status: String enum ["ACTIVE", "EXPIRED", "TERMINATED"]
- isDeleted: Boolean (default: false)

Auto-generated:
- _id, createdAt, updatedAt, __v
```

### Frontend Form Fields to Implement
```
Required:
- startDate (date picker)
- endDate (date picker)
- monthlyRent (number)
- deposit (number)

Optional:
- status (dropdown: ACTIVE, EXPIRED, TERMINATED)
```

### Important Enum Values
- Status: ["ACTIVE", "EXPIRED", "TERMINATED"]

---

## 2. PAYMENT Model

### Backend Requirements
```javascript
REQUIRED:
- paymentDate: Date

OPTIONAL:
- leaseId: ObjectId
- tenantId: ObjectId
- amount: Number
- paymentMethod: String enum ["bank", "cash"]
- invoiceNumber: String
- status: String enum ["pending", "completed"] (default: "pending")

Auto-generated:
- _id, createdAt, updatedAt, __v
```

### Frontend Form Fields to Implement
```
Optional but typically needed:
- amount (number)
- paymentMethod (dropdown: bank, cash)
- paymentDate (date picker, required)
- invoiceNumber (text)
- status (dropdown: pending, completed)
```

### Important Enum Values
- paymentMethod: ["bank", "cash"] (lowercase)
- status: ["pending", "completed"] (lowercase)

---

## 3. ANNOUNCEMENT Model

### Backend Requirements
```javascript
OPTIONAL (ALL):
- mallId: ObjectId
- title: String
- message: String
- targetRole: String enum ["all", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"]
- createdBy: ObjectId (auto-set by backend from auth)

Auto-generated:
- _id, createdAt, updatedAt, __v
```

### Frontend Form Fields to Implement
```
Optional:
- title (text)
- message (textarea)
- targetRole (dropdown: all, MALL_OWNER, MALL_MANAGER, ACCOUNTANT, TENANT)
```

### Important Enum Values
- targetRole: ["all", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"]

---

## 4. EXPENSE Model

### Backend Requirements
```javascript
OPTIONAL (ALL):
- mallId: ObjectId
- category: String enum [
    "UTILITY",
    "SECURITY",
    "CLEANING",
    "SALARY",
    "MAINTENANCE",
    "MARKETING",
    "REPAIR",
    "OTHER"
  ] (default: "UTILITY")
- description: String
- amount: Number
- expenseDate: Date (default: Date.now)
- paymentMethod: String
- vendor: String
- receipt: String
- createdBy: ObjectId (auto-set by backend from auth)
- isDeleted: Boolean

Auto-generated:
- _id, createdAt, updatedAt, __v
```

### Frontend Form Fields to Implement
```
Optional:
- category (dropdown with 8 options)
- description (textarea)
- amount (number)
- expenseDate (date picker)
- paymentMethod (text)
- vendor (text)
- receipt (file upload or URL)
```

### Important Enum Values
- category: ["UTILITY", "SECURITY", "CLEANING", "SALARY", "MAINTENANCE", "MARKETING", "REPAIR", "OTHER"]

---

## 5. MAINTENANCE Model

### Backend Requirements
```javascript
OPTIONAL (ALL):
- tenantId: ObjectId
- shopId: ObjectId
- title: String
- description: String
- priority: String enum ["LOW", "MEDIUM", "HIGH", "URGENT"] (default: "LOW")
- status: String enum ["OPEN", "IN_PROGRESS", "COMPLETED"] (default: "OPEN")
- assignedTo: String
- isDeleted: Boolean (default: false)

Auto-generated:
- _id, createdAt, updatedAt, __v

NOTE: Backend has typo "timstamps" instead of "timestamps" - this is a backend bug
```

### Frontend Form Fields to Implement
```
Optional:
- title (text)
- description (textarea)
- priority (dropdown: LOW, MEDIUM, HIGH, URGENT)
- status (dropdown: OPEN, IN_PROGRESS, COMPLETED)
- assignedTo (text/select user)
```

### Important Enum Values
- priority: ["LOW", "MEDIUM", "HIGH", "URGENT"]
- status: ["OPEN", "IN_PROGRESS", "COMPLETED"]

---

## Field Mapping Summary Table

| Model | Required Fields | Enum Fields | Notes |
|-------|-----------------|-------------|-------|
| Lease | startDate, endDate, monthlyRent, deposit | status: ["ACTIVE", "EXPIRED", "TERMINATED"] | All dates |
| Payment | paymentDate | paymentMethod: ["bank", "cash"], status: ["pending", "completed"] | All lowercase except paymentDate |
| Announcement | NONE (all optional) | targetRole: ["all", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"] | createdBy auto-set |
| Expense | NONE (all optional) | category: 8 values | Default category: UTILITY |
| Maintenance | NONE (all optional) | priority: 4 values, status: 3 values | Defaults: priority=LOW, status=OPEN |

---

## Critical Enum Value Cases

### UPPERCASE Enums (Must be UPPERCASE)
```
Lease.status: ["ACTIVE", "EXPIRED", "TERMINATED"]
Announcement.targetRole: ["all", "MALL_OWNER", "MALL_MANAGER", "ACCOUNTANT", "TENANT"]
Expense.category: ["UTILITY", "SECURITY", "CLEANING", "SALARY", "MAINTENANCE", "MARKETING", "REPAIR", "OTHER"]
Maintenance.priority: ["LOW", "MEDIUM", "HIGH", "URGENT"]
Maintenance.status: ["OPEN", "IN_PROGRESS", "COMPLETED"]
```

### LOWERCASE Enums (Must be lowercase)
```
Payment.paymentMethod: ["bank", "cash"]
Payment.status: ["pending", "completed"]
```

### Mixed Case (Special case)
```
Announcement.targetRole: "all" (lowercase), "MALL_OWNER" (uppercase), etc.
```

---

## Summary of All Models

### Quick Reference Checklist

- [ ] **Tenant** (✅ DONE): businessName, tradeLicense, tinNumber, emergencyContact
- [ ] **Shop** (✅ DONE): shopNumber, floor, size, monthlyRent, category, status (UPPERCASE ENUM)
- [ ] **Staff** (✅ DONE): fullName, email, phone, position, salary, shift
- [ ] **Mall** (✅ DONE): name, address, city, floors, totalShops, description, logo, status
- [ ] **Lease** (TODO): startDate, endDate, monthlyRent, deposit, status
- [ ] **Payment** (TODO): paymentDate, amount, paymentMethod, invoiceNumber, status
- [ ] **Announcement** (TODO): title, message, targetRole
- [ ] **Expense** (TODO): category, description, amount, expenseDate, paymentMethod, vendor, receipt
- [ ] **Maintenance** (TODO): title, description, priority, status, assignedTo

---

## Backend Issues Found

1. **Maintenance Model** (Line 38): Typo "timstamps" should be "timestamps"
   - This may prevent auto-timestamp functionality
   - Needs backend fix

---

