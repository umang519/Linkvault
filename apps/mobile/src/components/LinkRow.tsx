import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, hairlineWidth, type } from '../theme/tokens';
import type { Link } from '../types/models';

/**
 * Ported from Mobile app design prompt/LinkRow.dc.html. Detailed is the
 * default everywhere; compact is only for dense pickers (duplicate
 * dialogs, collection previews) — PROJECT.md §14.5.
 */
export function LinkRow({
  link,
  compact = false,
  onOpen,
}: {
  link: Link;
  compact?: boolean;
  onOpen?: () => void;
}) {
  const { colors } = useTheme();
  const domain = extractDomain(link.url);
  const initial = (domain || '?').replace(/^www\./, '').charAt(0).toUpperCase();
  const isUnread = link.status === 'Unread';
  const visibleTags = compact ? [] : link.tags.slice(0, 3);
  const showDesc = !compact && !!link.description;

  return (
    <Pressable
      onPress={onOpen}
      style={[
        styles.row,
        { borderBottomColor: colors.line, borderBottomWidth: hairlineWidth },
      ]}
    >
      <View style={[styles.mark, { borderColor: colors.rule }]}>
        <Text style={[styles.markText, { color: colors.ink }]}>{initial}</Text>
      </View>
      <View style={styles.body}>
        <Text
          style={[styles.title, { color: colors.ink }]}
          numberOfLines={2}
        >
          {link.title}
        </Text>
        <Text style={[styles.domain, { color: colors.muted }]}>{domain}</Text>
        {showDesc ? (
          <Text style={[styles.desc, { color: colors.muted }]} numberOfLines={2}>
            {link.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {/* Category is rendered by the screen via a chip, kept out of
              this shared row since not every list groups by category. */}
          <View style={[styles.statusChip, isUnread
            ? { backgroundColor: colors.accent, borderColor: colors.accent }
            : { borderColor: colors.line, borderWidth: hairlineWidth }]}
          >
            <Text style={[styles.statusText, { color: isUnread ? colors.inverse : colors.muted }]}>
              {link.status.toUpperCase()}
            </Text>
          </View>
          {visibleTags.map((tag) => (
            <Text key={tag.id} style={[styles.tag, { color: colors.muted }]}>
              #{tag.name}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.trailing}>
        {link.isFavorite ? (
          <View style={[styles.favMark, { backgroundColor: colors.accent }]} />
        ) : null}
      </View>
    </Pressable>
  );
}

function extractDomain(url: string): string {
  try {
    return new URL(url.includes('://') ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  mark: { width: 34, height: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: fonts.heading, fontSize: 15 },
  body: { flex: 1, gap: 5 },
  title: { fontFamily: fonts.heading, fontSize: type.linkTitle, lineHeight: 19 },
  domain: { fontFamily: fonts.body, fontSize: type.label, letterSpacing: 0.8, textTransform: 'uppercase' },
  desc: { fontFamily: fonts.body, fontSize: type.secondary, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 2 },
  statusChip: { paddingHorizontal: 6, paddingVertical: 4 },
  statusText: { fontFamily: fonts.body, fontSize: type.label, letterSpacing: 0.8, textTransform: 'uppercase' },
  tag: { fontFamily: fonts.body, fontSize: 11 },
  trailing: { alignItems: 'flex-end', gap: 7, paddingTop: 2 },
  favMark: { width: 9, height: 9 },
});
