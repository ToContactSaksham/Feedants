import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii } from '../theme/colors';

const TABS = [
  { key: 'about', label: 'About Competition' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

const COLLAPSED_CHARS = 140;

export default function TabsSection({ aboutDescription, judgingParameters, rulesAndEligibility }) {
  const [activeTab, setActiveTab] = useState('about');
  const [expanded, setExpanded] = useState(false);

  const content = { about: aboutDescription, judging: judgingParameters, rules: rulesAndEligibility }[activeTab] || '';
  const isLong = content.length > COLLAPSED_CHARS;
  const displayText = !isLong || expanded ? content : `${content.slice(0, COLLAPSED_CHARS).trim()}…`;

  function selectTab(key) {
    setActiveTab(key);
    setExpanded(false);
  }

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <TouchableOpacity key={tab.key} onPress={() => selectTab(tab.key)} style={styles.tabBtn}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {active && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.body}>{displayText}</Text>

      {isLong && (
        <TouchableOpacity onPress={() => setExpanded((e) => !e)}>
          <Text style={styles.viewMore}>{expanded ? 'View less ˄' : 'View more ˅'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md, gap: spacing.lg },
  tabBtn: { paddingBottom: spacing.sm },
  tabLabel: { fontSize: 12, color: colors.navySoft, fontWeight: '600' },
  tabLabelActive: { color: colors.teal },
  tabUnderline: { height: 2, backgroundColor: colors.teal, marginTop: 6, borderRadius: 1 },
  body: { fontSize: 13, lineHeight: 20, color: colors.navySoft },
  viewMore: { fontSize: 12, color: colors.teal, fontWeight: '700', marginTop: spacing.sm, textAlign: 'center' },
});
