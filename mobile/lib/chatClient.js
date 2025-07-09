import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;
export const chatClient = StreamChat.getInstance(STREAM_API_KEY);

chatClient.on("connection.changed", (event) => {
  console.log("Connection changed:", event.type);
});

chatClient.on("user.updated", (event) => {
  console.log("User updated:", event.user);
});

chatClient.on("connection.recovered", () => {
  console.log("Connection recovered");
});


export default chatClient;
