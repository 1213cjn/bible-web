document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('bible-map').setView([32, 35], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap | 圣经地理大百科'
    }).addTo(map);

    const overlayConfigs = {};
    const allFeatureGroups = [];

    BIBLE_HEROES.forEach(hero => {
        const markerGroup = L.layerGroup();
        const pathCoords = [];

        hero.points.forEach((point, index) => {
            pathCoords.push(point.coords);

            // 增强版弹窗内容：使用了更精美的 CSS 样式
            const popupHTML = `
                <div style="font-family: 'Microsoft YaHei', sans-serif; width:220px;">
                    <div style="background:${hero.color}; color:white; padding:5px 10px; border-radius:5px 5px 0 0; margin:-10px -10px 10px -10px;">
                        <span style="font-size:12px; opacity:0.8;">人物档案</span><br>
                        <strong style="font-size:16px;">${hero.name}</strong>
                    </div>
                    <div style="border-left: 3px solid ${hero.color}; padding-left: 10px;">
                        <b style="font-size:14px; color:#333;">第 ${index + 1} 站：${point.name}</b>
                        <p style="margin-top:8px; font-size:13px; color:#666; line-height:1.6; text-align:justify;">
                            ${point.desc}
                        </p>
                    </div>
                    <div style="text-align:right; margin-top:10px;">
                        <a href="https://www.biblegateway.com/search?search=${encodeURIComponent(point.name)}&version=CUVS" target="_blank" style="font-size:11px; color:${hero.color}; text-decoration:none;">查阅地图文献 →</a>
                    </div>
                </div>
            `;

            L.marker(point.coords).bindPopup(popupHTML).addTo(markerGroup);
        });

        const polyline = L.polyline(pathCoords, {
            color: hero.color,
            weight: 3,
            dashArray: hero.dash,
            opacity: 0.6
        });

        const heroLayer = L.layerGroup([markerGroup, polyline]).addTo(map);
        const label = `<span style="color:${hero.color}">●</span> ${hero.name}`;
        overlayConfigs[label] = heroLayer;
        allFeatureGroups.push(heroLayer);
    });

    // --- 针对“非常多人”的优化 ---
    const layerControl = L.control.layers(null, overlayConfigs, { 
        collapsed: false 
    }).addTo(map);

    // 动态调整右侧面板高度，防止溢出屏幕
    const container = layerControl.getContainer();
    container.style.maxHeight = '70vh';
    container.style.overflowY = 'auto';
    container.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';

    if (allFeatureGroups.length > 0) {
        map.fitBounds(L.featureGroup(allFeatureGroups).getBounds(), { padding: [50, 50] });
    }
});
