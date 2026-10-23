# InventoryHub — Full-Stack Inventory Management

InventoryHub is a beginner-friendly full-stack application for managing inventory. It combines a responsive frontend with an Express REST API and JSON-based data storage.

## Features

- Inventory overview cards: product count, units, total inventory value, and stock needing attention.
- Add, edit, and delete inventory items.
- Search by product name, SKU, or category.
- Filter by category and stock status.
- Server-side validation for required fields, unique SKUs, non-negative prices, and whole-number quantities.
- Consistent JSON API responses and readable API error messages.
- CSV export for the currently visible inventory results.
- Data persists in `data/inventory.json` between restarts.
- Responsive layout for desktop and mobile.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

The first run creates `data/inventory.json` if it does not already exist.

## API reference

All API responses use JSON. Successful responses include `success: true`; errors include `success: false` and an `error.message`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health check |
| GET | `/api/items` | List inventory; supports `search`, `category`, and `status` query parameters |
| GET | `/api/items/:id` | Get one item |
| GET | `/api/summary` | Summary metrics |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

### Example POST body

```json
{
  "name": "USB-C Cable",
  "sku": "ACC-005",
  "category": "Accessories",
  "quantity": 25,
  "price": 299
}
```

### Stock filter values

- `in`: quantity greater than 5
- `low`: quantity from 1 through 5
- `out`: quantity equal to 0

## Project structure

```text
InventoryHub/
├── data/
│   └── inventory.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── .gitignore
├── package.json
├── README.md
├── COPILOT_SUMMARY.md
└── server.js
```

## Integration and performance notes

- The browser communicates with the backend using `fetch()` and JSON.
- The frontend has one reusable API helper that checks HTTP status and handles JSON errors consistently.
- Input search is debounced to reduce unnecessary requests while typing.
- Summary metrics are requested alongside the inventory list.
- Event delegation is used for edit/delete buttons so handlers are not recreated for every table row.
- The backend validates request bodies and returns useful HTTP status codes (`201`, `400`, `404`, `500`).
- JSON is stored locally for this learning project. It is suitable for a demo, not concurrent production workloads. A production version should use a database and authentication.

## GitHub submission

1. Create a **public** repository named `InventoryHub`.
2. Upload all project files and folders (do not upload `node_modules`).
3. Commit with a message such as `Initial commit - InventoryHub full-stack app`.
4. Open the repository on GitHub and copy its URL into your assignment submission.
5. Add your own screenshots and confirm the app runs locally before submitting.

## Note

This is a demonstration application with sample inventory records. Replace the sample data with your own if your instructor has provided a specific dataset.
