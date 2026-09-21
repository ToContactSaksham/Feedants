import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radii } from '../theme/colors';

export default function ReferEarnCard({ referral, referralCode, competitionSlug }) {
  const [copied, setCopied] = useState(false);
  if (!referral?.enabled) return null;

  const link = `https://feedants.com/r/${referralCode || 'referral'}?competition=${competitionSlug}`;

  async function handleCopy() {
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleShare() {
    try {
      await Share.share({ message: `Join me on Feedants! ${link}` });
    } catch (err) {
      Alert.alert('Could not open share sheet');
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>📣</Text>
      <View style={styles.body}>
        <Text style={styles.title}>Refer & Earn more discount</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>
            {link}
          </Text>
          <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
            <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy Link'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={handleShare} style={styles.referBtn}>
            <Text style={styles.referBtnText}>Refer Now</Text>
          </TouchableOpacity>
          {!!referral.earningPerSignup && (
            <Text style={styles.earnText}>
              You earn <Text style={styles.earnAmount}>₹{referral.earningPerSignup}</Text> for every signup
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tealLight,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: { fontSize: 20 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 8,
  },
  linkText: { flex: 1, fontSize: 12, color: colors.tealDark },
  copyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border },
  copyBtnText: { fontSize: 11, color: colors.navy, fontWeight: '600' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, flexWrap: 'wrap', gap: 6 },
  referBtn: { backgroundColor: colors.teal, borderRadius: radii.sm, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  referBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  earnText: { fontSize: 11, color: colors.navySoft },
  earnAmount: { color: colors.teal, fontWeight: '700' },
});
