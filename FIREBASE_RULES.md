# Firebase Security Rules

Paste these rules into your Firebase Console under **Firestore** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User profiles
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
    }

    // Products
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders
    match /orders/{orderId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if isAdmin();
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
    }

    // Discounts
    match /discounts/{discountId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
  }
}
```

### Firebase Storage Rules
Paste these under **Storage** > **Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```
