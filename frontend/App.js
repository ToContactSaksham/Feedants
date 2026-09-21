import React from 'react';
import { StatusBar } from 'expo-status-bar';
import CompetitionDetailsScreen from './src/screens/CompetitionDetailsScreen';

/**
 * The assignment scope is a single screen (Competition Details), so this
 * app intentionally has no navigation library wired in. In a real app
 * this screen would be registered as a route (e.g. with React Navigation)
 * reached from a Competitions list, receiving the competition id/slug as
 * a route param instead of the hardcoded COMPETITION_SLUG constant used
 * here for the demo.
 */
export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <CompetitionDetailsScreen />
    </>
  );
}
