import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, ruleWidth, type } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.onboarding
const STEPS = [
  { n: '01', t: 'Save from anywhere', d: 'Share sheet → LinkVault. No copy-paste.' },
  { n: '02', t: 'Organize as you go', d: 'Category, tags and a reading status.' },
  { n: '03', t: 'Find it in one search', d: 'Across titles, URLs, notes and tags.' },
];

export function OnboardingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <ScreenContainer style={styles.root}>
      <Text style={[styles.brand, { color: colors.ink }]}>LINKVAULT</Text>

      <View style={styles.hero}>
        <Text style={[styles.headline, { color: colors.ink }]}>
          SAVE{'\n'}ORGANIZE{'\n'}
          <Text style={{ color: colors.accent }}>FIND</Text>
        </Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          One vault for every link you meant to come back to. Saving takes two
          taps. Finding takes one search.
        </Text>
      </View>

      <View style={styles.bottom}>
        {STEPS.map((s) => (
          <View
            key={s.n}
            style={[styles.step, { borderTopColor: colors.rule, borderTopWidth: ruleWidth }]}
          >
            <Text style={[styles.stepN, { color: colors.accent }]}>{s.n}</Text>
            <View style={styles.stepBody}>
              <Text style={[styles.stepT, { color: colors.ink }]}>{s.t}</Text>
              <Text style={[styles.stepD, { color: colors.muted }]}>{s.d}</Text>
            </View>
          </View>
        ))}

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={[styles.buttonText, { color: colors.inverse }]}>GET STARTED</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonOutline, { borderColor: colors.rule }]}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={[styles.buttonText, { color: colors.ink }]}>I ALREADY HAVE AN ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: 34 },
  brand: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 2.2, paddingHorizontal: 22, paddingTop: 8 },
  hero: { paddingHorizontal: 22, paddingTop: 52 },
  headline: { fontFamily: fonts.heading, fontSize: 46, lineHeight: 44, letterSpacing: -1.4 },
  sub: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 21, marginTop: 18, maxWidth: 270 },
  bottom: { marginTop: 'auto' },
  step: { flexDirection: 'row', gap: 16, paddingVertical: 16, paddingHorizontal: 22, alignItems: 'flex-start' },
  stepN: { fontFamily: fonts.heading, fontSize: 12, width: 20 },
  stepBody: { flex: 1 },
  stepT: { fontFamily: fonts.heading, fontSize: type.linkTitle },
  stepD: { fontFamily: fonts.body, fontSize: type.secondary, lineHeight: 17, marginTop: 2 },
  actions: { paddingHorizontal: 22, paddingTop: 22, gap: 10 },
  button: { height: 52, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 18 },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2 },
  buttonText: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.8 },
});
