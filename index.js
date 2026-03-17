// 全局工具函数（使用 function 声明保证跨文件可用）
function $(id) { return document.getElementById(id); }

const STORAGE_KEYS = {
  favorites: '_favorites_v1',
  settings: '_reader_settings_v2'
};

function showToast(msg, ms = 1500) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove('show'), ms);
}

function safeJSONParse(str, fallback) {
  try { return JSON.parse(str) || fallback; } catch (e) { return fallback; }
}

function normalizeVerseText(v) {
  return String(v || '').replace(/\s+/g, '');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function loadCommonJSArray(url) {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`加载失败: ${url}`);
  const txt = await res.text();
  const m = txt.match(/module\.exports\s*=\s*([\s\S]*?)\s*;?\s*$/);
  if (!m) throw new Error(`无法解析数据文件: ${url}`);
  return (new Function(`return (${m[1]});`))();
}

// 设置与排版系统
const Settings = {
  data: { theme: 'light', fontSize: 22, lineHeight: 1.8, paraSpacing: 14 },
  load() {
    const saved = safeJSONParse(localStorage.getItem(STORAGE_KEYS.settings), null);
    if (saved) this.data = { ...this.data, ...saved };
    this.applyAll();
  },
  save() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.data));
    this.applyAll();
  },
  applyAll() {
    document.body.className = `theme-${this.data.theme}`;
    const colors = { light: '#f7f7f7', dark: '#121212', parchment: '#f4ebd8' };
    $('themeColorMeta').content = colors[this.data.theme];
    
    const root = document.documentElement;
    root.style.setProperty('--font-size', `${this.data.fontSize}px`);
    root.style.setProperty('--line-height', this.data.lineHeight.toFixed(1));
    root.style.setProperty('--para-spacing', `${this.data.paraSpacing}px`);

    $('valFont').textContent = this.data.fontSize;
    $('valLine').textContent = this.data.lineHeight.toFixed(1);
    $('valPara').textContent = this.data.paraSpacing;

    document.querySelectorAll('.ctrl-btn[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.data.theme);
    });
  },
  setTheme(t) { this.data.theme = t; this.save(); },
  changeFont(delta) { this.data.fontSize = Math.max(16, Math.min(36, this.data.fontSize + delta)); this.save(); },
  changeLine(delta) { this.data.lineHeight = Math.max(1.2, Math.min(2.4, this.data.lineHeight + delta)); this.save(); },
  changePara(delta) { this.data.paraSpacing = Math.max(8, Math.min(30, this.data.paraSpacing + delta)); this.save(); }
};

// 书名映射字典 (完整版保留)
const BOOK_NAME_CN = {
  gn:'创世记', ex:'出埃及记', lv:'利未记', nm:'民数记', dt:'申命记',
  js:'约书亚记', jud:'士师记', rt:'路得记',
  '1sm':'撒母耳记上', '2sm':'撒母耳记下',
  '1ki':'列王纪上', '2ki':'列王纪下',
  '1ch':'历代志上', '2ch':'历代志下',
  ezr:'以斯拉记', ne:'尼希米记', et:'以斯帖记',
  jb:'约伯记', ps:'诗篇', prv:'箴言', ec:'传道书', so:'雅歌',
  is:'以赛亚书', jr:'耶利米书', lm:'耶利米哀歌', ez:'以西结书', dn:'但以理书',
  ho:'何西阿书', jl:'约珥书', am:'阿摩司书', ob:'俄巴底亚书', jn:'约拿书',
  mi:'弥迦书', na:'那鸿书', hk:'哈巴谷书', zp:'西番雅书', hg:'哈该书',
  zc:'撒迦利亚书', ml:'玛拉基书',

  mt:'马太福音', mk:'马可福音', lk:'路加福音', jo:'约翰福音',
  ac:'使徒行传', rm:'罗马书',
  '1co':'哥林多前书', '2co':'哥林多后书',
  gl:'加拉太书', ep:'以弗所书', ph:'腓立比书', cl:'歌罗西书',
  '1ts':'帖撒罗尼迦前书', '2ts':'帖撒罗尼迦后书',
  '1tm':'提摩太前书', '2tm':'提摩太后书',
  tt:'提多书', phm:'腓利门书', hb:'希伯来书', jm:'雅各书',
  '1pe':'彼得前书', '2pe':'彼得后书',
  '1jo':'约翰一书', '2jo':'约翰二书', '3jo':'约翰三书',
  jd:'犹大书', re:'启示录',

  gen:'创世记', genesis:'创世记', exo:'出埃及记', exodus:'出埃及记',
  lev:'利未记', leviticus:'利未记', num:'民数记', numbers:'民数记',
  deu:'申命记', deuteronomy:'申命记', jos:'约书亚记', joshua:'约书亚记',
  jdg:'士师记', judg:'士师记', judges:'士师记', rut:'路得记', ruth:'路得记',
  '1sa':'撒母耳记上', '2sa':'撒母耳记下', '1kg':'列王纪上', '1kgs':'列王纪上', '1kings':'列王纪上',
  '2kg':'列王纪下', '2kgs':'列王纪下', '2kings':'列王纪下', '1chr':'历代志上', '2chr':'历代志下',
  ezra:'以斯拉记', neh:'尼希米记', nehemiah:'尼希米记', est:'以斯帖记', esther:'以斯帖记',
  job:'约伯记', psa:'诗篇', psalms:'诗篇', pro:'箴言', proverbs:'箴言',
  ecc:'传道书', ecclesiastes:'传道书', sng:'雅歌', songofsolomon:'雅歌',
  isa:'以赛亚书', isaiah:'以赛亚书', jer:'耶利米书', jeremiah:'耶利米书',
  lam:'耶利米哀歌', lamentations:'耶利米哀歌', eze:'以西结书', ezekiel:'以西结书',
  dan:'但以理书', daniel:'但以理书', hos:'何西阿书', hosea:'何西阿书', joe:'约珥书', joel:'约珥书',
  amo:'阿摩司书', amos:'阿摩司书', oba:'俄巴底亚书', obadiah:'俄巴底亚书',
  jon:'约拿书', jonah:'约拿书', mic:'弥迦书', micah:'弥迦书',
  nah:'那鸿书', nahum:'那鸿书', hab:'哈巴谷书', habakkuk:'哈巴谷书',
  zep:'西番雅书', zephaniah:'西番雅书', hag:'哈该书', haggai:'哈该书',
  zec:'撒迦利亚书', zechariah:'撒迦利亚书', mal:'玛拉基书', malachi:'玛拉基书',

  mat:'马太福音', matthew:'马太福音', mar:'马可福音', mark:'马可福音',
  luk:'路加福音', luke:'路加福音', jhn:'约翰福音', john:'约翰福音',
  act:'使徒行传', acts:'使徒行传', rom:'罗马书', romans:'罗马书',
  '1cor':'哥林多前书', '2cor':'哥林多后书', gal:'加拉太书', galatians:'加拉太书',
  eph:'以弗所书', ephesians:'以弗所书', php:'腓立比书', phil:'腓立比书', philippians:'腓立比书',
  col:'歌罗西书', colossians:'歌罗西书', '1ths':'帖撒罗尼迦前书', '2ths':'帖撒罗尼迦后书',
  '1tim':'提摩太前书', '2tim':'提摩太后书', tit:'提多书', titus:'提多书',
  phm:'腓利门书', philemon:'腓利门书', heb:'希伯来书', hebrews:'希伯来书',
  jas:'雅各书', james:'雅各书', '1pet':'彼得前书', '2pet':'彼得后书',
  '1jn':'约翰一书', '2jn':'约翰二书', '3jn':'约翰三书', jude:'犹大书', rev:'启示录', revelation:'启示录'
};

function getBookDisplayName(book) {
  const abbrevKey = String(book.abbrev || '').trim().toLowerCase();
  return BOOK_NAME_CN[abbrevKey] || book.name || book.abbrev;
}

// 数据库逻辑
// 数据库逻辑 - 替换这部分
const DB = {
  loaded: false,
  index: {},
  bookMeta: [],

  async init(OT, NT) { // 接收传入的数据
    if (this.loaded) return;
    
    // 合并新旧约
    const allBooks = [...OT, ...NT];
    
    // 生成索引和元数据
    this.bookMeta = allBooks.map(b => {
      // 将书籍存入索引，方便后续查询
      this.index[b.abbrev] = b; 
      
      return { 
        id: b.abbrev, 
        name: getBookDisplayName(b), 
        chapterCount: b.chapters ? b.chapters.length : 0 
      };
    });
    
    this.loaded = true;
    console.log("数据库初始化完成:", this.bookMeta.length, "本书");
  },

  getBooks() {
    return this.bookMeta;
  },

  getBookMetaById(bookId) {
    return this.bookMeta.find(b => b.id === bookId);
  },

  getChapterVerses(bookId, chapter) {
    const book = this.index[bookId];
    if (!book || !book.chapters) return [];
    // 章节从 1 开始，数组从 0 开始
    const chapterData = book.chapters[chapter - 1]; 
    return chapterData ? chapterData.map((text, idx) => ({ verse: idx + 1, text })) : [];
  }
};

// 收藏系统
const FavoriteStore = {
  load() { return safeJSONParse(localStorage.getItem(STORAGE_KEYS.favorites), []); },
  save(data) { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(data)); },
  has(bookId, chapter, verse) { return this.load().some(it => it.bookId === bookId && it.chapter === chapter && it.verse === verse); },
  toggle(item) {
    const arr = this.load();
    const idx = arr.findIndex(it => it.bookId === item.bookId && it.chapter === item.chapter && it.verse === item.verse);
    if (idx >= 0) { arr.splice(idx, 1); this.save(arr); return false; }
    arr.unshift({ ...item, ts: Date.now() });
    this.save(arr); return true;
  },
  remove(bookId, chapter, verse) {
    const arr = this.load();
    const idx = arr.findIndex(it => it.bookId === bookId && it.chapter === chapter && it.verse === verse);
    if (idx >= 0) { arr.splice(idx, 1); this.save(arr); }
  }
};

// 状态管理
const AppState = {
  view: 'loading', currentBookId: '', currentBookName: '', currentChapter: 1, history: [],
  push(viewName) {
    if (this.view && this.view !== 'loading') this.history.push(this.view);
    this.view = viewName; render();
  },
  go(viewName) { this.view = viewName; render(); },
  back() {
    if (!this.history.length) { this.go('books'); return; }
    this.view = this.history.pop(); render();
  }
};

function setTopTitle(text) { $('topTitle').textContent = text; }

// 注意：这里加入了 viewChat
function showOnly(viewId) {
  ['viewLoading', 'viewBooks', 'viewChapters', 'viewReader', 'viewFavorites'].forEach(id => {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });
  const target = $(viewId);
  if (target) target.classList.remove('hidden');
}
async function loadBibleData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`无法获取文件: ${url}`);
  // 如果你的文件是纯 JSON，直接用 res.json() 更安全
  try {
    const text = await res.text();
    // 兼容你之前的 module.exports 格式
    const m = text.match(/module\.exports\s*=\s*([\s\S]*?)\s*;?\s*$/);
    return m ? (new Function(`return (${m[1]});`))() : JSON.parse(text);
  } catch (e) {
    throw new Error("数据解析失败，请检查文件格式");
  }
}
function renderBooks() {
  const grid = $('bookGrid'); grid.innerHTML = '';
  DB.getBooks().forEach(book => {
    const el = document.createElement('div');
    el.className = 'book-item';
    el.innerHTML = `<div>${book.name}</div><small>${book.chapterCount} 章</small>`;
    el.onclick = () => {
      AppState.currentBookId = book.id; AppState.currentBookName = book.name;
      renderChapters(); AppState.push('chapters'); $('main').scrollTop = 0;
    };
    grid.appendChild(el);
  });
}

function renderChapters() {
  $('chaptersTitle').textContent = `${AppState.currentBookName} · 选择章节`;
  const grid = $('chapterGrid'); grid.innerHTML = '';
  const count = DB.getBookMetaById(AppState.currentBookId)?.chapterCount || 0;
  for (let i = 1; i <= count; i++) {
    const el = document.createElement('div');
    el.className = 'chapter-item'; el.textContent = i;
    el.onclick = () => {
      AppState.currentChapter = i; renderReader(); AppState.push('reader'); $('main').scrollTop = 0;
    };
    grid.appendChild(el);
  }
}

function renderReader() {
  const { currentBookId: bid, currentBookName: bname, currentChapter: ch } = AppState;
  $('readerTitle').textContent = `${bname} 第 ${ch} 章`;
  const box = $('verseContainer'); box.innerHTML = '';
  
  const verses = DB.getChapterVerses(bid, ch);
  if (!verses.length) { box.innerHTML = `<div class="empty">该章节暂无数据</div>`; return; }

  verses.forEach(v => {
    const row = document.createElement('div');
    row.className = 'verse-row';
    const fav = FavoriteStore.has(bid, ch, v.verse);
    
    row.innerHTML = `
      <div class="verse-text"><span class="verse-no">${ch}:${v.verse}</span>${escapeHtml(v.text)}</div>
      <button class="star-btn ${fav ? 'active' : ''}"> ${fav ? '★' : '☆'} </button>
    `;

    row.querySelector('.star-btn').onclick = (e) => {
      e.stopPropagation();
      const isFav = FavoriteStore.toggle({ bookId: bid, bookName: bname, chapter: ch, verse: v.verse, text: v.text });
      e.target.classList.toggle('active', isFav);
      e.target.textContent = isFav ? '★' : '☆';
      showToast(isFav ? '已收藏' : '已取消收藏');
    };
    box.appendChild(row);
  });
}

function renderFavorites() {
  const list = FavoriteStore.load().sort((a,b) => b.ts - a.ts);
  $('favCountBadge').textContent = `${list.length} 条`;
  const box = $('favoriteList'); box.innerHTML = '';
  if (!list.length) { box.innerHTML = `<div class="empty">暂无收藏内容</div>`; return; }

  list.forEach(item => {
    const row = document.createElement('div');
    row.className = 'verse-row';
    row.innerHTML = `
      <div class="verse-text"><span class="verse-no">${item.bookName} ${item.chapter}:${item.verse}</span>${escapeHtml(item.text)}</div>
      <button class="star-btn active">★</button>
    `;
    row.onclick = () => {
      AppState.currentBookId = item.bookId; AppState.currentBookName = item.bookName; AppState.currentChapter = item.chapter;
      renderReader(); AppState.push('reader');
      setTimeout(() => {
        const targetRow = document.querySelectorAll('#verseContainer .verse-row')[item.verse - 1];
        if (targetRow) targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };
    row.querySelector('.star-btn').onclick = (e) => {
      e.stopPropagation();
      FavoriteStore.remove(item.bookId, item.chapter, item.verse);
      renderFavorites(); showToast('已取消收藏');
    };
    box.appendChild(row);
  });
}

function render() {
  // 左上角返回按钮控制：在主页和加载页隐藏，其他页显示
  if (AppState.view === 'books' || AppState.view === 'loading') {
    $('btnBack').style.display = 'none';
    $('btnChatRoom').style.display = 'block'; // 在主页显示聊天入口
  } else {
    $('btnBack').style.display = 'block';
    $('btnChatRoom').style.display = 'none'; // 其他页隐藏聊天入口
  }

  // 底部工具栏控制
  $('toolbar').classList.toggle('hidden', AppState.view !== 'reader' && AppState.view !== 'favorites');
  
  const views = {
    'loading': { title: '微读圣经Lite', fn: () => showOnly('viewLoading') },
    'books': { title: '圣经目录', fn: () => showOnly('viewBooks') },
    'chapters': { title: AppState.currentBookName || '选择章节', fn: () => showOnly('viewChapters') },
    'reader': { title: `${AppState.currentBookName} ${AppState.currentChapter}章`, fn: () => showOnly('viewReader') },
    'favorites': { title: '我的收藏', fn: () => showOnly('viewFavorites') },
    'chat': { title: '临时交流室', fn: () => showOnly('viewChat') } // 新增聊天路由
  };
  
  setTopTitle(views[AppState.view].title);
  views[AppState.view].fn();
}

function bindEvents() {
  // 基础导航绑定
  if ($('btnBack')) $('btnBack').onclick = () => AppState.back();
  if ($('btnHome')) $('btnHome').onclick = () => { AppState.history = []; AppState.go('books'); $('main').scrollTop = 0; };
  if ($('btnFavorites')) $('btnFavorites').onclick = () => { renderFavorites(); AppState.push('favorites'); };
  
  // 聊天室入口
  if ($('btnChatRoom')) {
      $('btnChatRoom').onclick = () => {
          // 如果你希望在当前页打开，用 AppState.push('chat')
          // 如果是独立页面，用下面这行：
          window.location.href = 'chat.html';
      };
  }

  // 设置面板绑定 (增加 null 检查，防止找不到元素而崩溃)
  const btnSettings = $('btnSettings');
  if (btnSettings) {
      btnSettings.onclick = () => {
          if ($('settingsOverlay')) $('settingsOverlay').classList.add('show');
          if ($('settingsPanel')) $('settingsPanel').classList.add('show');
      };
  }

  if ($('settingsOverlay')) {
      $('settingsOverlay').onclick = () => {
          $('settingsOverlay').classList.remove('show');
          $('settingsPanel').classList.remove('show');
      };
  }

  // 主题切换
  document.querySelectorAll('.ctrl-btn[data-theme]').forEach(btn => {
    btn.onclick = (e) => Settings.setTheme(e.target.dataset.theme);
  });

  // 字号加减 (这些最容易导致 null 报错，加上保护)
  if ($('btnFontMinus')) $('btnFontMinus').onclick = () => Settings.changeFont(-2);
  if ($('btnFontPlus')) $('btnFontPlus').onclick = () => Settings.changeFont(2);
}

async function bootstrap() {
  try {
    Settings.load();
    bindEvents();
    
    // 1. 修正路径：去掉 /data/，修正后缀：使用 .json
    // 2. 确保 fetch 的文件名与 GitHub 仓库中完全一致
    const [OT, NT] = await Promise.all([
      fetch('/old_testament_data_simplified.json').then(r => r.json()),
      fetch('/new_testament_data_simplified.json').then(r => r.json())
    ]);

    // 3. 将加载的数据传给 DB 初始化
    await DB.init(OT, NT);
    
    // 4. 渲染页面
    renderBooks();
    AppState.go('books');
    
    if (window.ChatSystem) window.ChatSystem.init();
    
  } catch (err) {
    console.error("加载失败:", err);
    $('viewLoading').innerHTML = `
      <div style="color:red; padding:20px;">
        数据加载失败，请检查文件名是否正确<br>
        <small>${err.message}</small>
      </div>`;
  }
}

// 启动程序
bootstrap();
