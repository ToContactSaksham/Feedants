import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';

export default function PreviousWinnersRow({ winners = [] }) {
  if (!winners.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
        {winners.map((w, idx) => (
          <TouchableOpacity
            key={`${w.name}-${idx}`}
            style={styles.item}
            disabled={!w.videoUrl}
            onPress={() => w.videoUrl && Linking.openURL(w.videoUrl)}
          >
            {w.photoUrl ? (
              <Image source={{ uri: w.photoUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbFallback]} />
            )}
            {!!w.videoUrl && (
              <View style={styles.playOverlay}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
              {w.name}
            </Text>
            <Text style={styles.position}>{w.positionLabel}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  item: { width: 88 },
  thumb: { width: 88, height: 100, borderRadius: radii.md },
  thumbFallback: { backgroundColor: '#EEE' },
  playOverlay: {
    position: 'absolute',
    top: 36,
    left: 34,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(14,124,116,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: colors.white, fontSize: 10 },
  name: { fontSize: 12, fontWeight: '600', color: colors.navy, marginTop: 6 },
  position: { fontSize: 11, color: colors.teal, fontWeight: '600' },
});
