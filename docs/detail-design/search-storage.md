# 検索結果保持機能 (Search Storage)

## 概要

詳細画面から検索画面に戻った際に、AI検索結果を保持して再表示する機能です。

## 仕組み

`sessionStorage`を使用して検索結果を一時保存し、ページ遷移後も復元します。

### ファイル構成

| ファイル | 役割 |
|---------|------|
| [`src/utils/searchStorage.ts`](../utils/searchStorage.ts) | sessionStorage操作のユーティリティ |
| [`src/hooks/useSearchStorage.ts`](../hooks/useSearchStorage.ts) | Reactカスタムフック |

## 使用方法

### 基本的な使い方

```tsx
import { useSearchStorage } from "@/hooks/useSearchStorage";

function SearchPage() {
  const { saveResults, restoreOnMount, clearResults } = useSearchStorage();
  
  // マウント時に復元
  useEffect(() => {
    const restored = restoreOnMount();
    if (restored.results) {
      setAiResults(restored.results);
    }
  }, []);
  
  // 検索成功時に保存
  const onSearchSuccess = (results, intent) => {
    saveResults(results, intent);
  };
}
```

### 直接ユーティリティを使う場合

```tsx
import { 
  saveSearchResults, 
  restoreSearchResults, 
  clearSearchResults 
} from "@/utils/searchStorage";

// 保存
saveSearchResults(results, intent);

// 復元
const { results, intent, hasSearched } = restoreSearchResults();

// クリア
clearSearchResults();
```

## 仕様

### 有効期限

保存された結果は**30分**で自動的に期限切れになります。
期限切れの場合、`restoreSearchResults()`は空の結果を返します。

### 保存されるデータ

| キー | 内容 |
|-----|------|
| `aiSearchResults` | 検索結果の配列 (JSON) |
| `aiSearchIntent` | 検索意図 (JSON) |
| `hasSearched` | 検索実行済みフラグ |
| `aiSearchTimestamp` | 保存日時 |

## 注意事項

- **ブラウザタブを閉じると消去されます**（sessionStorageの仕様）
- **別タブでは共有されません**
- 大量のデータ（1000件以上など）を保存すると、パフォーマンスに影響する可能性があります

## 関連ファイル

- [`src/app/search/page.tsx`](../app/search/page.tsx) - 検索画面（使用箇所）
- [`src/app/jobs/[id]/page.tsx`](../app/jobs/%5Bid%5D/page.tsx) - 詳細画面
