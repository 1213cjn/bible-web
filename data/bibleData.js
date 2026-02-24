// data/bibleData.js
const OT = require('./old_testament_data_simplified.js');
const NT = require('./new_testament_data_simplified.js');
const ALL = OT.concat(NT);

// abbrev -> bookObject
const INDEX = Object.create(null);
ALL.forEach(b => { INDEX[b.abbrev] = b; });

// abbrev -> 中文书名（显示用）
const CN_NAME = {
  // OT
  gn:'创世记', ex:'出埃及记', lv:'利未记', nm:'民数记', dt:'申命记',
  js:'约书亚记', jud:'士师记', rt:'路得记', '1sm':'撒母耳记上', '2sm':'撒母耳记下',
  '1kgs':'列王纪上','2kgs':'列王纪下','1ch':'历代志上','2ch':'历代志下',
  ezr:'以斯拉记', ne:'尼希米记', et:'以斯帖记', job:'约伯记', ps:'诗篇',
  prv:'箴言', ec:'传道书', so:'雅歌', is:'以赛亚书', jr:'耶利米书',
  lm:'耶利米哀歌', ez:'以西结书', dn:'但以理书',
  ho:'何西阿书', jl:'约珥书', am:'阿摩司书', ob:'俄巴底亚书', jn:'约拿书',
  mi:'弥迦书', na:'那鸿书', hk:'哈巴谷书', zp:'西番雅书', hg:'哈该书',
  zc:'撒迦利亚书', ml:'玛拉基书',
  // NT
  mt:'马太福音', mk:'马可福音', lk:'路加福音', jo:'约翰福音', act:'使徒行传',
  rm:'罗马书', '1co':'哥林多前书','2co':'哥林多后书', gl:'加拉太书', eph:'以弗所书',
  ph:'腓立比书', cl:'歌罗西书', '1ts':'帖撒罗尼迦前书','2ts':'帖撒罗尼迦后书',
  '1tm':'提摩太前书','2tm':'提摩太后书', tt:'提多书', phm:'腓利门书',
  hb:'希伯来书', jm:'雅各书', '1pe':'彼得前书','2pe':'彼得后书',
  '1jo':'约翰一书','2jo':'约翰二书','3jo':'约翰三书', jd:'犹大书', re:'启示录'
};

function normalizeVerse(v) {
  return (v || '').replace(/\s+/g, '');
}

function getChapterVerses(bookId, chapter) {
  const book = INDEX[bookId];
  if (!book) return [];
  const ch = parseInt(chapter, 10);
  if (!Number.isFinite(ch) || ch <= 0) return [];
  const raw = (book.chapters && book.chapters[ch - 1]) ? book.chapters[ch - 1] : [];
  return raw.map((v, i) => ({ verse: i + 1, text: normalizeVerse(v) }));
}

function getChapterText(bookId, chapter) {
  const ch = parseInt(chapter, 10);
  const verses = getChapterVerses(bookId, ch);
  if (!verses.length) return '该章节暂无数据';
  return verses.map(it => `${ch}:${it.verse} ${it.text}`).join('\n');
}

module.exports = {
  // 首页显示用中文名；id 仍是 abbrev，读取不会错
  books: ALL.map(b => ({
    id: b.abbrev,
    name: CN_NAME[b.abbrev] || b.name,          // 优先中文
    chapterCount: (b.chapters || []).length
  })),
  getChapterVerses,
  getChapterText
};