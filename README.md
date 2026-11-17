# bhe-ambassador-mobileapp-ui

## Device unlock preview

Run `python3 -m http.server 8001 --bind 127.0.0.1` and open
http://localhost:8001. After submitting the email sign-in form, choose
**Enable device unlock**. Profile also provides device-unlock management.
Reloading the preview opens the unlock screen when a local credential exists.
Password entry remains available; cancelling a device prompt never unlocks it.

This repository is a UI preview: email/Google login and all account data are
mocked. Device unlock uses a real platform WebAuthn prompt and locally verifies
an ES256 assertion, but is not production account authentication. Only the
credential ID and public key are stored, never passwords or biometric data.
Removing device unlock clears this browser's record; deleting the passkey itself
is done in the device's password/passkey settings. Use the same hostname for
setup and unlock. HTTPS or localhost and a supported platform authenticator are
required; the OS may use its PIN instead of biometrics.

Before production, register passkeys only after authenticated account login,
issue single-use challenges on the server, verify registrations and assertions
there (including origin, RP ID, flags and signature), bind credentials to the
account, and establish a secure server session. The preview screen picker and
mock login must not be used to protect real data.

Saved sign-in now defaults to 30 days in this preview. Uncheck **Keep me signed
in for 30 days** to limit it to the current browser tab. Returning users with
saved sign-in go to Home, or to device verification if device unlock is enabled.
Sign Out clears saved sign-in while retaining the optional passkey for future
explicit device sign-in. Storage holds only a demo expiry marker, not credentials
or a real authentication token. Production persistence requires secure server
sessions and refresh/revocation handling.
