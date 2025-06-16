import { View, Text } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function ProfilePage() {
  const { id } = useLocalSearchParams(); // get the id from the route

  return (
    <View>
      <Text>User Profile Page</Text>
      <Text>User ID: {id}</Text>
    </View>
  );
}
