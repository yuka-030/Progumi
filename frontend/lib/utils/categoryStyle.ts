// Progumi/frontend/lib/utils/categoryStyle.ts
const CATEGORY_STYLES = [
  {
    bg: "bg-primary/10",
    text: "text-primary",
    activeBg: "bg-primary/20",
    activeText: "text-primary",
  },
  {
    bg: "bg-green-100",
    text: "text-green-700",
    activeBg: "bg-green-200",
    activeText: "text-green-700",
  },
  {
    bg: "bg-purple-100",
    text: "text-purple-600",
    activeBg: "bg-purple-200",
    activeText: "text-purple-600",
  },
  {
    bg: "bg-pink-100",
    text: "text-pink-600",
    activeBg: "bg-pink-200",
    activeText: "text-pink-600",
  },
  {
    bg: "bg-accent/10",
    text: "text-accent",
    activeBg: "bg-accent/20",
    activeText: "text-accent",
  },
  {
    bg: "bg-blue-100",
    text: "text-blue-600",
    activeBg: "bg-blue-200",
    activeText: "text-blue-600",
  },
];

// カテゴリ名からの決定論的な色（フィルターボタンなど単独表示用）
export function getCategoryStyle(category: string) {
  const charSum = [...category].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return CATEGORY_STYLES[charSum % CATEGORY_STYLES.length];
}

// 一覧表示用：同じカテゴリ名は常に同じ色、かつ隣接した項目同士で同じ色が並ばないようにする
// termsの並び順（カテゴリの出現順）を渡すと、カテゴリ名→色のマッピングを返す
export function buildCategoryColorMap(
  categoryListInOrder: string[],
): Map<string, (typeof CATEGORY_STYLES)[number]> {
  const map = new Map<string, (typeof CATEGORY_STYLES)[number]>();
  let prevStyle: (typeof CATEGORY_STYLES)[number] | null = null;

  for (const category of categoryListInOrder) {
    // すでに色が割り当て済みのカテゴリは固定色を再利用
    if (map.has(category)) {
      prevStyle = map.get(category)!;
      continue;
    }

    // 未割り当てのカテゴリには、まずカテゴリ名から決定論的な基準色を計算
    const baseStyle = getCategoryStyle(category);
    let style = baseStyle;

    // 直前の項目と同じ色になる場合は、衝突しなくなるまで次の色にずらす
    if (prevStyle && style === prevStyle) {
      const baseIndex = CATEGORY_STYLES.indexOf(baseStyle);
      for (let offset = 1; offset < CATEGORY_STYLES.length; offset++) {
        const candidate =
          CATEGORY_STYLES[(baseIndex + offset) % CATEGORY_STYLES.length];
        if (candidate !== prevStyle) {
          style = candidate;
          break;
        }
      }
    }

    map.set(category, style);
    prevStyle = style;
  }

  return map;
}
