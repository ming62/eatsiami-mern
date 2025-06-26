import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { API_URL } from "../../constants/api";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  ChannelHeader,
} from "stream-chat-react-native";
import { useAuthStore } from "../../store/authStore";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;

export default function ChatPage() {
  const router = useRouter();
  const {
    friendId: targetUserId,
    friendName,
    friendImage,
  } = useLocalSearchParams();

  const { token, user } = useAuthStore();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("📦 ENV | STREAM_API_KEY:", STREAM_API_KEY);
  console.log("👤 AuthStore | user:", user);
  console.log("🔐 AuthStore | token:", token);
  console.log("📨 Params | targetUserId:", targetUserId);
  console.log("📨 Params | friendName:", friendName);
  console.log("📨 Params | friendImage:", friendImage);

  const fetchStreamToken = async () => {
    try {
      console.log("📡 Fetching stream token from:", `${API_URL}/chat/token`);
      const res = await fetch(`${API_URL}/chat/token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("❌ Token fetch failed with response:", err);
        throw new Error("Failed to get Stream token");
      }

      const data = await res.json();
      console.log("✅ Got Stream token:", data.token);
      return data.token;
    } catch (err) {
      console.error("❌ Error fetching Stream token:", err);
      return null;
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!user || !token || !targetUserId) {
        console.warn("⚠️ Missing required data to init chat");
        return;
      }

      console.log("⚙️ Initializing chat for user:", user.id);

      setLoading(true);
      const streamToken = await fetchStreamToken();
      if (!streamToken) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        console.log("⚙️ Connecting user to Stream...");

        await client.connectUser(
          {
            id: user.id,
            name: user.username,
            image: user.profileImage,
          },
          streamToken
        );

        const channelId = [user.id, targetUserId].sort().join("-");
        console.log("💬 Using channelId:", channelId);

        const chatChannel = client.channel("messaging", channelId, {
          members: [user.id, targetUserId],
        });

        console.log("👀 Watching channel...");
        await chatChannel.watch();

        setChatClient(client);
        setChannel(chatChannel);
        console.log("✅ Chat initialized successfully");
      } catch (err) {
        console.error("❌ Failed to connect to Stream Chat:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        console.log("🔌 Disconnecting Stream client...");
        chatClient.disconnectUser();
      }
    };
  }, [user]);

  if (loading || !chatClient || !channel) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <View style={styles.chatContainer}>
          <ChannelHeader
            title={friendName}
            additionalProps={{
              avatarImage: friendImage,
            }}
          />
          <MessageList />
          <MessageInput />
        </View>
      </Channel>
    </Chat>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    flex: 1,
  },
});
