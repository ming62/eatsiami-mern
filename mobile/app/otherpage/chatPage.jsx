import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { chatClient } from "../../lib/chatClient";
import styles from "../../assets/styles/chat.styles";
import {
  OverlayProvider,
  Chat,
  Channel,
  MessageList,
  MessageInput,
  MessageSimple,
  useMessageContext,
} from "stream-chat-react-native";
import { useAuthStore } from "../../store/authStore";
import FoodcardMessage from "../../components/FoodcardMessage";
import COLORS from "../../constants/colors";
import { DeepPartial, Theme } from "stream-chat-react-native";

export default function ChatPage() {
  const router = useRouter();
  const { friendId, friendName, friendImage } = useLocalSearchParams();

  const { token, user } = useAuthStore();
  console.log("user", user);
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

  const CustomMessageSimple = (props) => {
    const { message } = useMessageContext();

    if (
      message?.attachments &&
      Array.isArray(message.attachments) &&
      message.attachments.length > 0
    ) {
      const attachment = message.attachments[0];
      if (attachment?.type === "foodcard") {
        return <FoodcardMessage message={message} />;
      }
    }

    return <MessageSimple {...props} />;
  };

  useEffect(() => {
    const initChat = async () => {
      if (!user || !token || !friendId) return;
      if (!user || !friendId) return;

      setLoading(true);
      const streamToken = await fetchStreamToken();
      if (!streamToken) return;

      try {
        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: user.id,
              name: user.username,
              image: user.profileImage,
            },
            streamToken
          );
        }

        const channelId = [user.id, friendId].sort().join("-");

        const chatChannel = chatClient.channel("messaging", channelId, {
          members: [user.id, friendId],
        });

        await chatChannel.watch();
        setChannel(chatChannel);
      } catch {
        console.error("[ChatPage] Failed to initialize channel:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [user?.id, friendId]);

  if (loading || !channel) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 35}
      >
        <OverlayProvider>
          <Chat client={chatClient}>
            <Channel
              channel={channel}
              MessageSimple={CustomMessageSimple}
              myMessageTheme={{
                messageSimple: {
                  content: {
                    containerInner: {
                      backgroundColor: COLORS.primary + 30,
                    },
                  },
                },
              }}
            >
              <View style={styles.chatContainer}>
                <View style={styles.customHeader}>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/otherpage/friendDetail?friendId=${friendId}`
                      )
                    }
                    style={styles.centerContent}
                  >
                    <Image
                      source={{ uri: friendImage }}
                      style={styles.avatar}
                    />
                    <Text style={styles.friendName}>{friendName}</Text>
                  </TouchableOpacity>

                  <View style={styles.rightSpace} />
                </View>
                <MessageList />
                <MessageInput />
              </View>
            </Channel>
          </Chat>
        </OverlayProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
