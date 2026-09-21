import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';

export default function JudgeCard({ judge }) {
  if (!judge) return null;
  return (
    <View style={styles.card}>
      {judge.photoUrl ? (
        <Image source={{ uri: judge.photoUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{judge.name?.[0] || '?'}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.role}>Judge</Text>
        <Text style={styles.name}>{judge.name}</Text>
        {!!judge.title && <Text style={styles.sub}>{judge.title}</Text>}
        {!!judge.experience && <Text style={styles.sub}>{judge.experience}</Text>}
      </View>
      {!!judge.introVideoUrl && (
        <TouchableOpacity style={styles.playWrap} onPress={() => Linking.openURL(judge.introVideoUrl)}>
          <View style={styles.playCircle}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <Text style={styles.playLabel}>Intro Video</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: spacing.md },
  avatarFallback: { backgroundColor: colors.tealLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.teal, fontWeight: '700', fontSize: 20 },
  info: { flex: 1 },
  role: { fontSize: 12, color: colors.navySoft },
  name: { fontSize: 16, fontWeight: '700', color: colors.navy },
  sub: { fontSize: 12, color: colors.navySoft, marginTop: 1 },
  playWrap: { alignItems: 'center' },
  playCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.tealLight, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: colors.teal, fontSize: 14 },
  playLabel: { fontSize: 10, color: colors.navySoft, marginTop: 4 },
});
