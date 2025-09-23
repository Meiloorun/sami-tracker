import FeedingButton from '@/components/feeding-button';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';


export default function HomeScreen() {
  const [lastFeeding, setLastFeeding] = useState<Date | null>(null);
  const router = useRouter();

  return (
    <FeedingButton />
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
