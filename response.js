// 离线本地模拟版 response.js
// 定制：只保留分钟级降雨 + 彩云AQI

export async function response({ request, body, type }) {
  const isV1 = /\/v1\/availability\//.test(request.url);
  const isV2 = /\/v2\/weather\//.test(request.url);
  if (!isV1 && !isV2) return;

  // 解码 JSON 内容（兼容 binary）
  const raw = typeof body === 'string' ? body : new TextDecoder().decode(body);
  const data = JSON.parse(raw);

  // 模拟分钟级降雨（彩云：未来 1 小时每 5 分钟降雨强度）
  const now = Date.now();
  const minuteData = Array.from({ length: 12 }).map((_, i) => ({
    startTime: new Date(now + i * 5 * 60 * 1000).toISOString(),
    precipitationIntensity: [0, 0.2, 0.6, 1.2][i % 4], // 模拟强度：无-小雨-中雨-大雨
    precipitationType: i % 4 === 0 ? 'clear' : 'rain',
  }));

  // 注入分钟级降雨
  if (data.forecastNextHour) {
    data.forecastNextHour.summary = '预计将有降雨';
    data.forecastNextHour.forecast = minuteData;
  }

  // 模拟 AQI（彩云）
  data.airQuality = {
    primaryPollutant: 'pm2.5',
    source: 'ColorfulClouds',
    aqi: 72,
    category: '良',
    components: {
      pm2_5: 35,
      pm10: 50,
      o3: 80,
      so2: 5,
      no2: 22,
      co: 0.5
    },
    scale: 'HJ6332012',
    localizedCategory: '良',
    metadata: {
      providerName: '彩云天气（本地模拟）',
      providerLogo: 'https://i.imgur.com/Bf6UOaG.png',
    }
  };

  const text = JSON.stringify(data);
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: type === 'binary' ? new TextEncoder().encode(text) : text
  };
}