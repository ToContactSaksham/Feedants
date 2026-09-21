import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import { formatRupees } from '../utils/format';

const ICONS = { 1: '🏆', 2: '🥈', 3: '🥉' };

export default function RewardsCard({ rewards = [] }) {
  if (!rewards.length) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Rewards <Text style={styles.subtitle}>(All Positions)</Text>
      </Text>
      {rewards.map((r) => (
        <View key={r.position} style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.icon}>{ICONS[r.position] || '⭐'}</Text>
            <Text style={styles.label}>{r.label}</Text>
          </View>
          <Text style={styles.amount}>{formatRupees(r.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm },
  subtitle: { fontSize: 12, fontWeight: '400', color: colors.navySoft },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 15 },
  label: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  amount: { fontSize: 14, color: colors.teal, fontWeight: '700' },
});
