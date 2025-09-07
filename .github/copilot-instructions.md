# Copilot Instructions for Cocada Trading App

## Project Overview
- **Frontend:** React (Vite) + Material-UI v5, custom trading theme (see `src/theme/trading-theme.js`).
- **API:** REST, endpoints documented in `FRONTEND_API_GUIDE.md` and Postman collection. No authentication; all endpoints are public for demo.
- **State:** Global context in `src/contexts/AppContext.jsx` manages user, portfolio, orders, and UI state.
- **Design:** Layout and component structure inspired by Figma (see `project/` for base components and `references/` for images).

## Key Patterns & Conventions
- **User selection:** UserId (1-5) is selected in the header and used for all API calls. Changing user triggers full reload of portfolio and orders.
- **API calls:** Use the API client in `src/utils/api.js`. Always refresh portfolio and orders after any action (buy/sell, deposit/withdraw, cancel, process).
- **UI/UX:**
  - Use Material Design 3 components (`@mui/material`).
  - BUY/positive: green, SELL/negative: red. Use vibrant, beach-inspired colors elsewhere.
  - Show a global spinner during API calls and a snackbar for all backend errors (centered, bottom).
  - Logo (`public/cocada.png`) is prominent in the header.
- **Modals:**
  - Deposit/Withdraw modal (`src/components/DepositWithdrawModal.jsx`) is complete and functional.
  - Buy/Sell modal needs to be created (see Etapa 3 in development-log.md).
  - Instrument list for Buy/Sell should be fetched once and cached in global state.
  - Order type selector: MARKET or LIMIT.
  - Amount/size selector: user chooses type and enters value.
- **Order management:**
  - Orders list: each item has a cancel button (calls cancel endpoint, then refreshes data).
  - Process Simulator: input for OrderId + button to process (calls process endpoint, then refreshes data).
- **Portfolio/Orders display:**
  - Portfolio: Informational, no actions. Group and display positions clearly.
  - Orders: Actionable (cancel), show status, type, side, etc.

## Current Status (Etapa 2 Complete)
- ✅ **Layout & Navigation:** Header with logo, user selector, process simulator, global spinner, snackbar
- ✅ **Dashboard:** Portfolio summary, positions list, orders list, action buttons
- ✅ **Cash Operations:** Deposit/withdraw modal with validation and API integration
- 🔄 **Next:** Trading modal (BUY/SELL) with instrument search and order creation

## Developer Workflows
- **Start dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview:** `npm run preview`
- **.env:** Set `VITE_API_URL` for backend URL (local or prod).

## File Structure Highlights
- `src/theme/trading-theme.js`: Color palette and theme overrides.
- `src/utils/api.js`: All API calls and error handling.
- `src/contexts/AppContext.jsx`: Global state, API integration, and UI feedback logic.
- `src/components/Layout.jsx`: Main layout with header and global UI components.
- `src/components/Dashboard.jsx`: Main dashboard with portfolio summary and data lists.
- `src/components/DepositWithdrawModal.jsx`: Functional cash operations modal.
- `src/components/Header.jsx`: Navigation bar with user selector and process simulator.
- `src/components/ErrorSnackbar.jsx`: Global error/success message component.
- `project/components/`: Original UI components and modals for reference.
- `project/components/ui/`: Reusable UI primitives (accordion, button, table, etc.).
- `public/`: Static assets (logo, icons).
- `references/`: Figma and design images for layout reference.

## Special Notes
- Always use the context and API client for data flow; do not fetch directly in components.
- All error messages from the backend must be shown in the snackbar.
- Follow the color conventions for trading (green/red) and keep the UI lively.
- See `development-log.md` for project history, completed steps, and next tasks.

---

For any unclear workflow or missing pattern, check `development-log.md`, `FRONTEND_API_GUIDE.md`, and the instructions in `.github/instructions/condiciones-iniciales.instructions.md`.
