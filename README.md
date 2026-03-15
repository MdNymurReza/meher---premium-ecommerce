<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f33d379e-489e-4c2b-a231-779b363e995b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

```
meher---premium-ecommerce
├─ firebase-blueprint.json
├─ FIREBASE_INDEXES.md
├─ FIREBASE_RULES.md
├─ firestore.rules
├─ GOOGLE_SHEETS_GUIDE.md
├─ index.html
├─ metadata.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ server.ts
├─ src
│  ├─ App.tsx
│  ├─ components
│  │  ├─ AdminSidebar.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Navbar.tsx
│  │  ├─ OrderTrackingTimeline.tsx
│  │  ├─ ProductCard.tsx
│  │  └─ ProductSkeleton.tsx
│  ├─ contexts
│  │  ├─ AuthContext.tsx
│  │  └─ CartContext.tsx
│  ├─ index.css
│  ├─ lib
│  │  └─ firebase.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ Admin
│  │  │  ├─ Categories.tsx
│  │  │  ├─ Customers.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Discounts.tsx
│  │  │  ├─ Orders.tsx
│  │  │  ├─ Products.tsx
│  │  │  └─ Settings.tsx
│  │  ├─ Cart.tsx
│  │  ├─ Checkout.tsx
│  │  ├─ Home.tsx
│  │  ├─ Login.tsx
│  │  ├─ Privacy.tsx
│  │  ├─ ProductDetails.tsx
│  │  ├─ Profile.tsx
│  │  ├─ Register.tsx
│  │  ├─ Shop.tsx
│  │  ├─ Terms.tsx
│  │  └─ Wishlist.tsx
│  └─ types
│     └─ index.ts
├─ tsconfig.json
└─ vite.config.ts

```