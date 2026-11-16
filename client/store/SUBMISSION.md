# TrackMode internal testing checklist

Stops at TestFlight internal testing and the Google Play internal testing track. Nothing here publishes publicly.

## Old identifiers still in use (coordinate before the first upload)

The app is named TrackMode, but these technical identifiers still say `peakmode`. None of them is shown to users as the app name. Once a store record or OAuth client exists for them, they can't be renamed without creating a new app.

| Identifier | Where | Current value |
|---|---|---|
| iOS bundle ID and Android package | `app.json`; App Store Connect and Play Console records (not created yet) | `com.peakmode.app` |
| Google Sign-In OAuth clients (iOS and Android) | Google Cloud Console (to be created) | bound to `com.peakmode.app` |
| API host | `eas.json` → `EXPO_PUBLIC_API_URL` | `https://api.peakmode.app` |
| Website, support, privacy, terms and deletion pages; support email | About screen, `store/listing.md`, `store/privacy.md` | `peakmode.app`, `support@peakmode.app` |
| App Store SKU | step 3 below | `peakmode-ios` |
| Deep-link scheme and billing return URLs | `app.json` `scheme`, server `billing.return-url.ts` | `balanceos://` |

If you want `com.trackmode.app` and a `trackmode.app` domain, decide now. The bundle ID can be changed freely until the first TestFlight or Play upload, and the iOS Google client is still to be created anyway.

## Already configured in the repo

- `app.json`:
  - display name **TrackMode**, version 1.0.0;
  - iOS bundle ID and Android package **com.peakmode.app**;
  - iPhone only (`supportsTablet: false`);
  - export compliance answered (`ITSAppUsesNonExemptEncryption: false`, the app uses only standard HTTPS);
  - localized iOS permission texts and display name in Hebrew and English;
  - microphone and overlay permissions blocked on Android;
  - dark splash screen, new icon set.
- `eas.json`:
  - build numbers managed by EAS (`appVersionSource: remote`, auto-increment on production builds);
  - `production` builds an Android App Bundle and an App Store build with `EXPO_PUBLIC_API_URL=https://api.peakmode.app`;
  - `preview` builds an installable Android APK against the same API;
  - `submit` targets TestFlight and the Play **internal** track as a **draft**.
- The release JS bundles for iOS and Android were exported and contain only the HTTPS API URL. The LAN address is used only in development builds.

## 1. Deploy the API (blocking)

Release builds call `https://api.peakmode.app`. Until it resolves to a running server, sign-in shows a network error.

Server environment for production:
- `NODE_ENV=production`;
- `DATABASE_URL`;
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`;
- `GOOGLE_CLIENT_ID` (the **web** client ID);
- `SMTP_*`, with `SMTP_FROM=TrackMode <...>`;
- PayPlus production keys;
- `TRUST_PROXY=1` behind a load balancer;
- `CORS_ORIGINS` only if you also host the web app.

Other server requirements:
- **Database:** run `npx prisma migrate deploy` on it.
- **Storage:** `storage/` (food images, progress photos) must be on a persistent volume.
- **Reference data (optional):** `scripts/import-market-references.ts` loads supermarket barcode references.

If you choose a different domain, change `EXPO_PUBLIC_API_URL` in `eas.json` and the URLs in `store/listing.md` and the About screen.

## 2. Google Sign-In for the new identifier (blocking for Google Sign-In)

In Google Cloud Console → APIs & Services → Credentials, same project as the existing web client:

1. Create an **iOS** OAuth client with bundle ID `com.peakmode.app`. Replace:
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (below);
   - `iosUrlScheme` in `app.json` with that client's reversed client ID. The current value belongs to a client made for the old bundle ID.
2. Create an **Android** OAuth client for package `com.peakmode.app` with the **SHA-1** of:
   - the EAS upload key: `npx eas-cli credentials -p android`, then Keystore;
   - the **Play app signing** key: Play Console → Test and release → App integrity.
   Create one Android client per SHA-1.
3. Add both client IDs as EAS environment variables (production and preview). They are public identifiers, not secrets:
   ```
   npx eas-cli env:create --environment production --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value <web client id> --visibility plaintext
   npx eas-cli env:create --environment production --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value <new iOS client id> --visibility plaintext
   ```
   Repeat with `--environment preview`.

## 3. Apple

1. **Apple Developer → Identifiers:** register App ID `com.peakmode.app`. No extra capabilities are needed: no push, no Sign in with Apple, no HealthKit.
2. **App Store Connect → Apps → New App:**
   - platform iOS, name **TrackMode**, primary language Hebrew (or English);
   - bundle ID `com.peakmode.app`, SKU `peakmode-ios`.
   - Copy the numeric Apple ID into `eas.json` → `submit.production.ios.ascAppId`, and fill in `appleId` and `appleTeamId`.
3. **Build and upload:**
   ```
   cd client
   npx eas-cli login
   npx eas-cli build --platform ios --profile production
   npx eas-cli submit --platform ios --profile production --latest
   ```
   Let EAS create the distribution certificate and provisioning profile when asked.
4. **TestFlight:**
   - add yourself under Internal Testing (up to 100 App Store Connect users; no review needed);
   - answer the export compliance question if shown (already declared in the build).
5. **Before any external TestFlight group or public review:**
   - App Privacy answers from `store/privacy.md`;
   - age rating 4+;
   - category Health & Fitness;
   - a demo account for review;
   - and **the payments issue below**.

## 4. Google Play

1. **Play Console → Create app:**
   - name **TrackMode**, default language Hebrew (he-IL), app;
   - free, with in-app purchases if you keep Pro.
2. **Set up the app:**
   - privacy policy URL;
   - app access: a demo account for review;
   - ads: **No**;
   - content rating questionnaire;
   - target audience: 18+, or 13+ if you prefer;
   - Data safety from `store/privacy.md`;
   - government app: no;
   - health apps declaration: nutrition and weight tracking, not a medical device.
3. **Store listing:** text and graphics from `store/listing.md` in Hebrew and English.
4. **Build and upload:**
   ```
   npx eas-cli build --platform android --profile production
   ```
   - Upload the first `.aab` **manually** to Test and release → Testing → Internal testing. Google requires the first upload by hand.
   - Accept Play App Signing.
   - For later builds, create a service account with release permissions, save its JSON key as `client/secrets/google-play-service-account.json` (git-ignored), and run:
     ```
     npx eas-cli submit --platform android --profile production --latest
     ```
     It goes to the internal track as a draft.
5. **Testers:** add tester emails to the internal testing list and share the opt-in link.

## 5. Device smoke test (on the TestFlight and internal builds)

- [ ] App name and icon on the home screen read TrackMode
- [ ] Sign up with email, sign out, sign in again
- [ ] Google Sign-In on iPhone and on Android
- [ ] Barcode scan: grant camera permission, scan a product, add it to a meal
- [ ] Hebrew and English: switch language, restart, check right-to-left layout
- [ ] Reminder notification permission and a test reminder
- [ ] Settings → Account & Security → Delete account: then confirm sign-in fails

## Must be resolved before any public release

**In-app payments.** TrackMode Pro is sold through PayPlus checkout. Apple (App Review Guideline 3.1.1) and Google Play (Payments policy) require their own in-app purchase systems for digital subscriptions used in the app. Internal testing is not reviewed, so it can proceed. Public review would be rejected. Options:
- implement StoreKit and Play Billing (for example with RevenueCat);
- or hide purchasing in the mobile apps and sell Pro only on the web. That still needs care with Apple's rules on linking out.

**Other blockers for public release:**
- live privacy, support, terms and account-deletion pages;
- a production API with backups;
- screenshots captured on real devices;
- your approval.
