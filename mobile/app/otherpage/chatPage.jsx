import { useEffect, useState, useRef } from "react";
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

export default function ChatPage() {
  const router = useRouter();
  const { friendId, friendName, friendImage } = useLocalSearchParams();
  const { token, user } = useAuthStore();
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
    isMountedRef.current = true;

    const initChat = async () => {
      if (!user || !friendId) return;

      setLoading(true);
      try {
        const channelId = [user.id, friendId].sort().join("-");
        console.log("Creating/watching channel:", channelId);

        const chatChannel = clientRef.current.channel("messaging", channelId, {
          members: [user.id, friendId],
        });

        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (err) {
        console.error("[ChatPage] Failed to initialize channel:", err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initChat();
  }, [user?.id, friendId]);

  if (loading || !channel) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading chat...</Text>
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
          <Chat client={clientRef.current}>
            <Channel 
              channel={channel}
              MessageSimple={CustomMessageSimple}
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

                <MessageInput
                  additionalTextInputProps={{
                    placeholder: "Type a message...",
                  }}
                />
              </View>
            </Channel>
          </Chat>
        </OverlayProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}