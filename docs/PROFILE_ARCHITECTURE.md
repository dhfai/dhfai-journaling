# Profile Feature Architecture

## 📁 Struktur File

```
app/
├── dashboard/
│   └── profile/
│       └── page.tsx              # Profile page - UI layer yang bersih
components/
├── profile/
│   ├── profile-info-card.tsx     # Komponen kartu informasi user
│   └── profile-form.tsx          # Komponen form profile (reusable)
hooks/
└── use-profile.ts                # Custom hook untuk business logic profile
services/
└── profile.ts                    # Service layer untuk API calls
types/
└── api.ts                        # Type definitions dengan type safety yang ketat
```

## 🏗️ Arsitektur

### 1. **Service Layer** (`services/profile.ts`)
- Bertanggung jawab untuk semua komunikasi API
- Error handling yang robust
- Validasi input sebelum API call
- Type-safe dengan generic TypeScript

```typescript
// Contoh penggunaan
const response = await ProfileService.updateProfile(data);
if (response.success) {
  // Handle success
} else {
  // Handle error dengan response.error
}
```

### 2. **Custom Hooks** (`hooks/use-profile.ts`)
- Memisahkan business logic dari UI components
- Mengelola state management (loading, error, data)
- Menyediakan interface yang clean untuk components
- Automatic data fetching dengan useEffect

```typescript
// Contoh penggunaan
const { profile, isLoading, isUpdating, updateProfile } = useProfile();
```

### 3. **UI Components** (`components/profile/`)
- Komponen presentational yang reusable
- Tidak memiliki business logic
- Menerima props untuk data dan callbacks
- Focused pada rendering dan user interaction

### 4. **Page Component** (`app/dashboard/profile/page.tsx`)
- Thin orchestration layer
- Menghubungkan hooks dengan UI components
- Minimal logic, maksimal composition

## 🎯 Keuntungan Arsitektur Ini

### ✅ Separation of Concerns
- **Service**: API communication
- **Hooks**: Business logic & state management
- **Components**: UI rendering
- **Pages**: Composition & routing

### ✅ Reusability
- Components dapat digunakan di berbagai tempat
- Hooks dapat di-share antar pages
- Services dapat di-mock untuk testing

### ✅ Maintainability
- Mudah menemukan dan memperbaiki bugs
- Setiap layer memiliki tanggung jawab yang jelas
- Perubahan di satu layer tidak mempengaruhi layer lain

### ✅ Testability
- Service layer dapat di-test secara independent
- Hooks dapat di-test dengan React Testing Library
- Components dapat di-test dengan snapshot testing

### ✅ Type Safety
- Strong typing di semua layer
- Autocomplete yang lebih baik
- Catch errors di compile time

## 🔄 Data Flow

```
User Action → Page Component → Custom Hook → Service → API
                    ↓              ↓            ↓
                UI Update ← State Update ← Response
```

## 📝 Contoh Penggunaan

### Membaca Profile
```typescript
// Di dalam component
const { profile, isLoading, error } = useProfile();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <ProfileDisplay profile={profile} />;
```

### Update Profile
```typescript
// Di dalam component
const { updateProfile, isUpdating } = useProfile();

const handleSubmit = async (data) => {
  const success = await updateProfile(data);
  if (success) {
    toast.success("Profile updated!");
  }
};
```

## 🛠️ Best Practices

1. **Service Layer**
   - Selalu return `ApiResponse<T>` type
   - Handle errors dengan try-catch
   - Log errors untuk debugging
   - Validate input sebelum API call

2. **Custom Hooks**
   - Gunakan `useCallback` untuk functions
   - Cleanup effects dengan return function
   - Export interface yang type-safe
   - Handle loading dan error states

3. **Components**
   - Props harus typed dengan interface
   - Gunakan composition over inheritance
   - Keep components small dan focused
   - Extract reusable logic ke hooks

4. **Pages**
   - Minimal logic, maksimal composition
   - Use loading skeletons untuk UX
   - Handle authentication di page level
   - Proper error boundaries

## 🚀 Extending the Feature

### Menambah Field Baru

1. Update `types/api.ts`:
```typescript
export interface Profile {
  // ... existing fields
  new_field?: string;
}
```

2. Update `ProfileForm` component untuk render field baru

3. Tidak perlu ubah service atau hooks - sudah generic!

### Menambah Endpoint Baru

1. Tambahkan method di `ProfileService`:
```typescript
static async newMethod(data: any): Promise<ApiResponse<any>> {
  return await apiClient.post('/profile/new-endpoint', data, true);
}
```

2. Tambahkan function di `useProfile` hook jika perlu state management

## 📚 Referensi API

Lihat [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) untuk detail endpoint yang tersedia.
