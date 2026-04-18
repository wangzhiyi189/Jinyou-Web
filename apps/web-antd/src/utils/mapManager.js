import AMapLoader from '@amap/amap-jsapi-loader';

const AMAP_KEY = '601c0b529e8459019f26c9cdca6fd610';
const AMAP_SECURITY = '2dc143b724af96cd33a5fefe4e031461';

let AMap = null;
let loadingPromise = null;

export class MapManager {
  map = null;
  geocoder = null;       // 地理编码
  autoComplete = null;   // 搜索提示

  static async loadSdk() {
    if (AMap) return AMap;
    if (loadingPromise) return loadingPromise;

    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY };

    loadingPromise = AMapLoader.load({
      key: AMAP_KEY,
      version: '2.0',
      // 新增插件
      plugins: ['AMap.Geocoder', 'AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geolocation' , 'AMap.Transfer', 'AMap.Driving'],
    }).then(amap => {
      AMap = amap;
      return amap;
    });

    return loadingPromise;
  }

  async initLineMap(container) {
    await MapManager.loadSdk();
    this.destroy();

    this.map = new AMap.Map(container, {
      zoom: 13,
      resizeEnable: true
    });

    // 初始化地理编码
    this.geocoder = new AMap.Geocoder();
  }

  // ==============================================
  // 👇👇👇 以下是新增的 搜索/选点/标记 功能 👇👇👇
  // ==============================================

  // 1. 地址搜索提示
  searchAddress(keyword, city, callback) {
    if (!AMap || !this.map) return;

    if (!this.autoComplete) {
      this.autoComplete = new AMap.AutoComplete({ city });
    } else {
      this.autoComplete.setCity(city);
    }

    this.autoComplete.search(keyword, (status, result) => {
      if (status === 'complete' && result.tips) {
        callback(result.tips.filter(t => t.location));
      } else {
        callback([]);
      }
    });
  }

  // 2. 经纬度 => 地址
  getAddressByLngLat(lng, lat) {
    return new Promise((resolve) => {
      if (!this.geocoder) return resolve(null);
      this.geocoder.getAddress([lng, lat], (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          resolve(result.regeocode);
        } else {
          resolve(null);
        }
      });
    });
  }

  // 3. 添加单个标记（自动清除旧标记）
  addMarker(lng, lat) {
    if (!this.map) return;
    this.clearMarkers();

    const marker = new AMap.Marker({
      position: [lng, lat],
      anchor: 'bottom-center',
    });
    this.map.add(marker);
    this.setCenter(lng, lat);
  }

  // 4. 绑定地图点击事件
  onMapClick(callback) {
    if (!this.map) return;
    this.map.on('click', callback);
  }

  // 5. 设置中心点
  setCenter(lng, lat, zoom = 16) {
    if (!this.map) return;
    this.map.setCenter([lng, lat]);
    this.map.setZoom(zoom);
  }

  // 6. 清空所有标记
  clearMarkers() {
    if (!this.map) return;
    this.map.getAllOverlays('marker').forEach(m => this.map.remove(m));
  }

  // 7. 清空地图所有覆盖物（标记、路线等）
  clearAll() {
    if (!this.map) return;
    this.map.getAllOverlays().forEach(item => this.map.remove(item));
  }

  // ==============================================
  // 👆👆👆 新增功能结束 👆👆👆
  // ==============================================

  // 直接画路线（不管是不是真实公路，都一定显示）
  drawRoute(points) {
    if (!this.map) return;
    const line = new AMap.Polyline({
      path: points,
      strokeColor: '#1677ff',
      strokeWeight: 6,
      strokeOpacity: 0.9,
      zIndex: 10
    });
    this.map.add(line);
  }

  // ✅ 直接画站点标记 + 显示名称（100% 显示）
  drawStationLabels(stationList) {
    if (!this.map || !stationList?.length) return;
    stationList.forEach((item,index) => {
      new AMap.Marker({
        map: this.map,
        position: [Number(item.lng), Number(item.lat)],
        label: {
          content: index+1 + '、' + item.stationName,
          direction: 'top',
          offset: new AMap.Pixel(0, -18)
        },
        zIndex: 100
      });
    });
  }
// 详细线路（修复版：支持途经点、坐标兼容、防错）
drawDetailedRoute(stations , policy) {
  // 默认线路
  const finalPolicy = policy || AMap.DrivingPolicy.LEAST_TIME;
  // 1. 增强防御性判断，避免空指针
  if (!this.map || !AMap || !AMap.Driving || !stations || stations.length < 2) {
    console.warn('地图/AMap.Driving/站点数据未就绪，跳过路线绘制', {map:!!this.map, AMap:!!AMap, Driving:!!AMap.Driving, stations:stations});
    return;
  }

  // 2. 销毁旧路线（避免重复绘制）
  if (this.routeLine) {
    this.map.remove(this.routeLine);
    this.routeLine = null;
  }
  if (this.markers && this.markers.length) {
    this.map.remove(this.markers);
    this.markers = [];
  }

  // 3. 统一坐标格式：兼容【对象数组】和【二维数组】两种stations格式
  const formatStation = (item) => {
    console.log(item)
    // 情况1：对象数组 {lng, lat, stationName}
    if (typeof item === 'object' && item.lng && item.lat) {
      return { lng: Number(item.lng), lat: Number(item.lat), name: item.stationName || '站点' };
    }
    // 情况2：二维数组 [lng, lat]
    if (Array.isArray(item) && item.length >= 2) {
      return { lng: Number(item[0]), lat: Number(item[1]), name: '站点' };
    }
    return null; // 无效坐标
  };

  // 格式化所有站点，过滤无效坐标
  const validStations = stations
    .map(formatStation)
    .filter(s => s && !isNaN(s.lng) && !isNaN(s.lat));

  if (validStations.length < 2) {
    console.error('有效站点不足2个，无法规划路线', validStations);
    return;
  }

  // 4. 提取起点、终点、途经点（高德坐标格式：[经度, 纬度]）
  const start = new AMap.LngLat(validStations[0].lng, validStations[0].lat);
  const end = new AMap.LngLat(validStations[validStations.length - 1].lng, validStations[validStations.length - 1].lat);
  // 中间所有站点作为途经点（Driving最多支持16个，公交线完全够用）
  const waypoints = validStations.slice(1, -1)
    .map(s => new AMap.LngLat(s.lng, s.lat));

  // 5. 创建驾车路线规划实例（支持途经点，完美适配公交路线需求）
  const driving = new AMap.Driving({
    map: this.map,
    // 1. 时间优先（最快，默认）
    // AMap.DrivingPolicy.LEAST_TIME        // 数值：0
    // 2. 距离优先（最短）
    // AMap.DrivingPolicy.LEAST_DISTANCE    // 数值：2
    // 3. 费用优先（少收费/不走收费路）
    // AMap.DrivingPolicy.LEAST_FEE         // 数值：1
    // 4. 不走高速
    // AMap.DrivingPolicy.NO_EXPRESS_WAY    // 数值：6
    // 5. 躲避拥堵（结合实时路况）
    // AMap.DrivingPolicy.AVOID_TRAFFIC_JAM // 数值：4
    policy: finalPolicy,
    showTraffic: false, // 关闭路况，避免干扰
  });
  
  // 6. 搜索路线（支持途经点，强制经过所有公交站）
  driving.search(
    start,
    end,
    {
      waypoints: waypoints, // 传入所有中间站点，强制路线经过
    },
    (status, result) => {
      console.log('路线规划回调', status, result);
      if (status === 'complete' && result.routes && result.routes.length > 0) {
        // 取第一条最优路线
        const route = result.routes[0];
        // 合并所有路段的路径，得到完整的道路坐标
        const path = this.parseRoutePath(route);

        if (!path || path.length < 2) {
          console.error('路线路径为空，无法绘制');
          return;
        }

        // 7. 用真实道路坐标绘制公交路线
        this.routeLine = new AMap.Polyline({
          path: path,
          strokeColor: '#1677ff',
          strokeWeight: 6,
          strokeOpacity: 0.9,
          zIndex: 10,
          lineCap: 'round',
          lineJoin: 'round',
        });
        this.map.add(this.routeLine);

        // 8. 绘制所有公交站点标记（兼容两种数据格式）
        this.markers = validStations.map(station => {
          return new AMap.Marker({
            position: new AMap.LngLat(station.lng, station.lat),
            title: station.name,
            map: this.map,
            icon: new AMap.Icon({
              size: new AMap.Size(24, 32),
              image: 'https://webapi.amap.com/theme/v1.3/markers/b/stop.png',
            }),
          });
        });

        // 9. 自动缩放地图到完整路线视野
        this.map.setFitView([this.routeLine, ...this.markers]);
      } else {
        console.error('路线规划失败：', status, result);
      }
    }
  );
}

// 辅助方法：解析路线，合并所有路段的路径（修复版）
parseRoutePath(route) {
  const path = [];
  if (!route || !route.steps) return path;
  route.steps.forEach(step => {
    if (step.path && Array.isArray(step.path)) {
      path.push(...step.path);
    }
  });
  return path;
}

  fitView() {
    this.map?.setFitView();
  }

  destroy() {
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    this.geocoder = null;
    this.autoComplete = null;
  }
}