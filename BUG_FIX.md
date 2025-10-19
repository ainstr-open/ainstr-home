# Bug修复记录

## ✅ 修复页面500错误

### 问题描述
访问 `/mcp` 页面时出现500错误，页面显示404。

### 错误信息
```
TypeError: Cannot read properties of undefined (reading 'split')
    at getCategoryName (./src/lib/categories.ts:39:6)
    at ServiceGrid component
```

### 根本原因
在 `src/lib/categories.ts` 的 `getCategoryName` 函数中，当传入的 `category` 参数为 `undefined` 或空值时，直接调用 `.split('-')` 方法导致错误。

这种情况发生在：
- 数据中某些服务的分类字段为空
- 数据格式不完整

### 修复方案
在 `getCategoryName` 函数开头添加参数验证：

```typescript
export function getCategoryName(category: string, language: 'zh' | 'en'): string {
  // 处理undefined或空值
  if (!category) {
    return language === 'zh' ? '其他' : 'Other'
  }
  
  const mapping = categoryNameMap[category]
  if (mapping) {
    return mapping[language]
  }
  
  // 如果没有映射，返回原始值的首字母大写形式
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
```

### 修复效果
- ✅ 页面正常加载（200状态码）
- ✅ 处理了空分类的情况
- ✅ 兼容不完整的数据
- ✅ 中英文都有合理的默认值

### 测试结果
```bash
GET /mcp 200 in 605ms  ✅
GET /mcp 200 in 72ms   ✅
```

页面已经可以正常访问！

---

**修复时间**: 2025-10-18  
**影响范围**: ServiceGrid组件、分类显示  
**状态**: ✅ 已修复
