const fs = require('fs');
const https = require('https');

const fetchMCPData = async (pageNumber, pageSize = 30) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      PageSize: pageSize,
      PageNumber: pageNumber,
      Query: "",
      Criterion: []
    });

    const options = {
      hostname: 'modelscope.cn',
      port: 443,
      path: '/api/v1/dolphin/mcpServers',
      method: 'PUT',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'https://modelscope.cn',
        'Referer': `https://modelscope.cn/mcp?page=${pageNumber}`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

const fetchAllPages = async () => {
  console.log('开始获取MCP服务数据...');

  let allData = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      console.log(`正在获取第 ${currentPage} 页...`);
      const result = await fetchMCPData(currentPage);

      if (result.Data && result.Data.Servers && result.Data.Servers.length > 0) {
        allData = allData.concat(result.Data.Servers);
        console.log(`第 ${currentPage} 页获取成功，获得 ${result.Data.Servers.length} 条数据`);

        // 检查是否还有更多数据
        const totalCount = result.Data.TotalCount || 0;
        const currentTotal = currentPage * 30;

        if (currentTotal >= totalCount) {
          hasMore = false;
          console.log(`已获取全部数据，总计 ${allData.length} 条`);
        } else {
          currentPage++;
          // 添加延迟避免请求过快
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        hasMore = false;
        console.log('没有更多数据');
      }
    } catch (error) {
      console.error(`获取第 ${currentPage} 页时出错:`, error.message);
      hasMore = false;
    }
  }

  // 保存到文件
  const outputPath = './src/data/mcp-services.json';
  const dirPath = './src/data';

  // 确保目录存在
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2), 'utf-8');
  console.log(`数据已保存到 ${outputPath}`);
  console.log(`总计 ${allData.length} 条MCP服务数据`);

  // 生成统计信息
  const stats = {
    total: allData.length,
    timestamp: new Date().toISOString(),
    categories: {}
  };

  // 统计每个分类的数量
  allData.forEach(item => {
    if (item.Category) {
      stats.categories[item.Category] = (stats.categories[item.Category] || 0) + 1;
    }
  });

  fs.writeFileSync('./src/data/mcp-stats.json', JSON.stringify(stats, null, 2), 'utf-8');
  console.log('统计信息已保存到 ./src/data/mcp-stats.json');
};

// 执行数据获取
fetchAllPages().catch(console.error);
