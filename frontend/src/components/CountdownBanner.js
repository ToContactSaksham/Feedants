import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import { useCountdown } from '../hooks/useCountdown';
import { pad2 } from '../utils/format';

export default function CountdownBanner({ lifecycle, serverTimeOffsetMs }) {
  const { label, countdownTarget, code } = lifecycle;
  const countdown = useCountdown(countdownTarget, serverTimeOffsetMs);

  if (!countdownTarget) {
    return (
      <View style={[styles.banner, styles.done]}>
        <Text style={styles.label}>🏆 {label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Text style={styles.icon}>⏳</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.time}>
        {pad2(countdown.days)}d : {pad2(countdown.hours)}h : {pad2(countdown.minutes)}m : {pad2(countdown.seconds)}s
      </Text>
      {code === 'REGISTRATION_OPEN' && (
        <View style={styles.right}>
          <Text style={styles.hurry}>⏱ Hurry up!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.tealLight,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  done: { justifyContent: 'flex-start' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 14 },
  label: { color: colors.tealDark, fontWeight: '600', fontSize: 13 },
  time: { color: colors.navy, fontWeight: '700', fontSize: 14 },
  right: {},
  hurry: { color: colors.tealDark, fontSize: 12, fontWeight: '600' },
});
