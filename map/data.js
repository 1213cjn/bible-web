/**
 * 圣经地理大百科 - 核心人物全集 (22人版)
 */
const BIBLE_HEROES = [
    // --- 族长时代 ---
    {
        id: "abraham",
        name: "亚伯拉罕：信心之祖",
        color: "#8B4513",
        dash: "5, 5",
        points: [
            { name: "吾珥", coords: [30.9, 46.1], desc: "<b>创11:31</b><br>文明发源地，蒙召离开偶像崇拜之地。" },
            { name: "哈兰", coords: [36.8, 39.0], desc: "<b>创12:4</b><br>中转站，父亲他拉在此去世后，亚伯拉罕正式起行。" },
            { name: "示剑", coords: [32.2, 35.2], desc: "<b>创12:6</b><br>筑第一座坛，神应许将此地赐予其后裔。" },
            { name: "希伯仑", coords: [31.5, 35.1], desc: "<b>创23</b><br>麦比拉洞所在地，族长的永久安息地。" }
        ]
    },
    {
        id: "isaac",
        name: "以撒：应许之子",
        color: "#DEB887",
        dash: "1",
        points: [
            { name: "摩利亚山", coords: [31.77, 35.23], desc: "<b>创22</b><br>奉献以撒之地，预表基督受死。" },
            { name: "别是巴", coords: [31.24, 34.79], desc: "<b>创26:23</b><br>挖井居住，神在此与他坚立盟约。" }
        ]
    },
    {
        id: "jacob",
        name: "雅各：以色列之名",
        color: "#CD853F",
        dash: "3, 3",
        points: [
            { name: "伯特利", coords: [31.9, 35.2], desc: "<b>创28</b><br>梦见天梯，神应许与他同在。" },
            { name: "毗努伊勒", coords: [32.2, 35.7], desc: "<b>创32</b><br>与神摔跤，名字从‘抓’变为‘以色列’。" },
            { name: "埃及(歌珊)", coords: [30.6, 31.8], desc: "<b>创47</b><br>晚年下埃及，在最好的地步养老。" }
        ]
    },
    {
        id: "joseph",
        name: "约瑟：苦难与荣耀",
        color: "#008080",
        dash: "1",
        points: [
            { name: "多坍", coords: [32.4, 35.2], desc: "被卖地，苦难的起点。" },
            { name: "埃及王宫", coords: [30.0, 31.2], desc: "从囚犯成为宰相，拯救全族度过荒年。" }
        ]
    },

    // --- 摩西与征服时代 ---
    {
        id: "moses",
        name: "摩西：律法颁布者",
        color: "#FF8C00",
        dash: "10, 5",
        points: [
            { name: "西奈山", coords: [28.5, 33.9], desc: "<b>出19</b><br>颁布十诫，建立祭司的国度。" },
            { name: "加低斯巴尼亚", coords: [30.6, 34.4], desc: "窥探迦南，因不信流浪40年。" },
            { name: "尼波山", coords: [31.7, 35.7], desc: "远眺应许地而离世。" }
        ]
    },
    {
        id: "joshua",
        name: "约书亚：得地为业",
        color: "#556B2F",
        dash: "2, 2",
        points: [
            { name: "吉甲", coords: [31.8, 35.5], desc: "<b>约4</b><br>过约旦河后的首个营地，立石为证。" },
            { name: "耶利哥", coords: [31.8, 35.4], desc: "围绕城墙七日，神迹攻陷首座坚城。" },
            { name: "基遍", coords: [31.8, 35.1], desc: "祷告使日月停留，大败亚摩利五王。" }
        ]
    },

    // --- 士师与列王时代 ---
    {
        id: "gideon",
        name: "基甸：三百勇士",
        color: "#BDB76B",
        dash: "1",
        points: [
            { name: "哈律泉", coords: [32.5, 35.3], desc: "<b>士7</b><br>筛选300精兵，夜袭米甸大军。" }
        ]
    },
    {
        id: "samson",
        name: "参孙：最后士师",
        color: "#8B0000",
        dash: "1",
        points: [
            { name: "琐拉", coords: [31.7, 34.9], desc: "参孙出生地。" },
            { name: "加沙", coords: [31.5, 34.4], desc: "<b>士16</b><br>推倒大衮庙，与非利士人同归于尽。" }
        ]
    },
    {
        id: "ruth",
        name: "路得：大卫之祖",
        color: "#FF69B4",
        dash: "1",
        points: [
            { name: "摩押", coords: [31.5, 35.8], desc: "经历丧夫之痛，决定跟随婆婆。" },
            { name: "伯利恒", coords: [31.7, 35.2], desc: "拾取麦穗，蒙波阿斯救赎。" }
        ]
    },
    {
        id: "david",
        name: "大卫：合神心意",
        color: "#FFD700",
        dash: "1",
        points: [
            { name: "以拉谷", coords: [31.6, 34.9], desc: "机弦甩石击杀歌利亚。" },
            { name: "洗革拉", coords: [31.3, 34.6], desc: "躲避扫罗时的根据地。" },
            { name: "耶路撒冷", coords: [31.76, 35.21], desc: "定都于此，预备建殿。" }
        ]
    },
    {
        id: "solomon",
        name: "所罗门：智慧之王",
        color: "#F4A460",
        dash: "1",
        points: [
            { name: "耶路撒冷圣殿", coords: [31.778, 35.235], desc: "<b>王上6</b><br>人类历史上最辉煌的圣殿所在地。" }
        ]
    },

    // --- 先知时代 ---
    {
        id: "elijah",
        name: "以利亚：烈火先知",
        color: "#4682B4",
        dash: "5, 2",
        points: [
            { name: "迦密山", coords: [32.7, 35.0], desc: "<b>王上18</b><br>降下烈火战胜450名巴力先知。" },
            { name: "何烈山", coords: [28.5, 33.9], desc: "在微小声音中听见神的吩咐。" }
        ]
    },
    {
        id: "elisha",
        name: "以利沙：加倍灵感",
        color: "#6A5ACD",
        dash: "1",
        points: [
            { name: "耶利哥泉", coords: [31.85, 35.45], desc: "治好水源，神迹的开始。" },
            { name: "多坍", coords: [32.41, 35.24], desc: "满山火车火马保护先知。" }
        ]
    },
    {
        id: "jonah",
        name: "约拿：尼尼微神迹",
        color: "#5F9EA0",
        dash: "8, 4",
        points: [
            { name: "约帕", coords: [32.05, 34.75], desc: "逃往他施的起点。" },
            { name: "尼尼微", coords: [36.3, 43.1], desc: "全城悔改，见证神的慈爱广及外邦。" }
        ]
    },
    {
        id: "daniel",
        name: "丹尼尔：狮子坑中",
        color: "#708090",
        dash: "10, 10",
        points: [
            { name: "巴比伦", coords: [32.5, 44.4], desc: "<b>但6</b><br>狮子坑中蒙保佑，解开末世异象。" }
        ]
    },
    {
        id: "nehemiah",
        name: "尼希米：重建城墙",
        color: "#A0522D",
        dash: "5, 5",
        points: [
            { name: "书珊城", coords: [32.1, 48.2], desc: "波斯王宫中祈祷，获准回乡。" },
            { name: "耶路撒冷", coords: [31.76, 35.21], desc: "52天重建城墙，抵挡仇敌攻击。" }
        ]
    },

    // --- 耶稣与使徒时代 ---
    {
        id: "jesus",
        name: "耶稣：弥赛亚",
        color: "#1E90FF",
        dash: "1",
        points: [
            { name: "伯利恒", coords: [31.7, 35.2], desc: "基督降生。" },
            { name: "加利利海", coords: [32.8, 35.5], desc: "平静风浪，行走水面。" },
            { name: "各各他", coords: [31.77, 35.22], desc: "受难与复活，成全救赎。" }
        ]
    },
    {
        id: "peter",
        name: "彼得：教会磐石",
        color: "#4169E1",
        dash: "2, 1",
        points: [
            { name: "该撒利亚", coords: [32.5, 34.8], desc: "<b>徒10</b><br>哥尼流家讲道，开启外邦宣教之门。" },
            { name: "罗马", coords: [41.9, 12.4], desc: "最终殉道地。" }
        ]
    },
    {
        id: "philip_ev",
        name: "腓利：传福音者",
        color: "#32CD32",
        dash: "1",
        points: [
            { name: "撒马利亚", coords: [32.2, 35.2], desc: "大有能力传讲福音。" },
            { name: "加沙旷野", coords: [31.4, 34.5], desc: "为埃塞俄比亚太监施洗。" }
        ]
    },
    {
        id: "paul_mission",
        name: "保罗：外邦使徒",
        color: "#B22222",
        dash: "5, 2",
        points: [
            { name: "大马士革", coords: [33.5, 36.3], desc: "路上见大光，彻底翻转。" },
            { name: "安提阿", coords: [36.1, 36.1], desc: "宣教差派中心。" },
            { name: "以弗所", coords: [37.9, 27.3], desc: "推喇奴学房传道三年。" }
        ]
    },
    {
        id: "john_rev",
        name: "约翰：启示录",
        color: "#9932CC",
        dash: "1",
        points: [
            { name: "拔摩岛", coords: [37.3, 26.5], desc: "<b>启1</b><br>被放逐期间领受末世惊人异象。" }
        ]
    },
    {
        id: "steven",
        name: "司提反：首位殉道者",
        color: "#FF4500",
        dash: "1",
        points: [
            { name: "耶路撒冷", coords: [31.765, 35.215], desc: "<b>徒7</b><br>满有圣灵讲道，在城外被石刑殉道。" }
        ]
    }
];
