import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, type } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.signin (validation sits under the field;
// the label turns red with it).
//
// TODO(auth, PLAN.md §1.1): wired to local state + client-side validation
// only. Swap handleSignIn's body for the real POST /auth/login call (RTK
// Query endpoint) once apps/api exists, and store the returned token via
// expo-secure-store (already read by src/api/apiSlice.ts).
export function SignInScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSignIn() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    // Placeholder: no backend yet — jump straight into the app.
    navigation.navigate('Main');
  }

  return (
    <ScreenContainer style={styles.root}>
      <Text style={[styles.brand, { color: colors.ink }]}>LINKVAULT</Text>
      <Text style={[styles.headline, { color: colors.ink }]}>Welcome back.</Text>
      <Text style={[styles.sub, { color: colors.muted }]}>342 links waiting where you left them.</Text>

      <View style={styles.form}>
        <View>
          <Text style={[styles.label, { color: colors.muted }]}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[styles.input, { color: colors.ink, borderBottomColor: colors.rule }]}
          />
        </View>
        <View>
          <Text style={[styles.label, { color: error ? colors.accent : colors.muted }]}>PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[
              styles.input,
              { color: colors.ink, borderBottomColor: error ? colors.accent : colors.rule },
            ]}
          />
          {error ? <Text style={[styles.error, { color: colors.accent }]}>{error}</Text> : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleSignIn}>
          <Text style={[styles.buttonText, { color: colors.inverse }]}>SIGN IN</Text>
        </Pressable>
        <View style={styles.linkRow}>
          <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={[styles.link, { color: colors.accent }]}>Forgot password?</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.link, { color: colors.ink }]}>Create account</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 22, paddingBottom: 34 },
  brand: { fontFamily: fonts.heading, fontSize: 12, letterSpacing: 2.2, paddingTop: 8 },
  headline: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 35, letterSpacing: -0.7, marginTop: 34 },
  sub: { fontFamily: fonts.body, fontSize: type.body, marginTop: 8 },
  form: { marginTop: 38, gap: 20 },
  label: { fontFamily: fonts.body, fontSize: type.label, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },
  input: { borderBottomWidth: 2, paddingBottom: 9, fontFamily: fonts.body, fontSize: 16, paddingTop: 0 },
  error: { fontFamily: fonts.body, fontSize: 12, marginTop: 8 },
  actions: { marginTop: 'auto', gap: 14 },
  button: { height: 52, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.8 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontFamily: fonts.body, fontSize: 13 },
});
