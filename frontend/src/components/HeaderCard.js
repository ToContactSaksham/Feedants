import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import { formatRupees } from '../utils/format';

export default function HeaderCard({ competition }) {
  const { title, tags = [], category = [], hasCertificate, prizePool, entryFee, spots, viewer } = competition;
  const chips = [...category, ...tags];
  const spotsPct = spots.max > 0 ? Math.min((spots.booked / spots.max) * 100, 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {viewer.isRegistered && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ Registered</Text>
          </View>
        )}
      </View>

      <View style={styles.chipRow}>
        {chips.map((chip) => (
          <View key={chip} style={styles.chip}>
            <Text style={styles.chipText}>{chip}</Text>
          </View>
        ))}
        {hasCertificate && (
          <View style={styles.certRow}>
            <Text style={styles.certText}>🏆 Winners get certificate</Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Prize Pool</Text>
          <Text style={styles.infoValue}>{formatRupees(prizePool)}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Entry Fee</Text>
          <Text style={styles.infoValue}>{formatRupees(entryFee)}</Text>
        </View>
        <View style={[styles.infoCol, { flex: 1.4 }]}>
          <Text style={styles.spotsLabel}>
            {spots.isFull ? 'Registration full' : `👥 Only ${spots.left} spots left`}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${spotsPct}%` }]} />
          </View>
          <Text style={styles.spotsSub}>
            {spots.booked} / {spots.max} Booked
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.navy, marginRight: spacing.sm },
  badge: { backgroundColor: colors.tealBadgeBg, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { color: colors.teal, fontWeight: '600', fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: spacing.sm, gap: 8 },
  chip: { backgroundColor: '#EEF1F3', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, color: colors.navySoft, fontWeight: '600' },
  certRow: {},
  certText: { fontSize: 12, color: colors.teal, fontWeight: '600' },
  infoRow: { flexDirection: 'row', marginTop: spacing.lg },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 12, color: colors.navySoft },
  infoValue: { fontSize: 18, fontWeight: '700', color: colors.teal, marginTop: 2 },
  spotsLabel: { fontSize: 12, color: colors.teal, fontWeight: '600' },
  progressTrack: { height: 5, backgroundColor: '#DDE6E5', borderRadius: radii.pill, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: colors.teal, borderRadius: radii.pill },
  spotsSub: { fontSize: 11, color: colors.navySoft, marginTop: 4 },
});
