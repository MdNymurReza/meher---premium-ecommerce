# Google Sheets Integration Guide

To automatically sync your orders to Google Sheets, follow these steps:

### 1. Create a Google Sheet
- Create a new Google Sheet.
- Name the first sheet "Orders".
- Add the following headers in the first row (A1 to I1):
  `Order ID`, `Customer Name`, `Phone`, `Address`, `Product Names`, `Total Price`, `Payment Method`, `Order Status`, `Date`

### 2. Open Apps Script
- In your Google Sheet, go to **Extensions** > **Apps Script**.

### 3. Paste the Script
Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
    
    // Format products list
    var productNames = data.products.map(function(p) {
      return p.name + " (x" + p.quantity + ")";
    }).join(", ");
    
    sheet.appendRow([
      data.id,
      data.customerName,
      data.phone,
      data.address,
      productNames,
      data.totalPrice,
      data.paymentMethod,
      data.status,
      data.date
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 4. Deploy as Web App
- Click **Deploy** > **New Deployment**.
- Select **Type**: Web App.
- **Description**: Meher Order Sync.
- **Execute as**: Me (your email).
- **Who has access**: Anyone (this is required for the webhook to work).
- Click **Deploy**.
- **Copy the Web App URL**.

### 5. Update Environment Variables
- In your AI Studio project, add the copied URL to the `GOOGLE_SHEETS_WEBHOOK_URL` environment variable.
