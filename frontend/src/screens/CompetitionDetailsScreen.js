import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { useCompetitionDetails } from '../hooks/useCompetitionDetails';

import HeaderCard from '../components/HeaderCard';
import JudgeCard from '../components/JudgeCard';
import CountdownBanner from '../components/CountdownBanner';
import ImportantDatesCard from '../components/ImportantDatesCard';
import PreviousWinnersRow from '../components/PreviousWinnersRow';
import TabsSection from '../components/TabsSection';
import RewardsCard from '../components/RewardsCard';
import ReferEarnCard from '../components/ReferEarnCard';
import DisclaimerBanner from '../components/DisclaimerBanner';
import BottomActionBar from '../components/BottomActionBar';

const COMPETITION_SLUG = 'feedants-classical-dance';

export default function CompetitionDetailsScreen() {
  const { data, loading, error, actionPending, refetch, register, submit } = useCompetitionDetails(COMPETITION_SLUG);

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Loading competition…</Text>
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't load this competition</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const serverTimeOffsetMs = data.serverTime ? new Date(data.serverTime).getTime() - Date.now() : 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.teal} />}
      >
        <HeaderCard competition={data} />
        <JudgeCard judge={data.judge} />
        <CountdownBanner lifecycle={data.lifecycle} serverTimeOffsetMs={serverTimeOffsetMs} />
        <ImportantDatesCard importantDates={data.importantDates} />
        <PreviousWinnersRow winners={data.previousWinners} />
        <TabsSection
          aboutDescription={data.aboutDescription}
          judgingParameters={data.judgingParameters}
          rulesAndEligibility={data.rulesAndEligibility}
        />
        <RewardsCard rewards={data.rewards} />
        <DisclaimerBanner text={data.disclaimer} />
        <ReferEarnCard referral={data.referral} referralCode={data.viewer?.referralCode} competitionSlug={data.slug} />
      </ScrollView>

      <View style={styles.bottomBarWrap}>
        <BottomActionBar
          cta={data.cta}
          entryFee={data.entryFee}
          actionPending={actionPending}
          onRegister={register}
          onSubmit={submit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.xl },
  loadingText: { marginTop: spacing.md, color: colors.navySoft },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm },
  errorSub: { fontSize: 13, color: colors.navySoft, textAlign: 'center' },
  bottomBarWrap: { padding: spacing.lg, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
});
