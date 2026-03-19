// 全局工具函数
function $(id) { return document.getElementById(id); }

const STORAGE_KEYS = {
  favorites: '_favorites_v1',
  settings: '_reader_settings_v2'
};

function showToast(msg, ms = 1500) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove('show'), ms);
}

function safeJSONParse(str, fallback) {
  try { return JSON.parse(str) || fallback; } catch (e) { return fallback; }
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    // 核心：确保 body 有主题类名，否则 CSS 变量无法生效
    document.body.className = `theme-${this.data.theme}`;
    
    const colors = { light: '#f7f7f7', dark: '#121212', parchment: '#f4ebd8' };
    if ($('themeColorMeta')) $('themeColorMeta').content = colors[this.data.theme];
    
    const root = document.documentElement;
    root.style.setProperty('--font-size', `${this.data.fontSize}px`);
    root.style.setProperty('--line-height', this.data.lineHeight);
    root.style.setProperty('--para-spacing', `${this.data.paraSpacing}px`);

    // 防御性赋值：如果 HTML 里删了这些 ID，JS 不会报错
    if ($('valFont')) $('valFont').textContent = this.data.fontSize;
    if ($('valLine')) $('valLine').textContent = this.data.lineHeight;
    if ($('valPara')) $('valPara').textContent = this.data.paraSpacing;

    document.querySelectorAll('.ctrl-btn[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.data.theme);
    });
  },
  setTheme(t) { this.data.theme = t; this.save(); },
  changeFont(delta) { this.data.fontSize = Math.max(16, Math.min(36, this.data.fontSize + delta)); this.save(); }
};

// 书名映射 (简版)
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

  // ===== 常见缩写/全名 =====
  gen:'创世记', genesis:'创世记',
  exo:'出埃及记', exodus:'出埃及记',
  lev:'利未记', leviticus:'利未记',
  num:'民数记', numbers:'民数记',
  deu:'申命记', deuteronomy:'申命记',
  jos:'约书亚记', joshua:'约书亚记',
  jdg:'士师记', judg:'士师记', judges:'士师记',
  rut:'路得记', ruth:'路得记',
  '1sa':'撒母耳记上', '2sa':'撒母耳记下',
  '1kg':'列王纪上', '1kgs':'列王纪上', '1kings':'列王纪上',
  '2kg':'列王纪下', '2kgs':'列王纪下', '2kings':'列王纪下',
  '1chr':'历代志上', '2chr':'历代志下',
  ezra:'以斯拉记', neh:'尼希米记', nehemiah:'尼希米记', est:'以斯帖记', esther:'以斯帖记',
  job:'约伯记', psa:'诗篇', psalms:'诗篇', pro:'箴言', proverbs:'箴言',
  ecc:'传道书', ecclesiastes:'传道书', sng:'雅歌', songofsolomon:'雅歌',
  isa:'以赛亚书', isaiah:'以赛亚书', jer:'耶利米书', jeremiah:'耶利米书',
  lam:'耶利米哀歌', lamentations:'耶利米哀歌', eze:'以西结书', ezekiel:'以西结书',
  dan:'但以理书', daniel:'但以理书',
  hos:'何西阿书', hosea:'何西阿书', joe:'约珥书', joel:'约珥书',
  amo:'阿摩司书', amos:'阿摩司书', oba:'俄巴底亚书', obadiah:'俄巴底亚书',
  jon:'约拿书', jonah:'约拿书', mic:'弥迦书', micah:'弥迦书',
  nah:'那鸿书', nahum:'那鸿书', hab:'哈巴谷书', habakkuk:'哈巴谷书',
  zep:'西番雅书', zephaniah:'西番雅书', hag:'哈该书', haggai:'哈该书',
  zec:'撒迦利亚书', zechariah:'撒迦利亚书', mal:'玛拉基书', malachi:'玛拉基书',

  mat:'马太福音', matthew:'马太福音',
  mar:'马可福音', mark:'马可福音',
  luk:'路加福音', luke:'路加福音',
  jhn:'约翰福音', john:'约翰福音',
  act:'使徒行传', acts:'使徒行传',
  rom:'罗马书', romans:'罗马书',
  '1cor':'哥林多前书', '2cor':'哥林多后书',
  gal:'加拉太书', galatians:'加拉太书',
  eph:'以弗所书', ephesians:'以弗所书',
  php:'腓立比书', phil:'腓立比书', philippians:'腓立比书',
  col:'歌罗西书', colossians:'歌罗西书',
  '1ths':'帖撒罗尼迦前书', '2ths':'帖撒罗尼迦后书',
  '1tim':'提摩太前书', '2tim':'提摩太后书',
  tit:'提多书', titus:'提多书',
  phm:'腓利门书', philemon:'腓利门书',
  heb:'希伯来书', hebrews:'希伯来书',
  jas:'雅各书', james:'雅各书',
  '1pet':'彼得前书', '2pet':'彼得后书',
  '1jn':'约翰一书', '2jn':'约翰二书', '3jn':'约翰三书',
  jude:'犹大书', rev:'启示录', revelation:'启示录'
};

// 数据库逻辑
const DB = {
  loaded: false,
  index: {},
  bookMeta: [],
  init(OT, NT) {
    const allBooks = [...OT, ...NT];
    this.bookMeta = allBooks.map(b => {
      const id = b.abbrev.toLowerCase();
      this.index[id] = b; 
      return { id: id, name: BOOK_NAME_CN[id] || b.name, chapterCount: b.chapters.length };
    });
    this.loaded = true;
  },
  getBooks() { return this.bookMeta; },
  getChapterVerses(bookId, chapter) {
    const book = this.index[bookId];
    if (!book) return [];
    const verses = book.chapters[chapter - 1];
    return verses ? verses.map((t, i) => ({ verse: i + 1, text: t })) : [];
  }
};

// 收藏系统
const FavoriteStore = {
  load() { return safeJSONParse(localStorage.getItem(STORAGE_KEYS.favorites), []); },
  save(data) { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(data)); },
  has(bid, ch, v) { return this.load().some(it => it.bookId === bid && it.chapter === ch && it.verse === v); },
  toggle(item) {
    const arr = this.load();
    const idx = arr.findIndex(it => it.bookId === item.bookId && it.chapter === item.chapter && it.verse === item.verse);
    if (idx >= 0) { arr.splice(idx, 1); this.save(arr); return false; }
    arr.unshift({ ...item, ts: Date.now() });
    this.save(arr); return true;
  }
};

// 状态管理
const AppState = {
  view: 'loading', currentBookId: '', currentBookName: '', currentChapter: 1, history: [],
  push(viewName) {
    if (this.view && this.view !== 'loading') this.history.push(this.view);
    this.view = viewName; this.render();
  },
  go(viewName) { this.view = viewName; this.render(); },
  back() {
    if (!this.history.length) { this.go('books'); return; }
    this.view = this.history.pop(); this.render();
  },
  render() {
    const v = this.view;
    // 视图切换逻辑
    ['viewLoading', 'viewBooks', 'viewChapters', 'viewReader', 'viewFavorites'].forEach(id => {
      const el = $(id);
      if (el) el.classList.add('hidden');
    });
    const target = $('view' + v.charAt(0).toUpperCase() + v.slice(1));
    if (target) target.classList.remove('hidden');

    // UI 状态
    $('btnBack').style.display = (v === 'books' || v === 'loading') ? 'none' : 'block';
    $('btnChatRoom').style.display = (v === 'books') ? 'block' : 'none';
    $('toolbar').classList.toggle('hidden', v !== 'reader' && v !== 'favorites');
    
    const titles = { books: '圣经目录', chapters: this.currentBookName, reader: `${this.currentBookName} 第${this.currentChapter}章`, favorites: '我的收藏' };
    $('topTitle').textContent = titles[v] || '圣经Lite';
  }
};

// 渲染函数群
function renderBooks() {
  const grid = $('bookGrid'); grid.innerHTML = '';
  DB.getBooks().forEach(book => {
    const el = document.createElement('div');
    el.className = 'book-item';
    el.innerHTML = `<div>${book.name}</div><small>${book.chapterCount}章</small>`;
    el.onclick = () => {
      AppState.currentBookId = book.id; AppState.currentBookName = book.name;
      renderChapters(); AppState.push('chapters');
    };
    grid.appendChild(el);
  });
}

function renderChapters() {
  $('chaptersTitle').textContent = `${AppState.currentBookName} · 选择章节`;
  const grid = $('chapterGrid'); grid.innerHTML = '';
  const meta = DB.getBooks().find(b => b.id === AppState.currentBookId);
  for (let i = 1; i <= (meta?.chapterCount || 0); i++) {
    const el = document.createElement('div');
    el.className = 'chapter-item'; el.textContent = i;
    el.onclick = () => {
      AppState.currentChapter = i; renderReader(); AppState.push('reader');
    };
    grid.appendChild(el);
  }
}

function renderReader() {
  const { currentBookId: bid, currentBookName: bname, currentChapter: ch } = AppState;
  const box = $('verseContainer'); box.innerHTML = '';
  const verses = DB.getChapterVerses(bid, ch);
  
  verses.forEach(v => {
    const row = document.createElement('div');
    row.className = 'verse-row';
    const isFav = FavoriteStore.has(bid, ch, v.verse);
    row.innerHTML = `
      <div class="verse-text"><span class="verse-no">${v.verse}</span>${escapeHtml(v.text)}</div>
      <button class="star-btn ${isFav?'active':''}">${isFav?'★':'☆'}</button>
    `;
    row.querySelector('.star-btn').onclick = (e) => {
      const active = FavoriteStore.toggle({ bookId: bid, bookName: bname, chapter: ch, verse: v.verse, text: v.text });
      e.target.classList.toggle('active', active);
      e.target.textContent = active ? '★' : '☆';
      showToast(active ? '已收藏' : '取消收藏');
    };
    box.appendChild(row);
  });
  $('main').scrollTop = 0;
}

function bindEvents() {
  $('btnBack').onclick = () => AppState.back();
  $('btnHome').onclick = () => AppState.go('books');
  $('btnFavorites').onclick = () => { renderFavorites(); AppState.push('favorites'); };
  $('btnSettings').onclick = () => { $('settingsOverlay').classList.add('show'); $('settingsPanel').classList.add('show'); };
  $('settingsOverlay').onclick = () => { $('settingsOverlay').classList.remove('show'); $('settingsPanel').classList.remove('show'); };
  $('btnChatRoom').onclick = () => window.location.href = 'chat.html';
  
  document.querySelectorAll('.ctrl-btn[data-theme]').forEach(btn => {
    btn.onclick = () => Settings.setTheme(btn.dataset.theme);
  });
  $('btnFontMinus').onclick = () => Settings.changeFont(-2);
  $('btnFontPlus').onclick = () => Settings.changeFont(2);
}

async function bootstrap() {
  try {
    Settings.load();
    bindEvents();
    const [OT, NT] = await Promise.all([
      fetch('old_testament_data_simplified.json').then(r => r.json()),
      fetch('new_testament_data_simplified.json').then(r => r.json())
    ]);
    DB.init(OT, NT);
    renderBooks();
    AppState.go('books');
  } catch (err) {
    $('viewLoading').innerHTML = `<div style="color:red;padding:20px;">加载失败: ${err.message}</div>`;
  }
}

bootstrap();
