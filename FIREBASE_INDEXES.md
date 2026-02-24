# Firestore Composite Indexes

To ensure all features of Meher work correctly, you need to create the following composite indexes in your Firebase Console (**Firestore** > **Indexes** > **Composite**).

### 1. Order History (Profile Page)
- **Collection ID**: `orders`
- **Fields**:
  - `userId`: Ascending
  - `createdAt`: Descending
- **Query Scope**: Collection

### 2. Category Filtering (Shop Page)
- **Collection ID**: `products`
- **Fields**:
  - `category`: Ascending
  - `createdAt`: Descending
- **Query Scope**: Collection

### 3. Admin Pending Orders (Dashboard)
- **Collection ID**: `orders`
- **Fields**:
  - `status`: Ascending
  - `createdAt`: Descending
- **Query Scope**: Collection

---

**Note**: You can also create these automatically by clicking the "Error" links in your browser's developer console (F12) whenever a "Query requires an index" error appears.
