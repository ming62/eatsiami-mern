import { API_URL } from "../constants/api";

export const fetchNotificationCount = async (token, setBadgeCount) => {
  console.log("fetchNotificationCount called");

  if (!token) {
    console.warn(" No token provided. Skipping notification fetch.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/notification`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch friend requests");
    }

    const count =
      (data.pendingFriendReqs?.length || 0) +
      (data.pendingJioReqs?.length || 0);

    console.log("Notification count:", count);
    setBadgeCount(count);
  } catch (err) {
    console.error("Error fetching notification count:", err);
  }
};
