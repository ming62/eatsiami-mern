import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../constants/api";
import { fetchNotificationCount } from "../hooks/countNotifications";
import { useNotificationStore } from "../store/notificationStore";
import { Tabs, useRouter } from "expo-router";

const NotificationContext = createContext(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const { user, token } = useAuthStore();
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();
  const setBadgeCount = useNotificationStore((state) => state.setBadgeCount);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token);
      },
      (err) => {
        setError(err);
      }
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification Received: ", notification);
        setNotification(notification);
        fetchNotificationCount(token, setBadgeCount);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "Notification Response: ",
          JSON.stringify(response, null, 2),
          JSON.stringify(response.notification.request.content.data, null, 2)
        );
        fetchNotificationCount(token, setBadgeCount);
        router.push("/(tabs)/notification");
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }

      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    const sendTokenToBackend = async () => {
      if (!expoPushToken || !token) return;

      try {
        await fetch(`${API_URL}/users/save-push-token`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ expoPushToken }),
        });
        console.log("Push token sent to backend!");
      } catch (err) {
        console.error("Failed to send push token to backend:", err);
      }
    };

    sendTokenToBackend();
  }, [expoPushToken, token]);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
