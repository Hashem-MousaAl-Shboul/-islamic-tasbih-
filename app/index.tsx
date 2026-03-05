import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';

export default function Index() {
  const [checked, setChecked] = useState<boolean>(false);
  const [seen, setSeen] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SEEN_KEY)
      .then((val) => {
        setSeen(val === 'true');
        setChecked(true);
      })
      .catch(() => {
        setChecked(true);
      });
  }, []);

  if (!checked) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#D4A54A" />
      </View>
    );
  }

  if (!seen) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(tabs)/tasbih" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1A14',
  },
});
