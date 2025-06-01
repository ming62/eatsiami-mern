import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function Index() {

    const { logout } = useAuthStore();
    
    return (
        <View>
            <Text>index</Text>

            <TouchableOpacity onPress={logout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}