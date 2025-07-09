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
import { chatClient } from "../../lib/chatClient";
import styles from "../../assets/styles/chat.styles";
import {
  OverlayProvider,
  Chat,
  Channel,
  MessageList,
  MessageInput,
} from "stream-chat-react-native";
import { useAuthStore } from "../../store/authStore";

export default function ChatPage() {
  const router = useRouter();
  const { friendId, friendName, friendImage } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      if (!user || !friendId) return;

      setLoading(true);
      try {
        const channelId = [user.id, friendId].sort().join("-");
        const chatChannel = chatClient.channel("messaging", channelId, {
          members: [user.id, friendId],
        });

        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (err) {
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
            <Channel channel={channel}>
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
