import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, radii } from '../theme/colors';
import { formatRupees } from '../utils/format';

/**
 * This component does NOT contain any lifecycle/eligibility logic itself.
 * It only renders whatever `cta` the backend computed (see
 * competitionLifecycle.js -> getUserCta) and wires the two mutating
 * actions (register, submit) to it. This is deliberate: if the rules
 * around when a user can register or submit ever change, only the
 * backend needs to change - the app keeps working correctly because it
 * never hardcodes "is registration open" logic of its own.
 */
export default function BottomActionBar({ cta, entryFee, actionPending, onRegister, onSubmit }) {
  async function handlePress() {
    if (!cta.enabled || actionPending) return;

    if (cta.action === 'REGISTER') {
      Alert.alert(
        'Confirm Registration',
        `Register for this competition with an entry fee of ${formatRupees(entryFee)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay & Register',
            onPress: async () => {
              const result = await onRegister();
              if (!result.ok) Alert.alert('Registration failed', result.message);
            },
          },
        ]
      );
      return;
    }

    if (cta.action === 'UPLOAD_SUBMISSION' || cta.action === 'RESUBMIT') {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (picked.canceled) return;

      const file = picked.assets?.[0];
      if (!file) return;

      const result = await onSubmit(file);
      if (!result.ok) Alert.alert('Upload failed', result.message);
      else Alert.alert('Success', 'Your submission has been uploaded.');
      return;
    }

    if (cta.action === 'VIEW_RESULTS') {
      Alert.alert('Results', 'Check the "Previous Winners" section above once results are declared.');
    }
  }

  const disabled = !cta.enabled || actionPending;

  return (
    <TouchableOpacity
      style={[styles.bar, disabled && styles.barDisabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {actionPending ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          <Text style={styles.label}>{cta.label}</Text>
          {cta.participation === 'REGISTERED' || cta.participation === 'SUBMITTED' ? (
            <Text style={styles.sub}>{cta.participation === 'SUBMITTED' ? 'Submitted' : 'Registered'}</Text>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  barDisabled: { backgroundColor: '#9FB6B3' },
  label: { color: colors.white, fontWeight: '700', fontSize: 15 },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },
});
