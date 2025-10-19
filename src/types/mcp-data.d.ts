// MCP数据类型定义

declare module '@/data/mcp-data.json' {
  export interface Category {
    Value: string
    Count: number
  }

  export interface Server {
    Id: string
    Name: string
    ChineseName?: string
    Abstract?: string
    AbstractCN?: string
    Category: string[]
    Stars: number
    License?: string
    Organization: {
      Name: string
    }
    Path: string
    CallVolume: number
    ViewCount: number
    Hosted: boolean
  }

  export interface MCPData {
    categories: Category[]
    servers: Server[]
    totalCount: number
    fetchedCount: number
  }

  const data: MCPData
  export default data
}
