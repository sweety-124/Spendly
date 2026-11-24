# Spendly

Spendly is a mobile expense tracker for recording bills, scanning receipts, and exporting expense reports.

## Features

- Add, edit, categorize, and review bills
- Scan a receipt with the camera or import an image from the photo library
- Extract receipt text on-device with ML Kit OCR, then review it before saving
- View expense reports and share CSV or PDF exports
- Store bills and custom categories locally in SQLite

## Requirements

- Node.js and npm
- Xcode for iOS development
- Android Studio and an Android SDK for Android development

Receipt scanning uses native modules, so use a development build rather than Expo Go.

## Getting started

```sh
npm install
npx expo start
```

For a native development build, run one of:

```sh
npx expo run:ios
npx expo run:android
```

The first native build requires the relevant platform tools. Expo generates the ignored `ios/` and `android/` native project directories locally as needed.

## Privacy and security

- Bill data and receipt images are processed and stored on the device; this app does not upload them to a Spendly backend.
- Camera access is used for receipt capture, and photo-library access is used to import receipt images.
- CSV and PDF files are created locally and shared only when you choose to use the device's share interface.
- CSV text fields that could be interpreted as spreadsheet formulas are escaped during export.
- Do not commit receipts, local databases, `.env` files, signing credentials, provisioning profiles, or generated native/build directories. These are excluded by `.gitignore`.

The current app identifier is a public app configuration value, not a credential. Configure your own signing identity locally when preparing a release.
