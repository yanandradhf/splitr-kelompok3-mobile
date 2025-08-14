import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../../components/layout/Screen';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Home</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});