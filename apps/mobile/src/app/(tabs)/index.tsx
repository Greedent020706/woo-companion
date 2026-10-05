import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Category } from '@woo/shared';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ScreenState';
import { useCatalog, useCategories } from '../../hooks/useCatalog';
import { useDebounce } from '../../hooks/useDebounce';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { colors, radius, spacing } from '../../theme';

export default function CatalogScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const debouncedSearch = useDebounce(searchText.trim(), 400);

  const catalog = useCatalog(debouncedSearch, selectedCategoryId);
  const categoriesQuery = useCategories();
  const { isRefreshing, onRefresh } = usePullToRefresh(catalog.refetch);

  const catalogHeader = (
    <View style={styles.header}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar productos"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Buscar productos"
          autoCorrect={false}
        />
      </View>
      <CategoryChips
        categories={categoriesQuery.data ?? []}
        selectedCategoryId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      {catalogHeader}
      {catalog.isPending && <LoadingState label="Cargando catálogo…" />}
      {catalog.isError && <ErrorState error={catalog.error} onRetry={() => catalog.refetch()} />}
      {catalog.isSuccess && (
        <FlatList
          data={catalog.products}
          keyExtractor={(product) => String(product.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Sin resultados"
              description="Prueba con otra búsqueda o categoría."
            />
          }
          ListFooterComponent={
            catalog.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerSpinner} color={colors.primary} />
            ) : null
          }
          onEndReached={() => {
            if (catalog.hasNextPage && !catalog.isFetchingNextPage) catalog.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

type CategoryChipsProps = {
  categories: Category[];
  selectedCategoryId: number | undefined;
  onSelect: (categoryId: number | undefined) => void;
};

function CategoryChips({ categories, selectedCategoryId, onSelect }: CategoryChipsProps) {
  const chips = [{ id: undefined, name: 'Todo' }, ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {chips.map((category) => {
        const isSelected = category.id === selectedCategoryId;
        return (
          <Pressable
            key={category.id ?? 'all'}
            onPress={() => onSelect(category.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            {isSelected && <Ionicons name="checkmark" size={14} color={colors.onPrimary} />}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    fontSize: 16,
    color: colors.text,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  row: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  footerSpinner: {
    marginVertical: spacing.lg,
  },
});
