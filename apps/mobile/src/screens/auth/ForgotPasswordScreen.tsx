import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, type } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.forgot. "Confirmation replaces the form
// in place rather than a new screen" (LinkVault Mobile.dc.html, Navigation
// notes) — so `sent` swaps the email field + button for the confirmation
// block below, rather than showing both at once as the static mockup does.
//
// TODO(auth, PLAN.md §1.1): handleSendResetLink is a no-op stand-in — wire
// it to the real POST /auth/forgot-password call once apps/api exists.
export function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSendResetLink() {
    if (!email.trim() || !email.includes('@')) {
      setError('Enter the email on your account.');
      return;
    }
    setError(null);
    // Placeholder: no backend yet — just show the confirmation state.
    setSent(true);
  }

  return (
    <ScreenContainer style={styles.root}>
      <Pressable onPress={() => navigation.navigate('SignIn')}>
        <Text style={[styles.back, { color: colors.muted }]}>← BACK</Text>
      </Pressable>
      <Text style={[styles.headline, { color: colors.ink }]}>Reset password.</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>
        Enter the email on your account. We&apos;ll send a reset link that expires in 30 minutes.
      </Text>

      {!sent ? (
        <View style={styles.form}>
          <Text style={[styles.label, { color: error ? colors.accent : colors.muted }]}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[
              styles.input,
              { color: colors.ink, borderBottomColor: error ? colors.accent : colors.rule },
            ]}
          />
          {error ? <Text style={[styles.error, { color: colors.accent }]}>{error}</Text> : null}
        </View>
      ) : (
        <View style={[styles.confirm, { borderColor: colors.rule }]}>
          <View style={[styles.confirmMark, { backgroundColor: colors.accent }]} />
          <Text style={[styles.confirmText, { color: colors.ink }]}>
            Link sent. Check your inbox — and spam, occasionally.
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={sent ? () => navigation.navigate('SignIn') : handleSendResetLink}
      >
        <Text style={[styles.buttonText, { color: colors.inverse }]}>
          {sent ? 'BACK TO SIGN IN' : 'SEND RESET LINK'}
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 22, paddingBottom: 34 },
  back: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, paddingTop: 26 },
  headline: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 35, letterSpacing: -0.7, marginTop: 26 },
  sub: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 20, marginTop: 10 },
  form: { marginTop: 34 },
  label: { fontFamily: fonts.body, fontSize: type.label, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },
  input: { borderBottomWidth: 2, paddingBottom: 9, fontFamily: fonts.body, fontSize: 16, paddingTop: 0 },
  error: { fontFamily: fonts.body, fontSize: 12, marginTop: 8 },
  confirm: {
    marginTop: 26, borderWidth: 2, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  confirmMark: { width: 9, height: 9, marginTop: 4, flexShrink: 0 },
  confirmText: { flex: 1, fontFamily: fonts.body, fontSize: type.secondary, lineHeight: 18 },
  button: {
    marginTop: 'auto', height: 52, alignItems: 'flex-start',
    justifyContent: 'center', paddingHorizontal: 18,
  },
  buttonText: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.8 },
});
