import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';
import { formatDateLine1, formatDateLine2 } from '../utils/format';

function DateCell({ icon, label, date }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.icon}>{icon}</Text>
      <View>
        <Text style={styles.cellLabel}>{label}</Text>
        <Text style={styles.cellDate}>{formatDateLine1(date)}</Text>
        <Text style={styles.cellTime}>{formatDateLine2(date)}</Text>
      </View>
    </View>
  );
}

export default function ImportantDatesCard({ importantDates }) {
  const { registrationEnd, submissionStart, submissionEnd, resultDate } = importantDates;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Important Dates</Text>
      <View style={styles.row}>
        <DateCell icon="📅" label="Register Before" date={registrationEnd} />
        <DateCell icon="📤" label="Submission Starts" date={submissionStart} />
      </View>
      <View style={[styles.row, styles.rowDivider]}>
        <DateCell icon="⬆️" label="Submission Ends" date={submissionEnd} />
        <DateCell icon="🏆" label="Result Date" date={resultDate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm },
  row: { flexDirection: 'row', paddingVertical: spacing.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  cell: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  icon: { fontSize: 16, marginTop: 2 },
  cellLabel: { fontSize: 11, color: colors.navySoft },
  cellDate: { fontSize: 13, fontWeight: '700', color: colors.navy, marginTop: 2 },
  cellTime: { fontSize: 11, color: colors.navySoft },
});
