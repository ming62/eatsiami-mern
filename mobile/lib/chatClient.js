import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;
export const chatClient = StreamChat.getInstance(STREAM_API_KEY);

export function getChatClient() {
  return chatClient;
}

//connect stream user
export async function connectClient(streamToken, user) {
  if (!streamToken || !user) {
    console.warn("[connectClient] Missing token or user");
    return;
  }

  if (chatClient.userID) {
    console.log("[connectClient] Already connected as", chatClient.userID);
    return;
  }

  try {
    console.log("[connectClient] Connecting Stream chat client...");
    await chatClient.connectUser(
      {
        id: user.id,
        name: user.username,
        image: user.profileImage,
      },
      streamToken
    );
    console.log("[connectClient] Stream chat connected successfully");
  } catch (error) {
    console.error("[connectClient] Connection failed:", error.message);
  }
}

// Disconnect the user from Stream Chat
export async function disconnectClient() {
  try {
    console.log("[disconnectClient] Disconnecting Stream chat...");
    await chatClient.disconnectUser();
    console.log("[disconnectClient] Disconnected successfully");
  } catch (error) {
    console.error("[disconnectClient] Error disconnecting:", error.message);
  }
}
