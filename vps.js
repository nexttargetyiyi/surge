(async () => {
  try {
    const params = parseParams($argument);
    const { body } = await fetchData(params.url);
    const data = JSON.parse(body);

    const updateTime = formatTime(data.last_time);
    const traffic = {
      total: formatBytes(data.bytes_total),
      upload: formatBytes(data.bytes_sent),
      download: formatBytes(data.bytes_recv),
    };

    const panel = {
      title: params.name || '服务器状态面板',
      icon: params.icon || 'bolt.horizontal.icloud.fill',
      'icon-color': pickColor(data.mem_usage),
      content: `
CPU：${data.cpu_usage}%       |  内存：${data.mem_usage}%
下载：${traffic.download} |  上传：${traffic.upload}
总流量：${traffic.total}
运行时间：${formatUptime(data.uptime)}
上次更新：${updateTime}
`.trim()
    };

    $done(panel);
  } catch (err) {
    console.log('Error:', err);
    $done({
      title: '出错啦 ⚠️',
      content: `💥 检查 API 地址或端口\n错误详情：${err}`,
      icon: 'xmark.octagon.fill',
      'icon-color': '#FF3B30',
    });
  }
})();

// === 工具函数区 ===

function fetchData(url) {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/93.0.4577.63 Mobile/15E148 Safari/604.1',
  };
  return new Promise((resolve, reject) => {
    $httpClient.get({ url, headers }, (err, resp, body) => {
      if (err) return reject(err);
      resolve({ ...resp, body });
    });
  });
}

function parseParams(paramStr) {
  return Object.fromEntries(
    paramStr.split('&').map(item => item.split('=').map(decodeURIComponent))
  );
}

function formatTime(timeStr) {
  const date = new Date(timeStr);
  date.setHours(date.getHours() + 0); // 假设是东八区，可以根据需要调整
  return date.toLocaleString();
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [d && `${d}天`, h && `${h}小时`, (m || (!d && !h)) && `${m}分钟`]
    .filter(Boolean)
    .join(' ');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

function pickColor(memUsage) {
  const value = parseInt(memUsage);
  if (value < 30) return '#06D6A0'; // 低
  if (value < 70) return '#FFD166'; // 中
  return '#EF476F'; // 高
}
