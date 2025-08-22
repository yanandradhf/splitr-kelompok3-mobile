# Create Bill User Flow

## Overview
Aplikasi Splitr memiliki 2 cara untuk membuat tagihan: **Scan Receipt** dan **Manual Input**.

## Main Entry Points

### 1. Index Page (`index.tsx`)
- **Entry Point**: Halaman utama create bill
- **Options**:
  - 📷 **Scan Receipt** → `camera.tsx`
  - ✏️ **Manual Input** → `manual.tsx`

---

## Flow 2: Manual Input (Detailed)

### Step 1: Manual Setup (`manual.tsx`)
**Purpose**: Setup basic bill information and add initial items

**UI Components**:
- Header: "Buat Tagihan Manual" with back button
- Input Fields:
  - **Nama Tagihan**: Text input (e.g., "Warung Cak Ilhem")
  - **Kategori Tagihan**: Dropdown with categories (Food & Beverage, Entertainment, Shopping, Transport, Other)
- **Detail Tagihan** section:
  - Shows added items summary
  - "+ Tambah Item" button

**Validation**:
- Nama tagihan must not be empty
- Category must be selected
- At least 1 item must be added

**Actions**:
- **+ Tambah Item** → Navigate to `edit-bill.tsx`
- **Konfirmasi** → Navigate to `bill-detail.tsx` (only if validation passes)
- ← **Back** → Reset nama tagihan & kategori, return to previous screen

**State Management**:
- Uses `useBillStore` for draft management
- Auto-resets store on component mount
- Updates header info when confirming

---

### Step 2: Edit Bill (`edit-bill.tsx`)
**Purpose**: Add, edit, and manage bill items with fees

**UI Components**:
- Header: "Edit Tagihan" with back button
- **Tambah Item** section:
  - Nama Item input
  - Item Sharing checkbox (for shared items like platters)
  - Quantity & Price inputs (or just total price for sharing items)
  - "+ Tambah Item" button
- **Daftar Item** section:
  - List of added items with edit/delete options
  - Inline editing capability
- **Biaya Tambahan** section:
  - Toggle buttons for Pajak (PPN), Service Charge, Diskon/Promo
  - Percentage inputs for each fee type
  - Discount can be percentage or nominal
- **Ringkasan** section:
  - Subtotal, Tax, Service, Discount breakdown
  - Grand Total calculation

**Features**:
- **Item Types**:
  - Regular items: quantity × unit price
  - Sharing items: total price to be divided later
- **Fee Calculations**:
  - Tax: Applied to (subtotal + service)
  - Service: Applied to subtotal
  - Discount: Applied to total or as fixed amount
- **Real-time Updates**: Totals recalculate automatically

**Actions**:
- **Simpan Tagihan** → Reset store & return to `manual.tsx`
- ← **Back** → Reset store & return to `manual.tsx`

---

### Step 3: Bill Detail (`bill-detail.tsx`)
**Purpose**: Review complete bill before selecting members

**UI Components**:
- Header: "Detail Tagihan" with back button
- **Informasi Tagihan**:
  - Nama Tagihan display
  - Kategori display
  - "Edit Tagihan" button → back to `edit-bill.tsx`
- **Daftar Item**:
  - All items with quantities and prices
  - Individual item totals
- **Ringkasan Pembayaran**:
  - Complete breakdown: Subtotal, Tax, Service, Discount
  - Grand Total prominently displayed

**Validation**:
- Must have valid bill name, category, and items

**Actions**:
- **Edit Tagihan** → Navigate to `edit-bill.tsx`
- **Konfirmasi** → Navigate to `payment-method.tsx`
- ← **Back** → Return to `manual.tsx`

---

### Step 4: Payment Method (`payment-method.tsx`)
**Purpose**: Choose when the bill should be paid

**UI Components**:
- Header: "Pilih Metode Tagihan" with back button
- **Metode Pembayaran** cards:
  - **Bayar Sekarang**: 24-hour expiry with flash icon
  - **Bayar Nanti**: Custom due date with calendar icon
- **Date Picker** (for Pay Later):
  - Calendar modal for selecting due date
  - Formatted date display
- **Info Box**: Warning about 24-hour expiry for Pay Now

**Features**:
- **Pay Now**: Automatic 24-hour deadline
- **Pay Later**: Custom due date selection (minimum: today)
- Visual feedback for selected method

**Actions**:
- **Kirim ke Anggota** → Navigate to `member-bills.tsx`
- ← **Back** → Return to `bill-detail.tsx`

---

### Step 5: Member Bills (`member-bills.tsx`)
**Purpose**: Select participants for the bill

**UI Components**:
- Header: "Pilih Anggota" with back button and add friend button
- **Tab System**:
  - **Grup Tab**: Select entire groups
  - **Teman Tab**: Select individual friends
- **Search & Add Friends**:
  - Search existing friends
  - Add new friends by username
  - Confirmation modal for adding friends
- **Selection Display**:
  - Preview of selected members/groups
  - Member count and names
  - Cancel selection options

**Features**:
- **Group Selection**: Select all members of a group at once
- **Individual Selection**: Pick specific friends
- **Friend Management**: Search and add new friends inline
- **Real-time Validation**: Must select at least 1 participant

**Actions**:
- **Add Friend** → Modal for searching and adding friends
- **Lanjut dengan X orang/grup** → Navigate to `split-bill.tsx`
- ← **Back** → Return to `payment-method.tsx`

---

### Step 6: Split Bill (`split-bill.tsx`)
**Purpose**: Assign items to specific members

**UI Components**:
- Header: "Pembagian Tagihan" with back button
- **Member Info**: Shows selected participants count
- **Item Assignment Cards**:
  - Each item with name, quantity, and total price
  - **Regular Items**: +/- buttons for quantity assignment per member
  - **Sharing Items**: Checkbox selection for participants
- **Payment Status**: Shows "You" as automatic payer (host)
- **Validation Messages**: Real-time feedback on assignment validity

**Features**:
- **Assignment Types**:
  - Regular items: Must assign exact quantity to members
  - Sharing items: Select participants, auto-divide equally
- **Auto-Payment**: Host (You) automatically marked as paid upfront
- **Validation**: Ensures all items are properly assigned

**Actions**:
- **Konfirmasi** → Navigate to `bill-summary.tsx` (only if all items assigned)
- ← **Back** → Return to `member-bills.tsx`

---

### Step 7: Bill Summary (`bill-summary.tsx`)
**Purpose**: Final review before PIN verification

**UI Components**:
- Complete bill overview
- Member-wise breakdown
- Payment assignments
- Final totals and calculations

**Actions**:
- **Lanjut ke Verifikasi** → Navigate to `pin-verification.tsx`
- **Edit** → Return to previous steps for modifications
- ← **Back** → Return to `split-bill.tsx`

---

### Step 8: PIN Verification (`pin-verification.tsx`)
**Purpose**: Security verification before creating bill

**UI Components**:
- Header: "Verifikasi PIN" with back button
- **Security Icon**: Shield checkmark icon
- **Bill Summary**: Name and total amount display
- **PIN Input**: 6-digit secure text input
- **Confirmation Button**: "Buat Tagihan" with loading state

**Features**:
- **PIN Validation**: Must match user's stored PIN
- **Security**: PIN input is masked
- **Loading State**: Shows spinner during bill creation
- **Error Handling**: Shows alert for wrong PIN

**Validation**:
- PIN must be exactly 6 digits
- PIN must match user's stored PIN

**Actions**:
- **Buat Tagihan** → Validate PIN, create bill via API, navigate to `success.tsx`
- ← **Back** → Return to `bill-summary.tsx`

---

### Step 9: Success (`success.tsx`)
**Purpose**: Confirmation and next steps

**UI Components**:
- Header: Success checkmark icon
- **Bill Summary**:
  - Bill name and code
  - Total amount
  - Member count
  - Notification status
- **Members List**: All participants with status indicators
- **Action Buttons**:
  - Primary: "Lihat Tagihan" → monitoring tab
  - Secondary: "Kembali ke Beranda" → home tab

**Features**:
- **Success Confirmation**: Visual feedback with animations
- **Bill Details**: Code, total, member info
- **Notification Status**: Shows how many notifications sent
- **Navigation Options**: Quick access to view bills or return home

**Actions**:
- **Lihat Tagihan** → Navigate to monitoring tab
- **Kembali ke Beranda** → Navigate to home tab

---

## Manual Input Navigation Flow

```
index.tsx
└── ✏️ manual.tsx
    ├── ⇄ edit-bill.tsx (Add/Edit Items)
    └── bill-detail.tsx (Review)
        └── payment-method.tsx (Payment Options)
            └── member-bills.tsx (Select Participants)
                └── split-bill.tsx (Assign Items)
                    └── bill-summary.tsx (Final Review)
                        └── pin-verification.tsx (PIN Verification)
                            └── success.tsx (Confirmation)
                            ├── → /(tabs)/monitoring (View Bills)
                            └── → /(tabs)/home (Home)
```

## State Flow & Data Management

```
1. manual.tsx:
   - draft.name ← User input
   - draft.category ← Category selection
   - draft.items ← From edit-bill.tsx

2. edit-bill.tsx:
   - draft.items[] ← Add/edit/remove items
   - draft.fees ← Tax, service, discount settings
   - draft.totals ← Auto-calculated

3. payment-method.tsx:
   - draft.paymentMethod ← "PAY_NOW" | "PAY_LATER"
   - draft.dueDate ← Selected date (if PAY_LATER)

4. member-bills.tsx:
   - draft.selectedMemberIds[] ← Participant selection

5. split-bill.tsx:
   - draft.assignments[] ← Item-to-member assignments

6. bill-summary.tsx:
   - Review final bill details
   - → pin-verification.tsx

7. pin-verification.tsx:
   - PIN validation
   - finalize() ← Create bill via API
   - → success.tsx with bill data
```

## Key Features & Technical Details

### Data Management
- **Store**: `billStore.ts` (Zustand) - Centralized draft state
- **Reset Behavior**: 
  - `manual.tsx` back button: Resets name & category only
  - `edit-bill.tsx` back/save: Full store reset
  - Auto-reset on manual.tsx mount
- **Real-time Calculations**: Totals update automatically via `recalcTotals()`
- **Persistence**: Draft maintained across navigation within flow

### Validation System
- **Progressive Validation**: Each step validates before allowing next
- **Manual Setup**: Name + Category + Items required
- **Item Assignment**: Must assign all quantities/participants
- **Visual Feedback**: Disabled buttons, error messages, validation hints

### User Experience
- **Guided Flow**: Clear step-by-step progression
- **Flexible Editing**: Can return to edit at any stage
- **Smart Defaults**: Auto-calculations, host as payer
- **Error Prevention**: Real-time validation, clear requirements
- **Responsive Design**: Optimized for mobile interaction

### API Integration
- **Categories**: Fetched from `/api/mobile/categories`
- **Friends**: Real-time search and management
- **Bill Creation**: Final submission via `createBill()` API
- **Notifications**: Automatic sending to selected members

### Performance Optimizations
- **Lazy Loading**: Components load as needed
- **Memoization**: Expensive calculations cached
- **Optimistic Updates**: UI updates before API confirmation
- **Error Handling**: Graceful fallbacks for API failures