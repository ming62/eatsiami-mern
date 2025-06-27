import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { StreamChat } from "stream-chat";
import {
  OverlayProvider,
  Chat,
  Channel,
  MessageList,
  MessageInput,
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

  const fetchStreamToken = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to get Stream token");

      const data = await res.json();
      return data.token;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!user || !token || !targetUserId) return;

      setLoading(true);
      const streamToken = await fetchStreamToken();
      if (!streamToken) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: user.id,
            name: user.username,
            image: user.profileImage,
          },
          streamToken
        );

        const channelId = [user.id, targetUserId].sort().join("-");
        const chatChannel = client.channel("messaging", channelId, {
          members: [user.id, targetUserId],
        });

        await chatChannel.watch();

        setChatClient(client);
        setChannel(chatChannel);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
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
    <OverlayProvider>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <View style={styles.chatContainer}>
            <View style={styles.customHeader}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Image source={{ uri: friendImage }} style={styles.avatar} />
              <Text style={styles.friendName}>{friendName}</Text>
            </View>
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
