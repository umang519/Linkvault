import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, type } from '../../theme/tokens';

// Design ref: Screen.dc.html — is.signup (three fields + a strength bar;
// nothing else blocks the account).
//
// TODO(auth, PLAN.md §1.1): local state + client-side validation only.
// Swap handleCreateAccount's body for the real POST /auth/register call
// once apps/api exists.
export function SignUpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => scorePassword(password), [password]);

  function handleCreateAccount() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError('Name, email and an 8+ character password are all required.');
      return;
    }
    setError(null);
    // Placeholder: no backend yet — jump straight into the app.
    navigation.navigate('Main');
  }

  return (
    <ScreenContainer style={styles.root}>
      <Pressable onPress={() => navigation.navigate('SignIn')}>
        <Text style={[styles.back, { color: colors.muted }]}>← BACK</Text>
      </Pressable>
      <Text style={[styles.headline, { color: colors.ink }]}>Create your vault.</Text>

      <View style={styles.form}>
        <View>
          <Text style={[styles.label, { color: colors.muted }]}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ravi Trivedi"
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.ink, borderBottomColor: colors.rule }]}
          />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.muted }]}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ravi@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[styles.input, { color: colors.ink, borderBottomColor: colors.rule }]}
          />
        </View>
        <View>
          <Text style={[styles.label, { color: colors.muted }]}>PASSWORD</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={[styles.input, { color: colors.ink, borderBottomColor: colors.line }]}
          />
          <View style={styles.strengthRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  { backgroundColor: i < strength ? colors.accent : colors.line },
                ]}
              />
            ))}
          </View>
        </View>
        {error ? <Text style={[styles.error, { color: colors.accent }]}>{error}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Text style={[styles.terms, { color: colors.muted }]}>
          By continuing you agree to the Terms and the Privacy Policy.
        </Text>
        <Pressable style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleCreateAccount}>
          <Text style={[styles.buttonText, { color: colors.inverse }]}>CREATE ACCOUNT</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

/** Rough 0-4 heuristic: length, lowercase+uppercase, digit, symbol. */
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: 22, paddingBottom: 34 },
  back: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 1, paddingTop: 26 },
  headline: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 35, letterSpacing: -0.7, marginTop: 26 },
  form: { marginTop: 34, gap: 20 },
  label: { fontFamily: fonts.body, fontSize: type.label, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },
  input: { borderBottomWidth: 2, paddingBottom: 9, fontFamily: fonts.body, fontSize: 16, paddingTop: 0 },
  strengthRow: { flexDirection: 'row', gap: 5, marginTop: 10 },
  strengthBar: { height: 3, flex: 1 },
  error: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  actions: { marginTop: 'auto', gap: 14 },
  terms: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16 },
  button: { height: 52, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 18 },
  buttonText: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 0.8 },
});
