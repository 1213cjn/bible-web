document.addEventListener('DOMContentLoaded', () => {
    // 初始化地图，中心点设在以色列地区
    const map = L.map('bible-map').setView([31.7683, 35.2137], 6);

    // 【关键替换】：使用高德地图底图（国内秒开）
    // 这里使用高德的“卫星图+路网”模式，查看地理位置更直观
    const gdLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        attribution: '© 高德地图 | 圣经地理大百科'
    }).addTo(map);

    const overlayConfigs = {};
    const allFeatureGroups = [];

    // 确保数据已加载
    if (typeof BIBLE_HEROES === 'undefined') {
        console.error("未找到 BIBLE_HEROES 数据，请检查 data.js 是否正确引入");
        return;
    }

    BIBLE_HEROES.forEach(hero => {
        const markerGroup = L.layerGroup();
        const pathCoords = [];

        hero.points.forEach((point, index) => {
            pathCoords.push(point.coords);

            // 弹出窗口样式增强
            const popupHTML = `
                <div style="font-family: 'Microsoft YaHei', sans-serif; width:220px;">
                    <div style="background:${hero.color}; color:white; padding:5px 10px; border-radius:5px 5px 0 0; margin:-10px -10px 10px -10px;">
                        <span style="font-size:12px; opacity:0.8;">人物档案</span><br>
                        <strong style="font-size:16px;">${hero.name}</strong>
                    </div>
                    <div style="border-left: 3px solid ${hero.color}; padding-left: 10px; margin-top:10px;">
                        <b style="font-size:14px; color:#333;">第 ${index + 1} 站：${point.name}</b>
                        <p style="margin-top:8px; font-size:13px; color:#666; line-height:1.6; text-align:justify;">
                            ${point.desc}
                        </p>
                    </div>
                    <div style="text-align:right; margin-top:10px;">
                        <a href="https://www.biblegateway.com/search?search=${encodeURIComponent(point.name)}&version=CUVS" target="_blank" style="font-size:11px; color:${hero.color}; text-decoration:none;">查阅圣经原文 →</a>
                    </div>
                </div>
            `;

            L.marker(point.coords).bindPopup(popupHTML).addTo(markerGroup);
        });

        // 绘制行踪线
        const polyline = L.polyline(pathCoords, {
            color: hero.color,
            weight: 3,
            dashArray: hero.dash || '0', // 增加容错
            opacity: 0.7
        });

        const heroLayer = L.layerGroup([markerGroup, polyline]).addTo(map);
        const label = `<span style="color:${hero.color}">●</span> ${hero.name}`;
        overlayConfigs[label] = heroLayer;
        allFeatureGroups.push(heroLayer);
    });

    // 控制面板优化
    const layerControl = L.control.layers(null, overlayConfigs, { 
        collapsed: false 
    }).addTo(map);

    // 适配移动端面板滚动
    const container = layerControl.getContainer();
    container.style.maxHeight = '60vh';
    container.style.overflowY = 'auto';
    container.style.borderRadius = '10px';
    container.style.border = 'none';
    container.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';

    // 自动缩放以包含所有标记
    if (allFeatureGroups.length > 0) {
        const fullGroup = L.featureGroup(allFeatureGroups);
        map.fitBounds(fullGroup.getBounds(), { padding: [30, 30] });
    }
});
