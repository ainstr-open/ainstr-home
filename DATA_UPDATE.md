# MCP数据更新说明

## ✅ 数据获取成功！

### 📊 当前数据状态

- **MCP服务**: 300条
- **分类数量**: 81个
- **数据来源**: ModelScope API
- **数据文件**: `src/data/mcp-data.json`

### 📂 数据结构

```json
{
  "categories": [
    {
      "Value": "developer-tools",
      "Count": 1481
    },
    ...
  ],
  "servers": [
    {
      "Id": "2756",
      "Name": "minimax-mcp",
      "ChineseName": "MiniMax MCP",
      "Abstract": "...",
      "AbstractCN": "...",
      "Category": ["entertainment-and-multimedia"],
      "Stars": 32,
      "License": "MIT License",
      "Organization": { "Name": "..." },
      "Path": "@MiniMax-AI",
      "CallVolume": 132495873,
      "ViewCount": 21382,
      "Hosted": true
    },
    ...
  ],
  "totalCount": 5508,
  "fetchedCount": 300
}
```

### 🎯 数据使用

#### 左侧分类栏
- **数据源**: `mcp-data.json` 中的 `categories` 数组
- **来自**: API响应的 `Data.FiledAgg.Category`
- **显示**: 81个分类及其对应的服务数量
- **功能**: 点击分类可筛选服务（待实现）

#### 右侧服务卡片
- **数据源**: `mcp-data.json` 中的 `servers` 数组
- **来自**: API响应的 `Data.McpServer.McpServers`
- **显示**: 300个MCP服务（共5508个）
- **分页**: 每页12个服务，支持加载更多

### 🔄 更新数据

运行以下命令重新获取最新数据：

```bash
python3 scripts/fetch_all_pages.py
```

**注意**：
1. Cookie可能会过期，需要从浏览器更新
2. API有防护措施，建议适当延迟请求
3. 当前获取前10页（每页100条）共1000条数据

### 📈 Top 15 分类

1. developer-tools (1,481)
2. search (801)
3. calendar-management (603)
4. other (448)
5. browser-automation (379)
6. databases (377)
7. knowledge-and-memory (327)
8. communication (309)
9. research-and-data (274)
10. file-systems (254)
11. cloud-platforms (231)
12. finance (223)
13. os-automation (221)
14. entertainment-and-media (193)
15. note-taking (169)

### 🛠 字段说明

**服务字段**:
- `Id`: 服务唯一ID
- `Name`: 英文名称
- `ChineseName`: 中文名称
- `Abstract/AbstractCN`: 英文/中文描述
- `Category`: 分类数组
- `Stars`: GitHub星标数
- `License`: 开源许可证
- `Organization`: 所属组织
- `Path`: 服务路径
- `CallVolume`: 调用量
- `ViewCount`: 浏览量
- `Hosted`: 是否托管服务

**分类字段**:
- `Value`: 分类标识（英文）
- `Count`: 该分类下的服务数量

### 🚀 下一步

1. 实现分类筛选功能
2. 添加搜索功能
3. 实现真实的分页加载
4. 添加服务详情页面
5. 定期更新数据

---

**最后更新**: 已获取300条服务数据
**数据来源**: https://modelscope.cn/api/v1/dolphin/mcpServers
**总服务数**: 5,508
