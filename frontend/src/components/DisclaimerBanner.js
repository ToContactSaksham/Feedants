import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';

export default function DisclaimerBanner({ text }) {
  if (!text) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>ⓘ</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Disclaimer: </Text>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.tealLight,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: 8,
  },
  icon: { color: colors.teal, fontSize: 14 },
  text: { flex: 1, fontSize: 12, color: colors.tealDark, lineHeight: 17 },
  bold: { fontWeight: '700' },
});
