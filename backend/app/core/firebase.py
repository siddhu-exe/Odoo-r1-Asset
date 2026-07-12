import asyncio
import base64
import json

from app.core.config import settings


_initialized: bool = False


# Call once at startup. Silently skips if FIREBASE_CREDENTIALS_BASE64 is not set.
def initialize_firebase() -> None:
    global _initialized
    if not settings.FIREBASE_CREDENTIALS_BASE64:
        return

    import firebase_admin
    from firebase_admin import credentials

    service_account_info = json.loads(
        base64.b64decode(settings.FIREBASE_CREDENTIALS_BASE64).decode()
    )
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)
    _initialized = True


# Sends a FCM push notification. Runs the blocking SDK call off the event loop.
async def send_push_notification(fcm_token: str, title: str, body: str) -> None:
    if not _initialized:
        return

    from firebase_admin import messaging

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        token=fcm_token,
    )
    await asyncio.to_thread(messaging.send, message)
