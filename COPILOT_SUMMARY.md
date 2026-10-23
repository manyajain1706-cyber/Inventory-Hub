# Reflective Summary: How Copilot Assisted the Development Process

> Personalize this reflection to match the work you actually completed and the assistance you used before submitting.

## 1. Generating and refining integration code
Copilot-style assistance helped outline the connection between the frontend and backend. The frontend uses JavaScript `fetch()` requests to call Express API endpoints, while the server returns structured JSON. I refined the flow so inventory items can be listed, created, updated, and deleted from the dashboard.

## 2. Debugging and fixing integration issues
The application uses a shared API helper to parse JSON responses, check HTTP status codes, and display readable errors. This helps surface validation failures and missing records instead of leaving the interface in a confusing state. I also checked that the frontend field names match the backend request schema.

## 3. Creating and managing JSON structures
Inventory records use a consistent structure containing `id`, `name`, `sku`, `category`, `quantity`, `price`, and `updatedAt`. API responses use a consistent `success` flag and a `data` or `error` object. The summary endpoint calculates product count, total units, inventory value, and stock alerts from the same records.

## 4. Optimizing integration code for performance
Search is debounced so typing does not immediately trigger a request for every keystroke. The frontend uses event delegation for row actions and requests summary data in parallel with inventory data. These choices keep the code easier to maintain and reduce avoidable work for this small demo.

## What I learned
I learned how the frontend and backend communicate through REST endpoints, how JSON data is sent and received, how validation errors can be handled gracefully, and why consistent API responses make full-stack applications easier to debug. The current version stores data in a local JSON file; a production application would use a database, authentication, and stronger concurrency controls.
