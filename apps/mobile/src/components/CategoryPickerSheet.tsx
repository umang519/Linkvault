import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { subCategoriesOf, topLevelCategories } from '../mocks/categories';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, hairlineWidth } from '../theme/tokens';
import type { Category } from '../types/models';
import { BottomSheet } from './BottomSheet';

/**
 * Two-step category picker (top-level → sub-category) shared by Add Link
 * and Edit Link — first real use of BottomSheet outside its own file.
 * Only leaf (sub-)categories are selectable, matching the schema's
 * `Link.categoryId` pointing at a sub-category (PROJECT.md §3.3).
 */
export function CategoryPickerSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
}) {
  const { colors } = useTheme();
  const [parent, setParent] = useState<Category | null>(null);
  const list = parent ? subCategoriesOf(parent.id) : topLevelCategories();

  const close = () => {
    onClose();
    setParent(null);
  };

  return (
    <BottomSheet visible={visible} onClose={close} heightPct={0.6}>
      <View style={styles.header}>
        {parent ? (
          <Pressable onPress={() => setParent(null)}>
            <Text style={[styles.back, { color: colors.muted }]}>← {parent.name.toUpperCase()}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.title, { color: colors.ink }]}>Category</Text>
        )}
      </View>
      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => (parent ? (onSelect(item), close()) : setParent(item))}
            style={[styles.row, { borderBottomColor: colors.line }]}
          >
            <Text style={[styles.rowLabel, { color: colors.ink }]}>{item.name}</Text>
            <Text style={[styles.chevron, { color: colors.muted }]}>{parent ? '' : '›'}</Text>
          </Pressable>
        )}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  title: { fontFamily: fonts.heading, fontSize: 18 },
  back: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 0.8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: hairlineWidth },
  rowLabel: { fontFamily: fonts.body, fontSize: 14.5 },
  chevron: { fontSize: 14 },
});
