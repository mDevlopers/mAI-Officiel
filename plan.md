1. **Move Images:** Move all logos to `public/images/`. (Already completed)
2. **Settings UI Update (`app/(chat)/settings/page.tsx`):**
   - Add a logo and favicon selector to the `CompteSection`.
   - The user can select from a predefined list of brand logos.
   - For users *not* on the `max` plan, the "blue" logos will be disabled or hidden with a message indicating they are reserved for the Max plan.
   - Save the selected logo preference to `localStorage` (e.g., key: `mai.brand_logo.v1`) and a cookie (e.g., `mai_brand_logo`) to allow server-side reading in `app/layout.tsx`.
3. **Dynamic Logo in Layout (`app/layout.tsx`):**
   - Read the `mai_brand_logo` cookie (using `next/headers`).
   - Dynamically set the `icons` in the `<head>` of the application based on the cookie, or use the default `/images/logo.png`.
   - Also, dynamically update the `<link rel="icon">`, `<link rel="shortcut icon">`, and `<link rel="apple-touch-icon">` tags.
4. **Dynamic Logo in UI (`components/chat/icons.tsx` & `components/chat/message.tsx`):**
   - Update `BrandStarLogoIcon` to read the logo from the `mai_brand_logo` cookie if possible, or use a client-side hook to sync the image from `localStorage`.
   - Similarly update the mAI avatar in `components/chat/message.tsx`. (Since `Message` is likely a client component or server component, we can either read from context/cookies).
5. **Dynamic Logo in Manifest (`app/manifest.ts`):**
   - Manifest doesn't easily support cookies per user, but we will leave it as the default logo since it's static.
6. **Pre-commit checks**
   - Complete pre-commit steps.
