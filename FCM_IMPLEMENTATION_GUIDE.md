# Firebase Cloud Messaging - Quick Start Guide

**Goal:** Implement push notifications for CivicLens mobile app in 1 day

---

## 📋 PREREQUISITES

- [ ] Google account for Firebase Console
- [ ] Access to civiclens-backend repository
- [ ] Access to civiclens-mobile repository
- [ ] Physical Android/iOS device for testing (emulators don't support push)

---

## STEP 1: Firebase Project Setup (30 minutes)

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `CivicLens`
4. Disable Google Analytics (optional for now)
5. Click "Create project"

### 1.2 Add Android App

1. In Firebase Console, click "Add app" → Android icon
2. Android package name: `com.civiclens.mobile` (check your app.json)
3. App nickname: `CivicLens Mobile Android`
4. Skip SHA-1 for now
5. Download `google-services.json`
6. Save to: `d:\Civiclens\civiclens-mobile\google-services.json`

### 1.3 Add iOS App

1. Click "Add app" → iOS icon
2. iOS bundle ID: `com.civiclens.mobile` (check your app.json)
3. App nickname: `CivicLens Mobile iOS`
4. Download `GoogleService-Info.plist`
5. Save to: `d:\Civiclens\civiclens-mobile\GoogleService-Info.plist`

### 1.4 Enable Cloud Messaging

1. In Firebase Console, go to "Project settings" → "Cloud Messaging"
2. Click "Cloud Messaging API" → Enable
3. Note: Firebase Cloud Messaging API (V1) is already enabled by default

### 1.5 Get Service Account Key (for Backend)

1. In Firebase Console, go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download JSON file
4. Rename to `firebase-service-account.json`
5. Save to: `d:\Civiclens\civiclens-backend\firebase-service-account.json`
6. **IMPORTANT:** Add to `.gitignore`:
   ```
   firebase-service-account.json
   ```

---

## STEP 2: Backend Implementation (2 hours)

### 2.1 Install Firebase Admin SDK

```bash
cd d:\Civiclens\civiclens-backend
.venv\Scripts\activate
pip install firebase-admin
pip freeze > requirements.txt
```

### 2.2 Update Environment Variables

Add to `d:\Civiclens\civiclens-backend\.env`:
```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
ENABLE_PUSH_NOTIFICATIONS=True
```

### 2.3 Create Database Migration

```bash
cd d:\Civiclens\civiclens-backend
alembic revision -m "add_fcm_tokens_to_users"
```

**Edit the migration file:**
```python
# alembic/versions/XXXXX_add_fcm_tokens_to_users.py
def upgrade():
    op.add_column('users', sa.Column('fcm_tokens', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('push_notifications_enabled', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('users', sa.Column('last_push_sent_at', sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column('users', 'last_push_sent_at')
    op.drop_column('users', 'push_notifications_enabled')
    op.drop_column('users', 'fcm_tokens')
```

**Run migration:**
```bash
alembic upgrade head
```

### 2.4 Update User Model

Add to `d:\Civiclens\civiclens-backend\app\models\user.py`:
```python
class User(BaseModel):
    # ... existing fields ...
    
    # FCM Push Notifications
    fcm_tokens = Column(JSON, default=list, nullable=True)
    push_notifications_enabled = Column(Boolean, default=True, nullable=False)
    last_push_sent_at = Column(DateTime(timezone=True), nullable=True)
```

### 2.5 Create Push Notification Service

Create file: `d:\Civiclens\civiclens-backend\app\services\push_notification_service.py`

```python
"""
Push Notification Service using Firebase Cloud Messaging
"""
import os
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from firebase_admin import credentials, messaging, initialize_app
import firebase_admin
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger(__name__)


class PushNotificationService:
    """Service for sending push notifications via FCM"""
    
    _initialized = False
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self._initialize_firebase()
    
    @classmethod
    def _initialize_firebase(cls):
        """Initialize Firebase Admin SDK (only once)"""
        if cls._initialized:
            return
        
        if not settings.ENABLE_PUSH_NOTIFICATIONS:
            logger.warning("Push notifications are disabled in settings")
            return
        
        try:
            # Check if already initialized
            if not firebase_admin._apps:
                service_account_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
                if not os.path.exists(service_account_path):
                    logger.error(f"Firebase service account file not found: {service_account_path}")
                    return
                
                cred = credentials.Certificate(service_account_path)
                initialize_app(cred)
                logger.info("✅ Firebase Admin SDK initialized successfully")
            
            cls._initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
    
    async def send_to_user(
        self,
        user_id: int,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        priority: str = 'high',
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send push notification to all devices of a user
        
        Args:
            user_id: User ID to send notification to
            title: Notification title
            body: Notification body/message
            data: Optional data payload
            priority: 'high' or 'normal'
            image_url: Optional image URL for rich notifications
        
        Returns:
            Dict with success count and failure details
        """
        if not self._initialized:
            logger.warning("Firebase not initialized, skipping push notification")
            return {"success": False, "message": "FCM not initialized"}
        
        try:
            # Get user from database
            result = await self.db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                logger.warning(f"User {user_id} not found")
                return {"success": False, "message": "User not found"}
            
            if not user.push_notifications_enabled:
                logger.info(f"Push notifications disabled for user {user_id}")
                return {"success": False, "message": "Push disabled by user"}
            
            if not user.fcm_tokens or len(user.fcm_tokens) == 0:
                logger.info(f"No FCM tokens for user {user_id}")
                return {"success": False, "message": "No FCM tokens"}
            
            # Prepare messages for all tokens
            messages = []
            for token in user.fcm_tokens:
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=title,
                        body=body,
                        image=image_url
                    ),
                    data=data or {},
                    token=token,
                    android=messaging.AndroidConfig(
                        priority=priority,
                        notification=messaging.AndroidNotification(
                            sound='default',
                            channel_id='civiclens_notifications',
                            color='#007AFF',
                            default_sound=True,
                            default_vibrate_timings=True
                        )
                    ),
                    apns=messaging.APNSConfig(
                        payload=messaging.APNSPayload(
                            aps=messaging.Aps(
                                sound='default',
                                badge=await self._get_unread_count(user_id)
                            )
                        )
                    )
                )
                messages.append(message)
            
            # Send batch
            response = messaging.send_all(messages)
            
            # Handle invalid tokens
            invalid_tokens = []
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    error_msg = str(resp.exception) if resp.exception else "Unknown error"
                    logger.warning(f"Failed to send to token {idx}: {error_msg}")
                    
                    # Remove invalid tokens
                    if any(phrase in error_msg.lower() for phrase in [
                        'registration-token-not-registered',
                        'invalid-registration-token',
                        'invalid-argument'
                    ]):
                        invalid_tokens.append(user.fcm_tokens[idx])
            
            # Clean up invalid tokens
            if invalid_tokens:
                user.fcm_tokens = [t for t in user.fcm_tokens if t not in invalid_tokens]
                logger.info(f"Removed {len(invalid_tokens)} invalid tokens for user {user_id}")
            
            # Update last push sent time
            user.last_push_sent_at = datetime.utcnow()
            await self.db.commit()
            
            logger.info(
                f"Sent push notification to user {user_id}: "
                f"{response.success_count} succeeded, {response.failure_count} failed"
            )
            
            return {
                "success": response.success_count > 0,
                "success_count": response.success_count,
                "failure_count": response.failure_count,
                "invalid_tokens_removed": len(invalid_tokens)
            }
            
        except Exception as e:
            logger.error(f"Error sending push notification: {e}")
            return {"success": False, "message": str(e)}
    
    async def _get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for badge"""
        from app.models.notification import Notification
        result = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        return len(result.scalars().all())
```

### 2.6 Update Config

Add to `d:\Civiclens\civiclens-backend\app\core\config.py`:
```python
class Settings(BaseSettings):
    # ... existing settings ...
    
    # Firebase
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "./firebase-service-account.json"
    ENABLE_PUSH_NOTIFICATIONS: bool = True
```

### 2.7 Add FCM Token Management API

Add to `d:\Civiclens\civiclens-backend\app\api\v1\users.py`:
```python
from pydantic import BaseModel

class FCMTokenRequest(BaseModel):
    token: str

@router.post("/fcm-token", response_model=dict)
async def register_fcm_token(
    token_data: FCMTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register FCM token for push notifications"""
    token = token_data.token.strip()
    
    if not token:
        raise HTTPException(status_code=400, detail="Token cannot be empty")
    
    # Add token if not already present
    current_tokens = current_user.fcm_tokens or []
    if token not in current_tokens:
        current_user.fcm_tokens = current_tokens + [token]
        await db.commit()
        logger.info(f"Registered FCM token for user {current_user.id}")
    else:
        logger.info(f"FCM token already registered for user {current_user.id}")
    
    return {
        "success": True,
        "message": "FCM token registered successfully",
        "token_count": len(current_user.fcm_tokens)
    }

@router.delete("/fcm-token/{token}", response_model=dict)
async def unregister_fcm_token(
    token: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove FCM token"""
    if current_user.fcm_tokens and token in current_user.fcm_tokens:
        current_user.fcm_tokens = [t for t in current_user.fcm_tokens if t != token]
        await db.commit()
        logger.info(f"Unregistered FCM token for user {current_user.id}")
    
    return {
        "success": True,
        "message": "FCM token removed successfully",
        "token_count": len(current_user.fcm_tokens or [])
    }
```

### 2.8 Integrate with Notification Service

Update `d:\Civiclens\civiclens-backend\app\services\notification_service.py`:
```python
from app.services.push_notification_service import PushNotificationService

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.push_service = PushNotificationService(db)
    
    async def create_notification(
        self,
        user_id: int,
        type: NotificationType,
        title: str,
        message: str,
        # ... existing params ...
    ) -> Notification:
        # Create in-app notification
        notification = Notification(...)
        self.db.add(notification)
        await self.db.flush()
        
        # ✨ Send push notification
        await self.push_service.send_to_user(
            user_id=user_id,
            title=title,
            body=message,
            data={
                'notification_id': str(notification.id),
                'type': str(type),
                'action_url': action_url or '',
                'related_report_id': str(related_report_id) if related_report_id else '',
                'priority': str(priority)
            },
            priority='high' if priority in [NotificationPriority.HIGH, NotificationPriority.CRITICAL] else 'normal'
        )
        
        return notification
```

---

## STEP 3: Mobile App Implementation (3 hours)

### 3.1 Install Dependencies

```bash
cd d:\Civiclens\civiclens-mobile
npx expo install expo-notifications expo-device
```

### 3.2 Configure app.json

Update `d:\Civiclens\civiclens-mobile\app.json`:
```json
{
  "expo": {
    "name": "CivicLens",
    "android": {
      "package": "com.civiclens.mobile",
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "ios": {
      "bundleIdentifier": "com.civiclens.mobile",
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification.wav"],
          "mode": "production"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#000000",
      "iosDisplayInForeground": true
    }
  }
}
```

### 3.3 Create Notification Icon

Create 96x96 white icon on transparent background:
- Save as `d:\Civiclens\civiclens-mobile\assets\notification-icon.png`

### 3.4 Create Push Notification Service

Create file: `d:\Civiclens\civiclens-mobile\src\shared\services\pushNotificationService.ts`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from './api/apiClient';

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  private notificationListener: any;
  private responseListener: any;
  private token: string | null = null;

  /**
   * Initialize push notifications
   * Call this when user logs in
   */
  async initialize(): Promise<string | null> {
    try {
      // Only works on physical devices
      if (!Device.isDevice) {
        console.log('⚠️ Push notifications only work on physical devices');
        return null;
      }

      // Check/request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permission denied');
        return null;
      }

      // Get Expo push token
      this.token = await this.getExpoPushToken();
      
      if (this.token) {
        // Register with backend
        await this.registerTokenWithBackend(this.token);
        
        // Setup listeners
        this.setupListeners();
        
        console.log('✅ Push notifications initialized');
      }

      return this.token;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Get Expo push token
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      // For Android - set notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('civiclens_notifications', {
          name: 'CivicLens Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'YOUR_EXPO_PROJECT_ID' // Get from app.json extra.eas.projectId
      })).data;
      
      console.log('📱 Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.post('/users/fcm-token', { token });
      console.log('✅ FCM token registered with backend');
    } catch (error) {
      console.error('❌ Failed to register FCM token:', error);
      throw error;
    }
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(): void {
    // Received notification while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
        
        // Update badge count
        const badge = notification.request.content.badge;
        if (badge !== undefined) {
          Notifications.setBadgeCountAsync(badge);
        }
      }
    );

    // User tapped on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        
        const data = response.notification.request.content.data;
        this.handleNotificationTap(data);
      }
    );
  }

  /**
   * Handle notification tap - navigate to relevant screen
   */
  private handleNotificationTap(data: any): void {
    console.log('Navigation data:', data);
    
    // TODO: Implement navigation logic
    // Example:
    // if (data.action_url) {
    //   navigation.navigate(parseActionUrl(data.action_url));
    // }
  }

  /**
   * Update badge count manually
   */
  async updateBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Unregister from push notifications
   * Call this when user logs out
   */
  async unregister(): Promise<void> {
    if (this.token) {
      try {
        await apiClient.delete(`/users/fcm-token/${encodeURIComponent(this.token)}`);
        console.log('✅ FCM token unregistered');
      } catch (error) {
        console.error('❌ Failed to unregister FCM token:', error);
      }
    }
    
    this.cleanup();
    this.token = null;
  }
}

export const pushNotificationService = new PushNotificationService();
```

### 3.5 Initialize in App

Update `d:\Civiclens\civiclens-mobile\App.tsx`:
```typescript
import { pushNotificationService } from '@shared/services/pushNotificationService';

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize push notifications when user logs in
      pushNotificationService.initialize();
    }

    return () => {
      if (user) {
        pushNotificationService.cleanup();
      }
    };
  }, [user]);

  // ... rest of app
}
```

### 3.6 Handle Logout

Update logout function to unregister:
```typescript
const logout = async () => {
  await pushNotificationService.unregister();
  // ... rest of logout logic
};
```

---

## STEP 4: Testing (1 hour)

### 4.1 Test on Physical Device

```bash
cd d:\Civiclens\civiclens-mobile
npx expo start

# Scan QR code with Expo Go app on your phone
# OR build development client:
eas build --profile development --platform android
```

### 4.2 Test Push Notification

**Method 1: Via API**
```bash
# Create a test notification
curl -X POST "http://localhost:8000/api/v1/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "type": "status_change",
    "title": "Test Notification",
    "message": "This is a test push notification",
    "priority": "high"
  }'
```

**Method 2: Via Expo**
```bash
# Send test push via Expo
curl -X POST "https://exp.host/--/api/v2/push/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_EXPO_PUSH_TOKEN",
    "title": "Test",
    "body": "Test message",
    "sound": "default"
  }'
```

### 4.3 Verify Everything Works

- [ ] App requests notification permission on first login
- [ ] FCM token is registered with backend
- [ ] Push notification appears when sent from backend
- [ ] Tapping notification opens the app
- [ ] Badge count updates correctly
- [ ] Token is removed on logout

---

## STEP 5: Production Deployment

### 5.1 Environment Variables

Add to production `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
ENABLE_PUSH_NOTIFICATIONS=True
```

### 5.2 Security Checklist

- [ ] Firebase service account JSON is in `.gitignore`
- [ ] Production credentials are stored securely (not in repo)
- [ ] FCM tokens are never logged in production
- [ ] Rate limiting is enabled on notification endpoints

### 5.3 Monitoring

Add logs to track:
- Push notification send rate
- Delivery success rate
- Invalid token removal rate
- User opt-out rate

---

## 🎯 SUCCESS CRITERIA

- [✅] Firebase project created
- [✅] Backend can send push notifications
- [✅] Mobile app receives push notifications
- [✅] Notifications work on both Android and iOS
- [✅] Badge counts update correctly
- [✅] Tapping notification navigates to correct screen
- [✅] Tokens are managed properly (add/remove on login/logout)

---

## 🐛 TROUBLESHOOTING

**"No FCM token received"**
- Make sure you're using a physical device (not emulator)
- Check permissions are granted
- Check Expo project ID in app.json

**"Backend can't send notifications"**
- Verify firebase-service-account.json path is correct
- Check Firebase Cloud Messaging API is enabled
- Check logs for errors

**"Notification doesn't appear"**
- Check device notification settings
- Verify notification channel is created (Android)
- Check if notification is silent/low priority

**"App crashes on notification tap"**
- Check navigation logic
- Verify deep link parsing

---

**Total Time:** ~6 hours
**Status:** Ready to implement! 🚀
