# Integrations

## Tee Times

`TeeTimeProvider` returns normalized course, price, inventory, and reservation data. The MVP ships `SimulatedTeeTimeProvider` only. Real providers must use documented, authorized APIs.

## Handicap

`HandicapProvider` supports demo, manual, and future GHIN-backed implementations. `GhinHandicapProvider` does not call any endpoint and documents the credentials and authorization that would be required later.

## Payments

`SubscriptionProvider` supports mock development entitlements and a RevenueCat adapter seam. No production purchase is attempted without keys.

## Maps and Geocoding

`GeocodingProvider` and distance utilities keep location logic isolated. MVP search can operate on city, state, ZIP, and seeded coordinates.

## Notifications

`NotificationProvider` supports local reminders and in-app notifications first. Push token storage is represented in the database for future delivery.

