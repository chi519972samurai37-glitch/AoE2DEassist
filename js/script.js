const techtreeData = window.AOE2_TECHTREE_DATA || { civilizations: [], ageNames: {}, version: "" };
const winrateData = window.AOE2_WINRATE_SNAPSHOTS || { filters: [], snapshots: {}, source: {} };
const counterData = window.AOE2_COUNTER_DATA || { entities: [], relationships: {}, categories: [], summary: {} };
const basicKnowledgeData = window.AOE2_BASIC_KNOWLEDGE || { chapters: [], heroImage: "" };
const playerEcologyData = window.AOE2_PLAYER_ECOLOGY || { title: "玩家生态", sections: [], heroImage: "" };
const counterEntityById = new Map((counterData.entities || []).map((entity) => [entity.id, entity]));
const damageCalcState = {
  attacker: {
    selectedId: "",
    category: "全部",
    query: "",
    attackTech: "none",
    attackExtraTech: "none",
    commonTechs: [],
    civBonus: "none",
    terrain: "level",
  },
  defender: {
    selectedId: "",
    category: "全部",
    query: "",
    defenseTech: "none",
    commonTechs: [],
    civBonus: "none",
    terrain: "level",
  }
};
const economyState = {
  selectedId: "",
  category: "全部",
  query: "",
  buildingCount: 2,
  tcTech: "none",
  foodTech: "none",
  woodTech: "none",
  goldTech: "none",
  stoneTech: "none",
  goldSource: "miners",
  tradeGold: 100,
  tradeDistance: 100,
  tradeTech: "none"
};

const allCivs = [...(techtreeData.civilizations || [])].sort((a, b) => {
  return (a.key || "").localeCompare(b.key || "", "en");
});
const civByKey = new Map(allCivs.map((civ) => [civ.key, civ]));

const civGuides = window.AOE2_CIV_GUIDES || [
  {
    key: "Franks",
    difficulty: "低",
    summary: "用稳定食物经济把斥候和骑士节奏打顺，靠高血量骑兵与便宜城堡持续压迫。",
    official: {
      type: "骑兵文明",
      bonuses: ["采果工的工作速度 +15%", "磨坊科技免费", "骑兵单位从封建时代开始生命值 +20%", "城堡在城堡/帝王时代的费用 -15/25%"],
      uniqueUnits: [{ name: "掷斧兵", role: "步兵", note: "远程进行近战伤害，常用来处理长枪兵和步兵团。" }],
      uniqueTechs: [
        { age: "城堡时代", name: "芒刺斧", effect: "掷斧兵射程 +2" },
        { age: "帝王时代", name: "骑士精神", effect: "马厩工作速度 +40%" }
      ],
      teamBonus: "骑士系视野 +2"
    },
    analysis: {
      economy: {
        title: "食物起步舒服，城堡成本便宜",
        verdict: "黑暗时代采果更稳，后续磨坊科技免费，适合把资源连续转成斥候、骑士和城堡压力。",
        points: ["采果速度快。", "磨坊科技免费升级，种田经济好。", "城堡便宜，可以少安排采石农民。"]
      },
      technology: {
        title: "骑兵路线完整，远程和攻城选择偏窄",
        verdict: "科技树鼓励你围绕马厩和城堡单位打，不适合长期只靠远程单位周旋。",
        points: ["骑士线完整，有重装骑士、游侠和关键骑兵攻防。", "缺少血统，但文明血量加成覆盖骑士线核心强度。", "有火枪、冠军剑士、重型弩炮和火炮，反长枪方式多。"]
      },
      military: {
        title: "斥候到骑士的正面压制文明",
        verdict: "核心是用机动部队先打乱对手经济，再用骑士数量和城堡阵地把优势固定住。",
        points: ["主战兵种是斥候到骑士线，操作简单、容错高。", "封建骑兵血量不如已研究血统的斥候，城堡骑士持平，帝王游侠血量领先。", "掷斧兵远程打近战伤害，是处理长枪兵和步兵的核心特色单位。"]
      }
    },
    maps: {
      open: { fit: "高", opening: "单挑建议 20 人口封建斥候；也可利用弓兵科技完备，剑士或步弓开局出奇制胜。组队基本是中家斥候骑士路线。", economy: "采果速度和免费磨坊科技让速封更顺，种田升级不用额外分心，木材压力更小。", fight: "用便宜城堡控图，骑士负责机动压制；对方长枪成型后补掷斧兵、火枪或重型弩炮。", caution: "骑兵血量加成不是封建真血统：对方点血统后封建劣势，城堡骑士持平，帝王游侠领先。" },
      closed: { fit: "中高", opening: "无干扰发育速度稳定，适合直城骑士、城堡控图或后期游侠路线。", economy: "免费磨坊科技减少种田操作，便宜城堡让采石压力低，能更早把资源转到金马和攻城。", fight: "第一波骑士强度高；阵地战可用城堡、掷斧兵、火枪、火炮和重型弩炮处理长枪阵。", caution: "封闭图不要只爆骑士，缺少劲弩和强力僧侣时，要靠城堡与火炮打开阵地。" },
      nomad: { fit: "中", opening: "采果优势依赖 TC 附近浆果，若能吃到果丛，早期食物会很舒服。", economy: "便宜城堡适合抢关键山头和资源区，少采石也能更快落城堡。", fight: "直城城堡兵掷斧兵能处理步兵和长枪，骑士适合抓分散经济。", caution: "没有海军经济加成，水图不能和强海文明硬拼长期船战，要尽快转陆地城堡与骑士压力。" }
    },
    guide: {
      suitableFor: "新手可以靠经济优势和骑兵血量无脑爆金马赢很多局，所以上手难度低，但高分段要学会转反枪兵种。",
      firstBuild: "开放图练 20 人口封建斥候一直到城堡时代；封闭图练 32 分钟 60 只满科技游侠。",
      practiceRoutes: [
        { label: "开放图", text: "20 人口封建斥候，封建不断斥候，城堡时代双马厩骑士接第二 TC。" },
        { label: "封闭图", text: "无干扰 boom 到 32 分钟左右，练 60 只满科技游侠的资源节奏。" },
        { label: "组队", text: "中家斥候接骑士，目标是保护边家弓兵并持续给对面边家压力。" }
      ],
      armyChoices: [
        { label: "金马", text: "斥候、骑士、重装骑士、游侠是基本盘。" },
        { label: "反长枪", text: "掷斧兵、火枪、冠军剑士、重型弩炮都能处理长枪兵。" },
        { label: "阵地战", text: "便宜城堡控图，火炮拆攻城和建筑，掷斧兵守骑兵正面。" }
      ],
      techLogic: [
        { label: "骑兵线", text: "缺血统但有文明血量加成，骑士线仍是完整主战路线。" },
        { label: "远程线", text: "弓兵科技够开放图变招，但不是后期主轴。" },
        { label: "攻城线", text: "有火炮和重型弩炮，阵地战比直觉上更完整。" }
      ],
      commonMistakes: [
        { problem: "只会一直补骑士。", fix: "对手长枪多时，提前加掷斧兵或攻城器。" },
        { problem: "封建斥候打太久。", fix: "骚扰达到目的就回家补经济，别拖慢城堡时代。" },
        { problem: "便宜城堡不用。", fix: "优势时用城堡固定前线，劣势时用城堡保关键资源。" }
      ]
    }
  },
  {
    key: "Britons",
    difficulty: "中低",
    summary: "用更顺的黑暗时代和超长射程步弓手控制战场，适合练远程走位、阵地推进和团队战后排。",
    official: {
      type: "步弓手文明",
      bonuses: ["羊倌工作速度 +25%", "从城堡时代开始，城镇中心的木材费用 -50%", "步弓手在城堡/帝王时代的射程 +1/+2"],
      uniqueUnits: [{ name: "长弓兵", role: "步弓手", note: "超远射程的城堡单位，适合在保护下打阵地战。" }],
      uniqueTechs: [
        { age: "城堡时代", name: "英皇侍卫", effect: "步弓手和掷矛手系射程 +1；瞭望箭塔系攻击力 +2" },
        { age: "帝王时代", name: "战狼号", effect: "巨型投石机可造成爆破伤害，且准确度更高" }
      ],
      teamBonus: "靶场工作速度 +10%"
    },
    analysis: {
      economy: {
        title: "开局食物稳，城堡时代扩张便宜",
        verdict: "牧羊加成让黑暗时代更容易顺，便宜 TC 支持城堡时代快速开多 TC。",
        points: ["牧羊速度快，黑暗时代食物更稳定。", "城堡时代城镇中心木材 -50%，适合弩手压制后快速补 TC。", "靶场工作速度团队加成，组队后家爆弓更顺。"]
      },
      technology: {
        title: "步弓射程极强，但需要保护体系",
        verdict: "不列颠的强度来自射程，不是单兵硬度；科技选择要围绕远程阵地展开。",
        points: ["步弓线完整，有弩手、劲弩手、护腕和文明射程加成。", "没有拇指环，近距离站桩和移动输出不如部分弓兵文明。", "战狼号强化巨型投石机，封闭图阵地战价值高。"]
      },
      military: {
        title: "远程阵地与团队战后排核心",
        verdict: "越能保持距离，不列颠越强；被骑兵贴脸或投石车命中会迅速崩盘。",
        points: ["主战兵种是弓兵线，城堡和帝王时代靠射程压制。", "长弓兵适合城堡阵地和后期推进，不适合裸奔。", "骑兵不是主轴，需要枪兵、僧侣、投石车保护弓兵。"]
      }
    },
    maps: {
      open: { fit: "高", opening: "牧羊快让小弓开局更稳，推荐 21 人口左右步弓或民兵转弓。", economy: "城堡时代便宜 TC 支持弩手压制后立刻开 2-3 TC，弓兵不断档。", fight: "弩手射程领先，适合压木区、金区和坡地；组队后家基本就是爆弓主力。", caution: "开放图不建议裸直城长弓，城堡兵强但成型慢，容易被骑兵和投石车抓死。" },
      closed: { fit: "高", opening: "free boom 很舒服，城堡时代便宜 TC 让经济扩张速度快。", economy: "安全发育后，木材节省会转化为更多 TC、靶场和农田。", fight: "阵地战强：长弓兵、劲弩手、长戟兵、巨型投石机和战狼号都服务远程推进。", caution: "缺少火炮，处理敌方攻城和高远防单位时要依赖巨投、投石车和站位。" },
      nomad: { fit: "中", opening: "如果 TC 靠近羊群或动物，牧羊加成能让早期上封建更顺。", economy: "便宜 TC 有利于分散地图补经济，但前期没有采木或采金加成。", fight: "城堡兵长弓兵适合守关键资源点，不适合在大地图追逐机动部队。", caution: "海陆均衡一般，遇到强海文明不要把全部优势押在水面。" }
    },
    guide: {
      suitableFor: "适合练弓兵控兵、射程压制和团队战后排；新手容易赢在射程，也容易死在弓兵走位。",
      firstBuild: "开放图练 21 人口步弓压制接弩手；封闭图练快速城堡三 TC 接长弓兵/劲弩手巨投。",
      practiceRoutes: [
        { label: "开放图", text: "21 人口步弓，封建控第一队弓不要送，城堡第一时间弩手+弹道学。" },
        { label: "封闭图", text: "快速城堡三 TC，补城堡或靶场，后续转长弓兵/劲弩手加巨投。" },
        { label: "组队", text: "后家爆弓，目标是持续给前排骑兵提供远程输出。" }
      ],
      armyChoices: [
        { label: "核心远程", text: "弓兵、弩手、劲弩手、长弓兵。" },
        { label: "保护单位", text: "长戟兵、僧侣、投石车保护远程不被骑兵贴脸。" },
        { label: "阵地推进", text: "长弓兵/劲弩手配巨型投石机，战狼号增强拆城能力。" }
      ],
      techLogic: [
        { label: "弓兵线", text: "射程科技非常强，但没有拇指环，必须靠距离优势打。" },
        { label: "攻城线", text: "没有火炮，后期拆阵地主要靠巨投和战狼号。" },
        { label: "骑兵线", text: "骑兵主要是补位，不是主战路线。" }
      ],
      commonMistakes: [
        { problem: "弓兵走太深。", fix: "推进前先确认退路和对手马厩数量。" },
        { problem: "只顾控弓忘了经济。", fix: "每波交战后检查 TC、房子和农田。" },
        { problem: "看到散兵就硬打。", fix: "利用射程拉扯，或补投石车、骑兵和升级优势。" }
      ]
    }
  },
  {
    key: "Byzantines",
    difficulty: "中",
    summary: "依靠耐久建筑、便宜反制兵和便宜帝王时代，把对手的主力路线拆成低成本交换。",
    official: {
      type: "防御文明",
      bonuses: ["建筑在黑暗/封建/城堡/帝王时代的生命值 +10/20/30/40%", "骆驼骑兵、掷矛手和长矛兵系的费用 -25%", "城镇瞭望、城镇巡逻免费", "升级到帝王时代的费用 -33%", "喷火船和德罗蒙战舰的攻击速度 +25%"],
      uniqueUnits: [{ name: "甲胄骑兵", role: "骑兵", note: "高质量反步兵骑兵，适合处理大量步兵和混编正面。" }],
      uniqueTechs: [
        { age: "城堡时代", name: "希腊之火", effect: "喷火船射程 +1；德罗蒙战舰和炮塔的爆炸范围提升" },
        { age: "帝王时代", name: "后勤学", effect: "甲胄骑兵能造成践踏伤害，对步兵的攻击力 +6" }
      ],
      teamBonus: "僧侣治疗速度 +100%"
    },
    analysis: {
      economy: {
        title: "没有直接采集加成，但交换成本低",
        verdict: "拜占庭经济优势来自便宜反制兵和便宜帝王，而不是采集速度。",
        points: ["没有采集加成，经济优势来自便宜反制兵。", "建筑血量高，防守时少花资源补墙、塔和 TC。", "帝王时代费用 -33%，封闭图能更早抢帝王科技。"]
      },
      technology: {
        title: "科技树宽，靠选择正确答案取胜",
        verdict: "拜占庭不追求单一路线爆发，而是根据对手兵种切换答案。",
        points: ["科技树宽，弓兵、骆驼、僧侣、海军、防御都能打。", "长枪兵、散兵、骆驼便宜，反制路线完整。", "缺少强经济加成和爆发科技，不能只靠一种主力平推。"]
      },
      military: {
        title: "防守反击和低成本消耗",
        verdict: "看懂对手路线后，拜占庭可以用更便宜的兵种把对手拖进亏本交换。",
        points: ["主战逻辑是反制：对骑兵用枪骆，对弓兵用散兵投石车。", "甲胄骑兵针对步兵强，后勤学后阵地战更狠。", "防守强但进攻慢，守住后要用便宜帝王或城堡阵地反推。"]
      }
    },
    maps: {
      open: { fit: "中", opening: "没有速封经济加成，开放图不追求抢先手，适合小弓防守或垃圾兵反制。", economy: "便宜长枪、散兵、骆驼让防守成本低，靠少亏经济拖到城堡时代。", fight: "看到马厩就枪骆，看到靶场就散兵投石车，目标是让对手主力打不出价值。", caution: "开放图直城甲胄骑兵风险高，城堡兵强但太慢，容易在成型前被控图。" },
      closed: { fit: "高", opening: "free boom 速度一般，但便宜帝王让拜占庭能提前进入后期窗口。", economy: "防御建筑血量高，守家成本低；省下的资源用于更早点帝王和关键科技。", fight: "阵地战兵种齐全：长戟兵、劲弩、火炮、僧侣、甲胄骑兵都有用。", caution: "别只造垃圾兵，封闭图必须准备火炮、巨投或甲胄骑兵来终结比赛。" },
      nomad: { fit: "中高", opening: "若有水面，喷火船攻速加成很强，早期海战比陆地开局更有特色。", economy: "没有野外资源采集加成，但建筑耐久高，分散 TC 和塔更难被拆。", fight: "甲胄骑兵适合直城城堡后处理步兵和散兵，骆驼能应对游牧常见骑兵。", caution: "海陆都能打但都不靠经济爆发，核心是用反制兵稳住多个战场。" }
    },
    guide: {
      suitableFor: "适合愿意看对手兵种再出答案的玩家；新手用拜占庭能学会克制，但不容易靠一波爆兵爽赢。",
      firstBuild: "开放图练小弓防守转便宜反制兵；封闭图练快速帝王火炮长戟或甲胄骑兵推进。",
      practiceRoutes: [
        { label: "开放图", text: "小弓开局防守，看到骑兵转长枪/骆驼，看到弓兵转散兵投石车。" },
        { label: "封闭图", text: "快速帝王，利用帝王费用 -33% 抢先出火炮、长戟兵或甲胄骑兵。" },
        { label: "海图", text: "练喷火船控水，利用喷火船攻速加成争夺早期水面。" }
      ],
      armyChoices: [
        { label: "反骑", text: "长枪兵、骆驼、僧侣。" },
        { label: "反弓", text: "散兵、投石车、建筑防守。" },
        { label: "终结", text: "火炮、巨投、甲胄骑兵、长戟兵。" }
      ],
      techLogic: [
        { label: "反制线", text: "便宜枪散骆是核心科技逻辑，不能只看单兵质量。" },
        { label: "帝王窗口", text: "帝王便宜是拜占庭节奏点，要提前规划第一波帝王兵种。" },
        { label: "阵地线", text: "有火炮、长戟兵和防御科技，封闭图阵地战完整。" }
      ],
      commonMistakes: [
        { problem: "看到便宜兵就无脑爆。", fix: "先确认对手主力，再选择对应反制兵。" },
        { problem: "只守不打。", fix: "守住一波后立刻抢圣物、外矿或补前线建筑。" },
        { problem: "便宜帝王没有利用。", fix: "提前规划帝王第一项科技和第一波推进。" }
      ]
    }
  },
  {
    key: "Chinese",
    difficulty: "高",
    summary: "开局资源紧、上限高，依靠额外村民、科技折扣和多兵种转型打出长期优势。",
    official: {
      type: "步弓手和火药文明",
      bonuses: ["初始村民数 +3，但是木材 -50 且食物 -200", "科技在封建/城堡/帝王时代的费用 -5/10/15%", "城镇中心的视野 +7，提供的人口控件 +15", "火矛兵和喷火船在城堡/帝王时代移动速度 +5/10%"],
      uniqueUnits: [{ name: "诸葛弩", role: "步弓手", note: "高爆发连射步弓手，适合处理低远防单位和阵地战。" }, { name: "龙舟", role: "战船", note: "水战特色单位，适合在有水地图中承担主力输出。" }],
      uniqueTechs: [
        { age: "城堡时代", name: "长城", effect: "城墙、瞭望箭塔系和炮塔的生命值 +30%" },
        { age: "帝王时代", name: "火箭术", effect: "弩炮、火箭推车和楼船攻击力 +25%；楼船可发射火箭" }
      ],
      teamBonus: "农田的食物 +10%"
    },
    analysis: {
      economy: {
        title: "开局难，但村民数带来长期收益",
        verdict: "中国的经济优势不是轻松，而是能不能把紧张开局稳定住。",
        points: ["开局多 3 个村民，但食物和木材极紧。", "科技费用随时代递减，越到中后期越省资源。", "农田团队加成提升长期种田收益。"]
      },
      technology: {
        title: "转型空间大，选择错误也容易亏",
        verdict: "科技折扣鼓励多线升级，但实战仍要先确定主力路线。",
        points: ["科技线很宽，弓兵、火药、攻城、防御都有发挥。", "科技折扣适合快速补攻防和转型科技。", "选择太多是陷阱，需要先确定主战兵种再点科技。"]
      },
      military: {
        title: "中后期多兵种组合文明",
        verdict: "中国强在根据局势转出正确组合，而不是一条路线打到底。",
        points: ["诸葛弩适合城堡保护下打阵地和防守反击。", "中国不是单一兵种文明，强点在多兵种转型。", "火箭术强化弩炮和楼船，后期攻城/水战有特色。"]
      }
    },
    maps: {
      open: { fit: "高但难", opening: "初始多村民让黑暗时代理论经济强，但少食物少木材，速封需要专门练。", economy: "只要前 5 分钟不乱，科技折扣会让封建攻防、经济科技和城堡转型更便宜。", fight: "开放图通常先定一条线：小弓、斥候或防守转弩；诸葛弩不建议裸直城冒险。", caution: "中国最怕开局手忙脚乱，开局崩了就没有后续科技折扣优势。" },
      closed: { fit: "中高", opening: "free boom 上限高，多村民和科技折扣会在安全环境里逐步放大。", economy: "科技折扣让城堡时代经济科技、攻防和帝王升级都更顺。", fight: "阵地战可以用诸葛弩、劲弩、火炮、弩炮和防御科技组合。", caution: "选择太多容易乱转，封闭图要先决定是诸葛弩阵地、火药攻城还是经济爆发。" },
      nomad: { fit: "中", opening: "TC 落点随机会放大中国开局难度，多村民如果找不到稳定食物反而更乱。", economy: "如果早期资源顺，多村民收益很高；如果资源分散，调度难度比普通文明更高。", fight: "有水时龙舟和火箭术有特色，但需要足够经济支撑。", caution: "游牧图不建议新手优先练中国，容易刚开局就丢掉文明优势。" }
    },
    guide: {
      suitableFor: "适合愿意反复练开局和转型的玩家；中国不是新手爽文明，强在会玩之后的上限。",
      firstBuild: "先练中国特殊开局到稳定封建，再练小弓/斥候二选一，不要一局里什么都想出。",
      practiceRoutes: [
        { label: "开局", text: "单独练中国黑暗时代：不断村、不卡房、顺利上封建。" },
        { label: "开放图", text: "稳定开局后练小弓或斥候，城堡时代再利用科技折扣补升级。" },
        { label: "封闭图", text: "练三 TC boom 接诸葛弩/火药/攻城组合，不要同时贪所有科技。" }
      ],
      armyChoices: [
        { label: "远程", text: "弩手、劲弩手、诸葛弩是最直观输出。" },
        { label: "火药攻城", text: "火炮、火枪、弩炮受科技折扣和火箭术影响，适合阵地战。" },
        { label: "水战", text: "龙舟和楼船路线在有水地图才值得重点考虑。" }
      ],
      techLogic: [
        { label: "折扣", text: "科技折扣不是让你乱点科技，而是让主战路线更快成型。" },
        { label: "完整性", text: "中国科技面宽，强在按局势转型，不是单兵种无脑强。" },
        { label: "特色科技", text: "长城偏防守，火箭术偏后期攻城和水战输出。" }
      ],
      commonMistakes: [
        { problem: "开局资源乱。", fix: "先练固定开局，不要一边实战一边摸索。" },
        { problem: "什么科技都想点。", fix: "先定主力兵种，只点服务当前路线的科技。" },
        { problem: "被压制还贪经济。", fix: "先补防守和兵，稳定后再发挥科技折扣。" }
      ]
    }
  },
  {
    key: "Mongols",
    difficulty: "中高",
    summary: "依靠超快打猎抢节奏，前期机动骚扰，后期蒙古突骑与高速攻城器成型。",
    official: {
      type: "骑射手文明",
      bonuses: ["猎人工作速度 +40%", "骑射手攻击速度 +25%", "斥候骑兵系和草原枪兵在城堡/帝王时代的生命值 +20/30%"],
      uniqueUnits: [{ name: "蒙古突骑", role: "骑射手", note: "高机动特色骑射手，尤其擅长处理攻城武器。" }],
      uniqueTechs: [
        { age: "城堡时代", name: "游牧", effect: "失去房屋时人口空间不会减少" },
        { age: "帝王时代", name: "操练", effect: "攻城武器厂单位的移动速度 +50%" }
      ],
      teamBonus: "斥候骑兵系视野 +2"
    },
    analysis: {
      economy: {
        title: "打猎爆发强，但需要侦查配合",
        verdict: "蒙古开局强在能更快吃鹿和野猪，把食物转成更早的封建节奏。",
        points: ["猎人工作速度 +40%，吃猪推鹿极快。", "前期食物爆发强，适合抢速封和快攻时间。", "经济加成偏前期，鹿吃完后需要靠进攻换优势。"]
      },
      technology: {
        title: "骑射与攻城上限高",
        verdict: "蒙古后期强度来自蒙古突骑、骑射手和操练攻城器的机动组合。",
        points: ["骑射手攻击速度 +25%，骑射线质量高。", "操练让攻城武器移动速度 +50%，后期机动攻城极强。", "游牧科技偏防守，不是核心经济科技。"]
      },
      military: {
        title: "机动骚扰到后期完全体",
        verdict: "蒙古应该选择战场，用速度和射程消耗对手，而不是被迫正面硬接。",
        points: ["主战思路是机动骚扰和骑射拉扯。", "蒙古突骑克制攻城武器，成型后非常适合保护推进。", "轻骑、骑射、攻城组合完整，但很吃微操和地图空间。"]
      }
    },
    maps: {
      open: { fit: "高", opening: "打猎速度让蒙古很适合速封斥候、小弓或前置压制，推鹿越好节奏越快。", economy: "黑暗时代食物爆发强，但鹿吃完后没有持续经济加成，必须用快攻换优势。", fight: "封建靠机动骚扰，城堡转骑射手或骑士；后期目标是蒙古突骑保护攻城器。", caution: "开放图直城突骑风险很高，城堡兵很强但需要城堡和升级，不能裸等成型。" },
      closed: { fit: "中", opening: "free boom 不算快，打猎优势只覆盖前期，封闭图更看重后期完全体。", economy: "如果能安全吃完野猪和鹿，上城更顺；中期要主动补城堡和黄金。", fight: "后期蒙古突骑 + 操练攻城器是强阵地组合，转场速度比普通攻城文明快。", caution: "封闭图成型慢，前中期不能只挂机 boom，要为城堡和骑射升级准备资源。" },
      nomad: { fit: "高", opening: "野外猎物多时蒙古很舒服，TC 靠近鹿群或野猪会显著加快前期。", economy: "获取野外食物能力强，适合在分散地图上抢早期食物优势。", fight: "直城城堡兵蒙古突骑价值高，能在大地图上追杀攻城和保护机动推进。", caution: "海军没有核心加成，若水面打不过，要尽快利用陆地机动和城堡兵打开局面。" }
    },
    guide: {
      suitableFor: "适合愿意练推鹿、骑射拉扯和多线骚扰的玩家；新手会觉得强，但真正强点很吃操作。",
      firstBuild: "开放图先练推鹿速封斥候或小弓；后续练城堡骑射转蒙古突骑，不要只等后期神装。",
      practiceRoutes: [
        { label: "开放图", text: "推鹿速封斥候或小弓，目标是把打猎优势转成第一波压制。" },
        { label: "城堡时代", text: "骑射手控图，补弹道学和血统，再看局势转蒙古突骑。" },
        { label: "后期", text: "蒙古突骑保护操练攻城器，练拉扯和多线转场。" }
      ],
      armyChoices: [
        { label: "机动", text: "斥候、轻骑、骑射手负责骚扰和控图。" },
        { label: "核心", text: "蒙古突骑是后期核心，特别擅长处理攻城器。" },
        { label: "攻城", text: "操练后的冲车、投石车和其他攻城器转场速度很快。" }
      ],
      techLogic: [
        { label: "骑射线", text: "攻速加成让骑射质量高，但必须有攻防、弹道学和微操。" },
        { label: "特色科技", text: "操练是后期关键科技，游牧更多是防拆房的辅助科技。" },
        { label: "经济线", text: "经济加成集中在打猎，前期没打出节奏就会变普通。" }
      ],
      commonMistakes: [
        { problem: "不会推鹿还硬选蒙古。", fix: "先单独练侦察兵推鹿，把经济加成吃满。" },
        { problem: "骑射手站着打。", fix: "利用移动速度拉扯，优先打孤立目标。" },
        { problem: "蒙古突骑成型太晚。", fix: "提前规划城堡、黄金、精锐蒙古突骑和操练。" }
      ]
    }
  },
  {
    key: "Wei",
    difficulty: "中",
    summary: "用经济科技送出的额外村民滚发育，城堡时代靠黑光铠骑兵、鲜卑掠骑兵和虎豹骑建立机动压制，帝王时代用明光铠、曹操和便宜牵引抛石机推进。",
    official: {
      type: "骑兵文明",
      bonuses: ["每研究一项经济科技，获得 1 名免费村民。", "黑光铠骑兵和鲜卑掠骑兵在城堡/帝王时代生命值 +20%/+30%。", "牵引抛石机和楼船费用 -25%。"],
      uniqueUnits: [
        { name: "虎豹骑", role: "骑兵", note: "击败敌方军事单位后获得生命值和攻击力，适合追杀远程士兵，不适合冲长矛兵系。" },
        { name: "鲜卑掠骑兵", role: "骑射手", note: "靶场训练的机动远程单位，拥有蓄力远程攻击，适合骚扰和处理步兵，怕掷矛手和骆驼。" },
        { name: "曹操", role: "骑兵英雄", note: "帝王时代唯一英雄，提升附近友军攻击速度，无法被招降。" }
      ],
      uniqueTechs: [
        { age: "城堡时代", name: "屯田", effect: "士兵自动生产食物。" },
        { age: "帝王时代", name: "明光铠", effect: "骑兵单位近战护甲 +4。" }
      ],
      teamBonus: "骑兵单位对攻城武器攻击 +2。"
    },
    analysis: {
      economy: {
        title: "经济科技滚村民，屯田补长期食物",
        verdict: "魏不是黑暗时代爆发经济，而是通过按时补经济科技逐步扩大村民数。",
        points: ["经济科技会送村民，越早补科技越早滚人口。", "伐木、磨坊、采矿、轮轴/手推车、码头经济科技都能转成额外村民收益。", "屯田让已有士兵持续回食物，长期出兵和消耗战更舒服。"]
      },
      technology: {
        title: "骑兵体系特殊，远程和攻城有明显取舍",
        verdict: "魏的主线不是标准骑士线，而是黑光铠骑兵、鲜卑掠骑兵和特色攻城组合。",
        points: ["马厩用黑光铠骑兵替代骑士线，有血统和完整骑兵攻击科技。", "缺骑兵钢甲，但明光铠提供 +4 近战护甲，帝王正面骑兵缠斗很硬。", "鲜卑掠骑兵有弹道学、护腕、化学和帕提亚战术支撑，是魏的远程机动核心。", "缺劲弩手、火枪手、手推炮和攻城技师，后期破局更依赖特色骑兵、重型弩炮和牵引抛石机。"]
      },
      military: {
        title: "机动骑兵带远程骚扰，帝王靠曹操强化团战",
        verdict: "魏的强度来自多种骑乘单位协同，而不是单一爆金马。",
        points: ["核心是黑光铠骑兵顶正面，鲜卑掠骑兵机动输出，虎豹骑抓远程和滚雪球。", "虎豹骑击杀后成长，优势局越打越强，但不能硬冲长矛兵和骆驼。", "曹操是帝王时代团战核心，适合跟明光铠骑兵和远程单位一起推进。"]
      }
    },
    maps: {
      open: { fit: "中高", opening: "先按常规斥候或小弓开局打封建，不建议裸直城等城堡兵。封建正常侦查和压制，城堡时代再转黑光铠骑兵或鲜卑掠骑兵。", economy: "双斧、马项、采矿、轮轴等经济科技会逐步返村民，城堡前后村民数容易拉开。", fight: "马厩黑光铠骑兵负责正面和突袭，靶场鲜卑掠骑兵绕边输出；有城堡后，虎豹骑专门抓弩手、散兵和落单远程。", caution: "魏没有普通骑士线，别按骑士文明惯性等重装骑士/游侠；看到长枪或骆驼要及时补重型弩炮、远程单位或转场。" },
      closed: { fit: "高", opening: "适合快速城堡和多 TC，安全补经济科技能把免费村民收益吃满。", economy: "free boom 中轮轴、手推车、伐木、磨坊、采矿科技越早补，魏越容易提前进入大经济。", fight: "帝王时代明光铠骑兵、曹操、重型弩炮和牵引抛石机是主要推进组合。", caution: "没有手推炮、攻城技师和巨型投石机，拆阵地要保护牵引抛石机，别让长戟兵和僧侣拖住骑兵。" },
      nomad: { fit: "中高", opening: "游牧图开局没有直接采集加成，TC 落点一般时不要贪科技；有水时刺网等经济科技也能帮助滚村民收益。", economy: "分散地图上额外村民和骑兵机动都很有价值，城堡时代黑光铠骑兵和鲜卑掠骑兵能快速抓资源点。", fight: "直城城堡出虎豹骑有威胁，帝王楼船能拆岸边建筑和支援水陆交界。", caution: "魏不是纯海文明，缺干船坞、造船匠和重型爆破船，长期水战不要和强海文明硬拼。" }
    },
    guide: {
      suitableFor: "适合已经会基础斥候、城堡转型和经济科技节奏的玩家；比法兰克复杂，但骑兵手感明确，练熟后很适合用机动部队滚优势。",
      firstBuild: "开放图练斥候转黑光铠骑兵/鲜卑掠骑兵；封闭图练三 TC boom 补经济科技，帝王转明光铠骑兵、曹操和牵引抛石机。",
      practiceRoutes: [
        { label: "开放图", text: "20-21 人口封建斥候，保持侦查和压制，城堡时代马厩黑光铠骑兵接靶场鲜卑掠骑兵。" },
        { label: "封闭图", text: "快速城堡三 TC，优先补经济科技吃免费村民，帝王前准备明光铠和牵引抛石机资源。" },
        { label: "游牧/混合图", text: "有水先保证渔船和刺网节奏，陆地用黑光铠骑兵和鲜卑掠骑兵抓分散经济。" }
      ],
      armyChoices: [
        { label: "正面骑兵", text: "黑光铠骑兵、虎豹骑、翼骑兵是基本机动盘。" },
        { label: "机动远程", text: "鲜卑掠骑兵从靶场出，适合绕边、打步兵和拉扯慢速单位。" },
        { label: "阵地推进", text: "明光铠骑兵配曹操、重型弩炮和牵引抛石机推进；长戟兵用于防对面骑兵反扑。" }
      ],
      techLogic: [
        { label: "骑兵线", text: "没有普通骑士线和骑兵钢甲，但黑光铠骑兵、血统、鼓风炉和明光铠构成主战骑兵体系。" },
        { label: "远程线", text: "没有劲弩手和普通骑射手，鲜卑掠骑兵才是远程机动核心。" },
        { label: "攻城线", text: "有重型弩炮、重型冲车和牵引抛石机，但缺手推炮、重型投石车和攻城技师。" },
        { label: "海军线", text: "楼船很强且便宜，但缺干船坞、造船匠、重型爆破船和炮舰，适合混合图支援，不适合无脑拼纯海。" }
      ],
      commonMistakes: [
        { problem: "把魏当普通骑士文明。", fix: "魏没有骑士/重装骑士/游侠，城堡时代要用黑光铠骑兵和虎豹骑建立节奏。" },
        { problem: "只补军事不点经济科技。", fix: "魏的经济优势来自经济科技送村民，伐木、磨坊、采矿、轮轴和手推车要按节奏补。" },
        { problem: "虎豹骑硬冲长枪。", fix: "长枪多时用鲜卑掠骑兵、重型弩炮、投石车或转场，不要让成长单位白送。" },
        { problem: "帝王推进没有攻城保护。", fix: "牵引抛石机便宜但怕贴脸，必须用明光铠骑兵、长戟兵或曹操光环部队保护。" }
      ]
    }
  }
];

const units = [
  { id: "unit_villager", name: "村民 Villager", building: "城镇中心", age: "黑暗时代", cost: "50 食物", time: 25, role: "采集资源、建造和修理，是经济的根。", tags: ["单位", "经济", "城镇中心"] },
  { id: "unit_spearman_line", name: "枪兵线 Spearman Line", building: "兵营", age: "封建时代", cost: "35 食物 / 25 木材", time: 22, role: "便宜的反骑兵单位，防斥候和骑士时很常用。", tags: ["单位", "反骑兵", "克制"] },
  { id: "unit_archer_line", name: "弓兵线 Archer Line", building: "靶场", age: "封建时代", cost: "25 木材 / 45 黄金", time: 35, role: "依靠射程、数量和升级压制步兵与经济区。", tags: ["单位", "弓兵", "微操"] },
  { id: "unit_knight_line", name: "骑士线 Knight Line", building: "马厩", age: "城堡时代", cost: "60 食物 / 75 黄金", time: 30, role: "机动强压单位，适合突袭经济、清远程和控图。", tags: ["单位", "骑兵", "城堡时代"] },
  { id: "unit_monk", name: "僧侣 Monk", building: "修道院", age: "城堡时代", cost: "100 黄金", time: 51, role: "治疗、转化和搬圣物，能威慑骑士等昂贵单位。", tags: ["单位", "僧侣", "圣物"] }
];

const calculatorUnits = [
  { id: "villager", name: "村民", building: "城镇中心", food: 50, wood: 0, gold: 0, stone: 0, time: 25 },
  { id: "spearman", name: "枪兵", building: "兵营", food: 35, wood: 25, gold: 0, stone: 0, time: 22 },
  { id: "archer", name: "弓兵", building: "靶场", food: 0, wood: 25, gold: 45, stone: 0, time: 35 },
  { id: "knight", name: "骑士", building: "马厩", food: 60, wood: 0, gold: 75, stone: 0, time: 30 },
  { id: "monk", name: "僧侣", building: "修道院", food: 0, wood: 0, gold: 100, stone: 0, time: 51 }
];

const builds = [
  {
    id: "bo_22_pop_scouts",
    name: "22 Pop Scouts",
    map: "开放图",
    goal: "快速上封建，马厩出斥候骑手，同时保持补村。",
    risk: "如果侦查不足或食物不够，斥候会慢，村民也容易断。",
    steps: ["黑暗时代稳定补村和房子", "准备足够食物上封建", "封建后建马厩出斥候", "根据对手补长枪或转骑士"]
  },
  {
    id: "bo_22_pop_archers",
    name: "22 Pop Archers",
    map: "开放图",
    goal: "封建时代出弓兵压制，练靶场节奏和远程走位。",
    risk: "上金、补木和弓兵升级时机容易断。",
    steps: ["黑暗时代准备木材和黄金", "封建后建靶场", "持续出弓并补关键升级", "避免弓兵无保护推进"]
  },
  {
    id: "bo_fast_castle",
    name: "Fast Castle",
    map: "封闭图或安全局势",
    goal: "少打封建，尽快进入城堡时代打开骑士、僧侣或多 TC。",
    risk: "开放图裸升城堡很容易被封建兵打穿。",
    steps: ["黑暗时代稳经济", "封建后补市场和铁匠铺", "尽快点击城堡时代", "上城堡后立刻确定出兵或 boom"]
  }
];

const mistakes = [
  { name: "城镇中心空闲", signal: "TC 停着没有造村民。", fix: "先养成补房子和持续造村的习惯。" },
  { name: "资源浮动", signal: "资源很多，但没有变成兵、科技或建筑。", fix: "先想清楚当前目标，再分配资源。" },
  { name: "不侦查", signal: "不知道对手出什么，被突然打穿。", fix: "固定看对手兵营、靶场、马厩和资源点。" },
  { name: "硬打克制", signal: "兵种被克制还继续正面接。", fix: "先补反制单位，或者转移战场打经济。" }
];

const operations = [
  { name: "赶鹿", stage: "黑暗时代", why: "提高食物效率，让上封建或上城堡更顺。", steps: ["找到鹿群", "用斥候慢慢推", "避免影响村民采集"] },
  { name: "引猪", stage: "黑暗时代", why: "黑暗时代最重要的食物操作之一。", steps: ["确认距离", "村民射击后回 TC", "注意村民血量"] },
  { name: "单农快速小围", stage: "封建时代", why: "临时保护伐木、采金或农田区。", steps: ["提前留木", "围关键缺口", "不要堵死退路"] },
  { name: "骑兵切投石车", stage: "城堡时代", why: "保护弓兵，避免远程部队被投石车一发清空。", steps: ["分出少量骑兵", "从侧面切入", "不要让主力脱节"] }
];

const viewNames = {
  home: "首页",
  search: "搜索结果",
  civilizations: "文明图鉴",
  units: "兵种克制",
  economy: "经济计算",
  builds: "基础知识",
  mistakes: "玩家生态",
  operations: "云玩之家"
};

const civState = {
  mode: "techtree",
  techKey: civByKey.has("Britons") ? "Britons" : allCivs[0]?.key,
  guideKey: civGuides[0]?.key,
  ranking: {
    queue: "1v1",
    elo: "all",
    mode: "rm",
    duration: "all",
    mapGroup: "all",
    patch: "patch_177723",
    search: ""
  },
  selectedNodeByCiv: {},
  nodeSearchQuery: ""
};

const counterState = [
  {
    selectedId: preferredCounterEntityId(["长戟兵", "长枪兵", "长矛兵"]),
    category: "全部",
    query: "",
    leftDetailId: "",
    rightDetailId: ""
  }
];

const civChooserOpenGroups = new Map();
const civChooserQueries = new Map();
const civChooserSearchInputs = {
  "#techCivList": "#techCivSearch",
  "#guideCivList": "#guideCivSearch"
};

const rankingControls = {
  queues: [
    { id: "1v1", label: "1v1 随机地图" },
    { id: "team", label: "组队随机地图" }
  ],
  elos: [
    { id: "all", label: "全部分段" },
    { id: "u850", label: "<850" },
    { id: "850_1000", label: "850-1000" },
    { id: "1000_1200", label: "1000-1200" },
    { id: "1200_1900", label: "1200-1900" },
    { id: "1900p", label: "1900+" }
  ],
  durations: [
    { id: "all", label: "全部时长" },
    { id: "u20", label: "<20分钟" },
    { id: "20_30", label: "20-30分钟" },
    { id: "30_45", label: "30-45分钟" },
    { id: "45p", label: "45分钟以上" }
  ],
  modes: [
    { id: "rm", label: "随机地图" }
  ],
  mapGroups: [
    { id: "all", label: "全部地图", maps: ["All Maps", "全部地图"], type: "all" },
    { id: "map_african_clearing", label: "African Clearing", maps: ["African Clearing", "非洲林间空地"], type: "map" },
    { id: "map_arabia", label: "Arabia", maps: ["Arabia", "阿拉伯"], type: "map" },
    { id: "map_arena", label: "Arena", maps: ["Arena", "竞技场"], type: "map" },
    { id: "map_black_forest", label: "Black Forest", maps: ["Black Forest", "黑森林"], type: "map" },
    { id: "map_land_nomad", label: "Land Nomad", maps: ["Land Nomad", "陆地游牧"], type: "map" },
    { id: "map_megarandom", label: "MegaRandom", maps: ["MegaRandom", "超级随机"], type: "map" },
    { id: "map_nomad", label: "Nomad", maps: ["Nomad", "游牧"], type: "map" },
    { id: "map_socotra", label: "Socotra", maps: ["Socotra", "索科特拉"], type: "map" }
  ],
  patches: [
    { id: "patch_177723", label: "177723，6月2日", fullLabel: "177723，6月2日（当前版本 +3 个热修复）", url: "https://empirestats.online/civs" }
  ]
};

const rankingDimensionOverrides = winrateData.dimensions || {};
if (Array.isArray(rankingDimensionOverrides.queues) && rankingDimensionOverrides.queues.length) rankingControls.queues = rankingDimensionOverrides.queues;
if (Array.isArray(rankingDimensionOverrides.elos) && rankingDimensionOverrides.elos.length) rankingControls.elos = rankingDimensionOverrides.elos;
if (Array.isArray(rankingDimensionOverrides.durations) && rankingDimensionOverrides.durations.length) rankingControls.durations = rankingDimensionOverrides.durations;
if (Array.isArray(rankingDimensionOverrides.modes) && rankingDimensionOverrides.modes.length) rankingControls.modes = rankingDimensionOverrides.modes;
if (Array.isArray(rankingDimensionOverrides.maps) && rankingDimensionOverrides.maps.length) rankingControls.mapGroups = rankingDimensionOverrides.maps;
if (Array.isArray(rankingDimensionOverrides.patches) && rankingDimensionOverrides.patches.length) rankingControls.patches = rankingDimensionOverrides.patches;
if (rankingControls.patches[0]?.id) civState.ranking.patch = rankingControls.patches[0].id;

function getCivChooserOpenGroups(targetId) {
  if (!civChooserOpenGroups.has(targetId)) {
    civChooserOpenGroups.set(targetId, new Set());
  }
  return civChooserOpenGroups.get(targetId);
}

function getCivChooserQuery(targetId) {
  return civChooserQueries.get(targetId) || "";
}

function setCivChooserQuery(targetId, query) {
  civChooserQueries.set(targetId, query);
}

function syncCivChooserInput(targetId) {
  const input = document.querySelector(civChooserSearchInputs[targetId]);
  if (input) input.value = getCivChooserQuery(targetId);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function normalizeSearchText(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
}

function displayCivName(civ) {
  if (!civ) return "";
  const zh = civ.zhName || civ.name || civ.key;
  return zh === civ.key ? civ.key : `${zh} ${civ.key}`;
}

function civInitialGroup(civ) {
  const first = (civ.key || "").charAt(0).toUpperCase();
  if ("ABCDEFG".includes(first)) return "A-G";
  if ("HIJKLM".includes(first)) return "H-M";
  if ("NOPQRST".includes(first)) return "N-T";
  return "U-Z";
}

function matchesCivSearch(civ, query) {
  const haystack = normalizeSearchText(`${displayCivName(civ)} ${civ.key} ${civ.name || ""} ${civ.zhName || ""}`);
  return haystack.includes(normalizeSearchText(query));
}

function tagMarkup(tags) {
  return `<div class="tags">${tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>`;
}

function listMarkup(items, className = "") {
  if (!items?.length) return "";
  const classAttr = className ? ` class="${className}"` : "";
  return `<ul${classAttr}>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
}

function normalizeNodeName(value) {
  return String(value || "").replace(/\s+/g, "").toLowerCase();
}

function findGuideNodeImage(civ, name) {
  const target = normalizeNodeName(name);
  if (!target) return "";
  const nodes = Object.values(civ?.nodes || {});
  const uniqueMatch = nodes.find((node) => node.kind === "unique-unit" && normalizeNodeName(node.name).includes(target));
  const fallbackMatch = nodes.find((node) => normalizeNodeName(node.name).includes(target));
  return uniqueMatch?.image || fallbackMatch?.image || "";
}

function officialCardsMarkup(items, civ, options = {}) {
  if (!items?.length) return "";
  return `
    <div class="official-card-list">
      ${items.map((item) => {
        const image = options.icons ? findGuideNodeImage(civ, item.name) : "";
        return `
        <div class="official-mini-card${image ? " has-icon" : ""}">
          ${image ? `<img src="${escapeHTML(image)}" alt="">` : ""}
          <div>
            <strong>${escapeHTML(item.name)}</strong>
            <span>${escapeHTML(item.role || item.age || "")}</span>
            <p>${escapeHTML(item.note || item.effect || "")}</p>
          </div>
        </div>
      `;
      }).join("")}
    </div>
  `;
}

function guideSectionTitle(title) {
  return `<h3 class="guide-section-heading">${escapeHTML(title)}</h3>`;
}

function guideAnalysisMarkup(analysis) {
  const items = [
    ["economy", "经济优势"],
    ["technology", "科技优势"],
    ["military", "军事优势"]
  ];
  return `
    <section class="guide-section">
      ${guideSectionTitle("文明优势")}
      <div class="guide-analysis-grid">
        ${items.map(([key, label]) => {
          const item = analysis[key];
          return `
            <article class="guide-analysis-card">
              <h4>${label}</h4>
              ${listMarkup(item.points)}
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function mapPlanMarkup(maps) {
  const items = [
    ["open", "开放图"],
    ["closed", "封闭图"],
    ["nomad", "游牧图"]
  ];
  return `
    <section class="guide-section">
      ${guideSectionTitle("地图打法")}
      <div class="guide-map-grid">
        ${items.map(([key, label]) => {
          const item = maps[key];
          return `
            <article class="guide-map-card">
              <div class="guide-map-head">
                <h4>${label}</h4>
                <span>适配度：${escapeHTML(item.fit)}</span>
              </div>
              <dl>
                <dt>开局</dt><dd>${escapeHTML(item.opening)}</dd>
                <dt>发育</dt><dd>${escapeHTML(item.economy)}</dd>
                <dt>战斗</dt><dd>${escapeHTML(item.fight)}</dd>
                <dt>注意</dt><dd>${escapeHTML(item.caution)}</dd>
              </dl>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function guidePlayerManualMarkup(guide) {
  return `
    <section class="guide-section player-manual">
      ${guideSectionTitle("上手指南")}
      <div class="manual-intro">
        <p><strong>入门判断</strong>${escapeHTML(guide.suitableFor)}</p>
        <p><strong>练习目标</strong>${escapeHTML(guide.firstBuild)}</p>
      </div>
      <div class="guide-subgrid">
        <section>
          <h4>推荐练习</h4>
          <div class="composition-list">
            ${guide.practiceRoutes.map((item) => `
              <div>
                <span>${escapeHTML(item.label)}</span>
                <strong>${escapeHTML(item.text)}</strong>
              </div>
            `).join("")}
          </div>
        </section>
        <section>
          <h4>兵种选择</h4>
          <div class="composition-list">
            ${guide.armyChoices.map((item) => `
              <div>
                <span>${escapeHTML(item.label)}</span>
                <strong>${escapeHTML(item.text)}</strong>
              </div>
            `).join("")}
          </div>
        </section>
      </div>
      <div class="guide-subgrid">
        <section>
          <h4>科技完整性判断</h4>
          <div class="upgrade-grid">
            ${guide.techLogic.map((item) => `
              <div>
                <span>${escapeHTML(item.label)}</span>
                <p>${escapeHTML(item.text)}</p>
              </div>
            `).join("")}
          </div>
        </section>
        <section>
          <h4>常见错误</h4>
          <ol class="guide-mistakes">
            ${guide.commonMistakes.map((item) => `
              <li>
                <strong>${escapeHTML(item.problem)}</strong>
                <span>${escapeHTML(item.fix)}</span>
              </li>
            `).join("")}
          </ol>
        </section>
      </div>
    </section>
  `;
}

function counterEntityName(entity) {
  return entity?.normalizedName || String(entity?.name || "").replace(/\s+/g, "") || "";
}

function preferredCounterEntityId(names) {
  const entities = counterData.entities || [];
  for (const name of names) {
    const wanted = normalizeSearchText(name);
    const exact = entities.find((entity) => normalizeSearchText(counterEntityName(entity)) === wanted);
    if (exact) return exact.id;
  }
  for (const name of names) {
    const wanted = normalizeSearchText(name);
    const partial = entities.find((entity) => normalizeSearchText(counterEntityName(entity)).includes(wanted));
    if (partial) return partial.id;
  }
  return counterData.entities?.[0]?.id || "";
}

function getCounterState(index) {
  if (!counterState[index]) {
    counterState[index] = {
      selectedId: counterData.entities?.[0]?.id || "",
      category: "全部",
      query: "",
      leftDetailId: "",
      rightDetailId: ""
    };
  }
  return counterState[index];
}

const counterProductionCategoryNames = ["全部", "建筑类", "兵营", "靶场", "马厩", "攻城武器厂", "城堡", "修道院", "码头", "其他"];
const counterProductionBuildingCategory = new Map([
  [12, "兵营"],
  [87, "靶场"],
  [101, "马厩"],
  [49, "攻城武器厂"],
  [82, "城堡"],
  [104, "修道院"],
  [1806, "修道院"],
  [45, "码头"]
]);

function counterEntityProductionCategory(entity) {
  if (entity?.nodeType === "building" || entity?.kind === "building") return "建筑类";
  return counterProductionBuildingCategory.get(entity?.buildingId) || "其他";
}

function counterCategories() {
  const entities = counterData.entities || [];
  return counterProductionCategoryNames.map((name) => ({
    name,
    count: name === "全部"
      ? entities.length
      : entities.filter((entity) => counterEntityProductionCategory(entity) === name).length
  }));
}

function counterEntityMatchesCategory(entity, category) {
  if (!category || category === "全部") return true;
  return counterEntityProductionCategory(entity) === category;
}

function counterSearchText(entity) {
  return normalizeSearchText([
    entity?.searchText,
    counterEntityName(entity),
    entity?.name,
    entity?.ageName,
    entity?.primaryCategory,
    counterEntityProductionCategory(entity),
    ...(entity?.categories || []),
    ...(entity?.armourTags || []).map((tag) => tag.label)
  ].filter(Boolean).join(" "));
}

function counterFilteredEntities(index) {
  const state = getCounterState(index);
  const query = normalizeSearchText(state.query);
  const category = state.category || "全部";
  return (counterData.entities || [])
    .filter((entity) => counterEntityMatchesCategory(entity, category))
    .filter((entity) => !query || counterSearchText(entity).includes(query));
}

function selectedCounterEntity(index) {
  const state = getCounterState(index);
  return counterEntityById.get(state.selectedId) || counterData.entities?.[0] || null;
}

function counterCategoryButtonsMarkup(index) {
  const state = getCounterState(index);
  return `
    <div class="counter-category-tabs" aria-label="单位分类">
      ${counterCategories().map((category) => `
        <button
          type="button"
          class="counter-category-button"
          data-counter-index="${index}"
          data-counter-category="${escapeHTML(category.name)}"
          aria-pressed="${String((state.category || "全部") === category.name)}"
        >
          ${escapeHTML(category.name)}
        </button>
      `).join("")}
    </div>
  `;
}

function counterMatchValue(match, target) {
  const value = target === "right" ? match.armourValue : match.attackBonus;
  const safeValue = value === undefined || value === null || value === "" ? 0 : value;
  return target === "right" ? String(safeValue) : `+${safeValue}`;
}

function counterMatchChipsMarkup(matches, target = "left") {
  const visible = matches || [];
  if (!visible.length) return "";
  const mode = target === "right" ? "armour" : "attack";
  return `
    <span class="counter-match-row">
      ${visible.map((match) => `
        <span class="counter-match-chip ${escapeHTML(mode)}">${escapeHTML(match.label)} ${escapeHTML(counterMatchValue(match, target))}</span>
      `).join("")}
    </span>
  `;
}

function counterSearchResultsMarkup(index) {
  const state = getCounterState(index);
  const results = counterFilteredEntities(index);
  if (!results.length) return `<p class="counter-empty">没有匹配单位或建筑</p>`;
  return results.map((entity) => `
    <button type="button" class="counter-result-item" data-counter-index="${index}" data-counter-target="center" data-counter-select="${escapeHTML(entity.id)}">
      ${entity.image ? `<img src="${escapeHTML(entity.image)}" alt="">` : `<span class="counter-fallback-icon"></span>`}
      <span>
        <strong>${escapeHTML(counterEntityName(entity))}</strong>
        <small>${escapeHTML(entity.primaryCategory || "项目")} · ${escapeHTML(entity.ageName || "")}</small>
      </span>
    </button>
  `).join("");
}

function counterValue(value) {
  if (value === undefined || value === null || value === "") return "";
  return String(value);
}

function counterAttackType(entity) {
  const stats = entity?.stats || {};
  const types = [];
  if (stats.meleeAttack !== undefined) types.push("近战");
  if (stats.rangedAttack !== undefined) types.push("远程");
  return types.join(" / ") || "无攻击";
}

function counterAttackValue(entity) {
  const stats = entity?.stats || {};
  const values = [];
  if (stats.meleeAttack !== undefined) values.push(`近战 ${stats.meleeAttack}`);
  if (stats.rangedAttack !== undefined) values.push(`远程 ${stats.rangedAttack}`);
  return values.join(" / ") || "无";
}

function counterArmourValue(entity) {
  const stats = entity?.stats || {};
  const values = [];
  if (stats.meleeArmor !== undefined) values.push(`近防 ${stats.meleeArmor}`);
  if (stats.pierceArmor !== undefined) values.push(`远防 ${stats.pierceArmor}`);
  return values.join(" / ") || "无";
}

function counterStatGridMarkup(entity) {
  const stats = entity?.stats || {};
  const rows = [
    ["时代", entity?.ageName],
    ["生命", stats.hp],
    ["攻击类型", counterAttackType(entity)],
    ["攻击", counterAttackValue(entity)],
    ["护甲类型", counterArmourValue(entity)],
    ["射程", stats.range],
    ["成本", stats.cost]
  ].filter(([, value]) => counterValue(value));

  return `
    <dl class="counter-stat-grid">
      ${rows.map(([label, value]) => `<dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd>`).join("")}
    </dl>
  `;
}

function counterTagBlockMarkup(title, tags, mode) {
  const visible = (tags || []).slice(0, 10);
  return `
    <div class="counter-tag-block">
      <h5>${escapeHTML(title)}</h5>
      <div class="counter-tag-list">
        ${visible.length
          ? visible.map((tag) => `<span class="counter-tag ${escapeHTML(mode)}">${escapeHTML(tag.label)} ${mode === "attack" ? "+" : ""}${escapeHTML(tag.amount)}</span>`).join("")
          : `<span class="counter-tag muted">无</span>`}
      </div>
    </div>
  `;
}

function counterEntityDetailMarkup(entity, emptyText = "暂无数据", detailTarget = "") {
  const detailAttr = detailTarget ? ` data-counter-detail="${escapeHTML(detailTarget)}"` : "";
  if (!entity) return `<div class="counter-selected counter-selected-empty"${detailAttr}><p class="counter-empty">${escapeHTML(emptyText)}</p></div>`;
  return `
    <div class="counter-selected"${detailAttr}>
      <div class="counter-selected-head">
        <div class="counter-selected-thumb">
          ${entity.image ? `<img src="${escapeHTML(entity.image)}" alt="">` : ""}
        </div>
        <div>
          <span>${escapeHTML(entity.primaryCategory || "项目")}</span>
          <h4>${escapeHTML(counterEntityName(entity))}</h4>
        </div>
      </div>
      ${counterStatGridMarkup(entity)}
      ${counterTagBlockMarkup("攻击标签", entity.bonusAttacks, "attack")}
      ${counterTagBlockMarkup("护甲标签", entity.armourTags, "armour")}
    </div>
  `;
}

function counterRelationListMarkup(index, relations, emptyText, target) {
  const items = (relations || [])
    .map((relation) => ({ relation, entity: counterEntityById.get(relation.entityId) }))
    .filter((item) => item.entity);

  if (!items.length) return `<p class="counter-empty">${escapeHTML(emptyText)}</p>`;
  return items.map(({ relation, entity }) => `
    <button type="button" class="counter-relation-item" data-counter-index="${index}" data-counter-target="${escapeHTML(target)}" data-counter-select="${escapeHTML(entity.id)}">
      ${entity.image ? `<img src="${escapeHTML(entity.image)}" alt="">` : `<span class="counter-fallback-icon"></span>`}
      <span class="counter-relation-copy">
        <span class="counter-relation-main">
          <strong>${escapeHTML(counterEntityName(entity))}</strong>
          <small>${escapeHTML(entity.primaryCategory || "项目")} · ${escapeHTML(entity.ageName || "")}</small>
        </span>
        ${counterMatchChipsMarkup(relation.matches, target)}
      </span>
    </button>
  `).join("");
}

function counterFlowIconMarkup() {
  return `
    <svg class="counter-flow-icon" viewBox="0 0 48 48" focusable="false" aria-hidden="true">
      <path class="counter-flow-arrow" d="M7 27H34" />
      <path class="counter-flow-arrow-head" d="M30 20L38 27L30 34" />
      <path class="counter-flow-blade" d="M15 35L34 16" />
      <path class="counter-flow-guard" d="M17 28L21 32" />
      <path class="counter-flow-hilt" d="M11 39L15 35" />
      <circle class="counter-flow-pommel" cx="10" cy="40" r="2" />
    </svg>
  `;
}

function counterCardMarkup(index) {
  const state = getCounterState(index);
  const entity = selectedCounterEntity(index);
  const relation = counterData.relationships?.[entity?.id] || { counters: [], targets: [] };
  const leftDetail = counterEntityById.get(state.leftDetailId);
  const rightDetail = counterEntityById.get(state.rightDetailId);
  return `
    <article class="counter-card" data-counter-index="${index}">
      <section class="counter-column counter-side">
        <div class="counter-column-head">
          <h4>克制单位</h4>
        </div>
        <div class="counter-relation-list counter-choice-list" data-counter-list="left">
          ${counterRelationListMarkup(index, relation.counters, "暂无按标签生成的克制项", "left")}
        </div>
        ${counterEntityDetailMarkup(leftDetail, "选择上方条目查看详情", "left")}
      </section>

      <div class="counter-flow counter-flow-left" aria-hidden="true">${counterFlowIconMarkup()}</div>

      <section class="counter-column counter-center">
        <div class="counter-column-head">
          <label class="counter-search">
            <span>选择单位 / 建筑</span>
            <input
              class="counter-search-input"
              data-counter-index="${index}"
              type="search"
              autocomplete="off"
              placeholder="搜索名称"
              value="${escapeHTML(state.query)}"
            >
          </label>
          ${counterCategoryButtonsMarkup(index)}
        </div>
        <div class="counter-search-results counter-choice-list" data-counter-index="${index}">
          ${counterSearchResultsMarkup(index)}
        </div>
        ${counterEntityDetailMarkup(entity, "暂无数据", "center")}
      </section>

      <div class="counter-flow counter-flow-right" aria-hidden="true">${counterFlowIconMarkup()}</div>

      <section class="counter-column counter-side">
        <div class="counter-column-head">
          <h4>被克制单位</h4>
        </div>
        <div class="counter-relation-list counter-choice-list" data-counter-list="right">
          ${counterRelationListMarkup(index, relation.targets, "暂无按标签生成的被克制项", "right")}
        </div>
        ${counterEntityDetailMarkup(rightDetail, "选择上方条目查看详情", "right")}
      </section>
    </article>
  `;
}

function renderCounterAtlas() {
  if (!counterData.entities?.length) {
    return `
      <section class="counter-atlas" id="counterAtlas">
        <div class="counter-atlas-head"><h3>基础克制关系图谱</h3></div>
        <p class="counter-empty">暂无本地克制数据</p>
      </section>
    `;
  }

  return `
    <section class="counter-atlas" id="counterAtlas" aria-label="基础克制关系图谱">
      <div class="counter-atlas-head">
        <h3>基础克制关系图谱</h3>
      </div>
      <div class="counter-card-grid">
        ${counterCardMarkup(0)}
      </div>
    </section>
  `;
}

function refreshCounterCard(index) {
  const card = document.querySelector(`.counter-card[data-counter-index="${index}"]`);
  if (card) card.outerHTML = counterCardMarkup(index);
}

function updateCounterDetail(index, target) {
  const state = getCounterState(index);
  const current = document.querySelector(`.counter-card[data-counter-index="${index}"] [data-counter-detail="${target}"]`);
  if (!current) return;
  const entity = target === "center"
    ? selectedCounterEntity(index)
    : counterEntityById.get(target === "left" ? state.leftDetailId : state.rightDetailId);
  const emptyText = target === "center" ? "暂无数据" : "选择上方条目查看详情";
  current.outerHTML = counterEntityDetailMarkup(entity, emptyText, target);
}

function updateCounterSearchArea(index) {
  const state = getCounterState(index);
  const input = document.querySelector(`.counter-search-input[data-counter-index="${index}"]`);
  const results = document.querySelector(`.counter-search-results[data-counter-index="${index}"]`);
  if (input) input.value = state.query;
  if (results) results.innerHTML = counterSearchResultsMarkup(index);
  document.querySelectorAll(`.counter-category-button[data-counter-index="${index}"]`).forEach((button) => {
    button.setAttribute("aria-pressed", String((state.category || "全部") === button.dataset.counterCategory));
  });
}

function updateCounterRelationLists(index) {
  const entity = selectedCounterEntity(index);
  const relation = counterData.relationships?.[entity?.id] || { counters: [], targets: [] };
  const left = document.querySelector(`.counter-card[data-counter-index="${index}"] [data-counter-list="left"]`);
  const right = document.querySelector(`.counter-card[data-counter-index="${index}"] [data-counter-list="right"]`);
  if (left) left.innerHTML = counterRelationListMarkup(index, relation.counters, "暂无按标签生成的克制项", "left");
  if (right) right.innerHTML = counterRelationListMarkup(index, relation.targets, "暂无按标签生成的被克制项", "right");
}

function bindCounterAtlas() {
  const atlas = document.querySelector("#counterAtlas");
  if (!atlas) return;

  atlas.addEventListener("input", (event) => {
    const input = event.target.closest(".counter-search-input");
    if (!input) return;
    const index = Number(input.dataset.counterIndex);
    getCounterState(index).query = input.value;
    const results = atlas.querySelector(`.counter-search-results[data-counter-index="${index}"]`);
    if (results) results.innerHTML = counterSearchResultsMarkup(index);
  });

  atlas.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("button[data-counter-category]");
    if (categoryButton) {
      const index = Number(categoryButton.dataset.counterIndex);
      const state = getCounterState(index);
      state.category = categoryButton.dataset.counterCategory || "全部";
      updateCounterSearchArea(index);
      return;
    }

    const selectButton = event.target.closest("button[data-counter-select]");
    if (!selectButton) return;
    const index = Number(selectButton.dataset.counterIndex);
    const state = getCounterState(index);
    const target = selectButton.dataset.counterTarget || "center";
    if (target === "left") {
      state.leftDetailId = selectButton.dataset.counterSelect;
      updateCounterDetail(index, "left");
    } else if (target === "right") {
      state.rightDetailId = selectButton.dataset.counterSelect;
      updateCounterDetail(index, "right");
    } else {
      state.selectedId = selectButton.dataset.counterSelect;
      state.leftDetailId = "";
      state.rightDetailId = "";
      updateCounterRelationLists(index);
      updateCounterDetail(index, "center");
      updateCounterDetail(index, "left");
      updateCounterDetail(index, "right");
    }
  });
}

const damageTerrainOptions = [
  { value: "low", label: "低地" },
  { value: "level", label: "平地" },
  { value: "high", label: "高地" }
];

const damageSpecialOptions = {
  attacker: [
    { value: "none", label: "无" },
    { value: "tatars", label: "鞑靼：高地 +25%" },
    { value: "siegeEngineers", label: "攻城技师：对建筑 +20%" },
    { value: "heatedShot", label: "预热射击：对船只 +125%" }
  ],
  defender: [
    { value: "none", label: "无" },
    { value: "sicilians", label: "西西里：标签 -40%" },
    { value: "bengalis", label: "孟加拉：标签 -25%" },
    { value: "georgians", label: "格鲁吉亚：高地 -15%" }
  ]
};

function damageLevelOptions() {
  return [0, 1, 2, 3].map((level) => ({ value: String(level), label: String(level) }));
}

function damageDefaultEntityId(side) {
  return side === "attacker"
    ? preferredCounterEntityId(["长戟兵", "骑士", "民兵"])
    : preferredCounterEntityId(["游侠", "骑士", "民兵"]);
}

function damageSideState(side) {
  const state = damageCalcState[side];
  if (!state.selectedId) state.selectedId = damageDefaultEntityId(side);
  return state;
}

function damageEntity(side) {
  const state = damageSideState(side);
  return counterEntityById.get(state.selectedId) || counterData.entities?.[0] || null;
}

function damageFilteredEntities(side) {
  const state = damageSideState(side);
  const query = normalizeSearchText(state.query);
  return (counterData.entities || [])
    .filter((entity) => !query || counterSearchText(entity).includes(query));
}

function damageSelectMarkup(side, field, label, options) {
  const value = String(damageSideState(side)[field] ?? "");
  return `
    <label class="damage-calc-control">
      <span>${escapeHTML(label)}</span>
      <select data-damage-side="${escapeHTML(side)}" data-damage-field="${escapeHTML(field)}">
        ${options.map((option) => `
          <option value="${escapeHTML(option.value)}"${String(option.value) === value ? " selected" : ""}>${escapeHTML(option.label)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function damageSearchResultsMarkup(side) {
  const results = damageFilteredEntities(side);
  if (!results.length) return `<p class="damage-calc-empty">没有匹配单位或建筑</p>`;
  return results.map((entity) => `
    <button type="button" class="damage-calc-result-item" data-damage-side="${escapeHTML(side)}" data-damage-select="${escapeHTML(entity.id)}">
      ${entity.image ? `<img src="${escapeHTML(entity.image)}" alt="">` : `<span class="counter-fallback-icon"></span>`}
      <span>
        <strong>${escapeHTML(counterEntityName(entity))}</strong>
        <small>${escapeHTML(entity.primaryCategory || "项目")} · ${escapeHTML(entity.ageName || "")}</small>
      </span>
    </button>
  `).join("");
}

function damageEntitySummaryMarkup(entity) {
  if (!entity) return `<div class="damage-calc-unit damage-calc-empty">暂无数据</div>`;
  return `
    <div class="damage-calc-unit">
      <div class="damage-calc-unit-head">
        <div class="damage-calc-thumb">
          ${entity.image ? `<img src="${escapeHTML(entity.image)}" alt="">` : ""}
        </div>
        <div>
          <span>${escapeHTML(entity.primaryCategory || "项目")}</span>
          <h5>${escapeHTML(counterEntityName(entity))}</h5>
        </div>
      </div>
      ${counterStatGridMarkup(entity)}
    </div>
  `;
}

function damageCombatantCardMarkup(side) {
  const state = damageSideState(side);
  const isAttacker = side === "attacker";
  const title = isAttacker ? "进攻方" : "被进攻方";
  const entity = damageEntity(side);
  return `
    <article class="damage-calc-card damage-calc-combatant" data-damage-card="${escapeHTML(side)}">
      <h4>${escapeHTML(title)}</h4>
      <label class="damage-calc-search">
        <input
          class="damage-calc-search-input"
          data-damage-side="${escapeHTML(side)}"
          type="search"
          autocomplete="off"
          placeholder="搜索单位 / 建筑"
          value="${escapeHTML(state.query)}"
        >
      </label>
      <div class="damage-calc-results" data-damage-results="${escapeHTML(side)}">
        ${damageSearchResultsMarkup(side)}
      </div>
      ${damageEntitySummaryMarkup(entity)}
      <div class="damage-calc-controls">
        ${isAttacker
          ? `
            ${damageSelectMarkup(side, "meleeAttackLevel", "近攻等级", damageLevelOptions())}
            ${damageSelectMarkup(side, "rangedAttackLevel", "远攻等级", damageLevelOptions())}
          `
          : `
            ${damageSelectMarkup(side, "meleeArmorLevel", "近防等级", damageLevelOptions())}
            ${damageSelectMarkup(side, "pierceArmorLevel", "远防等级", damageLevelOptions())}
          `}
        ${damageSelectMarkup(side, "special", "特殊加成", damageSpecialOptions[side])}
        ${damageSelectMarkup(side, "terrain", "地形位置", damageTerrainOptions)}
      </div>
    </article>
  `;
}

function damageAttackMode(entity) {
  const stats = entity?.stats || {};
  if (stats.rangedAttack !== undefined) return "ranged";
  if (stats.meleeAttack !== undefined) return "melee";
  return "none";
}

function damageNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function damageFormat(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function damageModeLabel(mode) {
  if (mode === "ranged") return "远程";
  if (mode === "melee") return "近战";
  return "无攻击";
}

function damageTerrainMultiplier(attackerState, defenderState) {
  const ranks = { low: 0, level: 1, high: 2 };
  const attackerRank = ranks[attackerState.terrain] ?? 1;
  const defenderRank = ranks[defenderState.terrain] ?? 1;
  const notes = [];
  let multiplier = 1;

  if (attackerRank > defenderRank) {
    multiplier = 1.25;
    notes.push("高地攻击低地：1.25");
  } else if (attackerRank < defenderRank) {
    multiplier = 0.75;
    notes.push("低地攻击高地：0.75");
  } else {
    notes.push("同高度：1.00");
  }

  if (attackerState.special === "tatars" && attackerRank > defenderRank) {
    multiplier += 0.25;
    notes.push("鞑靼高地：+0.25");
  }

  if (defenderState.special === "georgians" && defenderRank > attackerRank) {
    multiplier = Math.max(0, multiplier - 0.15);
    notes.push("格鲁吉亚高地：-0.15");
  }

  return { multiplier, notes };
}

function damageHasCategory(entity, category) {
  return (entity?.categories || []).includes(category) || entity?.primaryCategory === category;
}

function damageHasArmourClass(entity, classId) {
  return (entity?.armourTags || []).some((tag) => Number(tag.classId) === Number(classId));
}

function damageExtraMultiplier(attacker, defender, attackerState) {
  const notes = [];
  let multiplier = 1;
  const defenderIsBuilding = defender?.nodeType === "building" || defender?.kind === "building";
  const defenderIsShip = damageHasCategory(defender, "船只") || damageHasArmourClass(defender, 16);
  const attackerIsBuilding = attacker?.nodeType === "building" || attacker?.kind === "building";
  const attackerIsSiege = damageHasCategory(attacker, "攻城") || damageHasArmourClass(attacker, 20);

  if (attackerState.special === "siegeEngineers") {
    if (attackerIsSiege && defenderIsBuilding) {
      multiplier *= 1.2;
      notes.push("攻城技师：x1.20");
    } else {
      notes.push("攻城技师：未触发");
    }
  }

  if (attackerState.special === "heatedShot") {
    if (attackerIsBuilding && defenderIsShip) {
      multiplier *= 2.25;
      notes.push("预热射击：x2.25");
    } else {
      notes.push("预热射击：未触发");
    }
  }

  return { multiplier, notes };
}

function damageTagReduction(defenderState) {
  if (defenderState.special === "sicilians") return { multiplier: 0.6, note: "西西里标签减伤：x0.60" };
  if (defenderState.special === "bengalis") return { multiplier: 0.75, note: "孟加拉标签减伤：x0.75" };
  return { multiplier: 1, note: "" };
}

function calculateDamage() {
  const attackerState = damageSideState("attacker");
  const defenderState = damageSideState("defender");
  const attacker = damageEntity("attacker");
  const defender = damageEntity("defender");
  const mode = damageAttackMode(attacker);
  const attackerStats = attacker?.stats || {};
  const defenderStats = defender?.stats || {};
  const attackUpgrade = mode === "ranged" ? damageNumber(attackerState.rangedAttackLevel) : damageNumber(attackerState.meleeAttackLevel);
  const armorUpgrade = mode === "ranged" ? damageNumber(defenderState.pierceArmorLevel) : damageNumber(defenderState.meleeArmorLevel);
  const baseAttack = mode === "ranged"
    ? damageNumber(attackerStats.rangedAttack) + attackUpgrade
    : mode === "melee"
      ? damageNumber(attackerStats.meleeAttack) + attackUpgrade
      : 0;
  const baseArmor = mode === "ranged"
    ? damageNumber(defenderStats.pierceArmor) + armorUpgrade
    : mode === "melee"
      ? damageNumber(defenderStats.meleeArmor) + armorUpgrade
      : 0;
  const baseDamage = mode === "none" ? 0 : Math.max(0, baseAttack - baseArmor);
  const armourByClass = new Map((defender?.armourTags || []).map((tag) => [Number(tag.classId), tag]));
  const tagDetails = (attacker?.bonusAttacks || [])
    .filter((tag) => armourByClass.has(Number(tag.classId)))
    .map((tag) => {
      const armour = armourByClass.get(Number(tag.classId));
      const attack = damageNumber(tag.amount);
      const defense = damageNumber(armour.amount);
      const damage = Math.max(0, attack - defense);
      return { label: tag.label, attack, defense, damage };
    });
  const tagRaw = tagDetails.reduce((sum, item) => sum + item.damage, 0);
  const tagReduction = damageTagReduction(defenderState);
  const tagDamage = tagRaw * tagReduction.multiplier;
  const terrain = damageTerrainMultiplier(attackerState, defenderState);
  const extra = damageExtraMultiplier(attacker, defender, attackerState);
  const subtotal = baseDamage + tagDamage;
  const rawDamage = subtotal * terrain.multiplier * extra.multiplier;
  const canAttack = mode !== "none" || tagRaw > 0;
  const finalDamage = canAttack ? Math.max(1, Math.floor(rawDamage + 0.000001)) : 0;

  return {
    attacker,
    defender,
    mode,
    baseAttack,
    baseArmor,
    baseDamage,
    tagRaw,
    tagDamage,
    tagDetails,
    tagReduction,
    terrain,
    extra,
    subtotal,
    rawDamage,
    finalDamage
  };
}

function damageTagDetailsMarkup(result) {
  if (!result.tagDetails.length) return `<p class="damage-calc-note">没有命中的标签伤害</p>`;
  return `
    <ul class="damage-calc-tags">
      ${result.tagDetails.slice(0, 5).map((item) => `
        <li>${escapeHTML(item.label)}：${escapeHTML(item.attack)} - ${escapeHTML(item.defense)} = ${escapeHTML(item.damage)}</li>
      `).join("")}
      ${result.tagDetails.length > 5 ? `<li>另有 ${escapeHTML(result.tagDetails.length - 5)} 个命中标签</li>` : ""}
    </ul>
  `;
}

function damageResultCardMarkup() {
  const result = calculateDamage();
  const multiplierNotes = [
    ...result.terrain.notes,
    result.tagReduction.note,
    ...result.extra.notes
  ].filter(Boolean);
  return `
    <article class="damage-calc-card damage-calc-result">
      <h4>最终伤害</h4>
      <div class="damage-result-number">${escapeHTML(result.finalDamage)}</div>
      <p class="damage-result-pair">${escapeHTML(counterEntityName(result.attacker))} → ${escapeHTML(counterEntityName(result.defender))}</p>
      <dl class="damage-result-breakdown">
        <dt>攻击类型</dt><dd>${escapeHTML(damageModeLabel(result.mode))}</dd>
        <dt>基础伤害</dt><dd>${escapeHTML(damageFormat(result.baseAttack))} - ${escapeHTML(damageFormat(result.baseArmor))} = ${escapeHTML(damageFormat(result.baseDamage))}</dd>
        <dt>标签伤害</dt><dd>${escapeHTML(damageFormat(result.tagRaw))}${result.tagReduction.multiplier !== 1 ? ` × ${escapeHTML(damageFormat(result.tagReduction.multiplier))} = ${escapeHTML(damageFormat(result.tagDamage))}` : ""}</dd>
        <dt>最终倍率</dt><dd>${escapeHTML(damageFormat(result.terrain.multiplier))} × ${escapeHTML(damageFormat(result.extra.multiplier))}</dd>
      </dl>
      ${damageTagDetailsMarkup(result)}
      <div class="damage-calc-note-list">
        ${multiplierNotes.map((note) => `<span>${escapeHTML(note)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderDamageCalculator() {
  return `
    <section class="damage-calculator" id="damageCalculator" aria-label="伤害计算器">
      <div class="damage-calculator-head">
        <h3>伤害计算器</h3>
      </div>
      <div class="damage-calc-grid">
        ${damageCombatantCardMarkup("attacker")}
        ${damageCombatantCardMarkup("defender")}
        ${damageResultCardMarkup()}
      </div>
    </section>
  `;
}

function refreshDamageCalculator() {
  const calculator = document.querySelector("#damageCalculator");
  if (!calculator) return;
  calculator.outerHTML = renderDamageCalculator();
  bindDamageCalculator();
}

function bindDamageCalculator() {
  const calculator = document.querySelector("#damageCalculator");
  if (!calculator) return;

  calculator.addEventListener("input", (event) => {
    const input = event.target.closest(".damage-calc-search-input");
    if (!input) return;
    const side = input.dataset.damageSide;
    damageSideState(side).query = input.value;
    const results = calculator.querySelector(`[data-damage-results="${side}"]`);
    if (results) results.innerHTML = damageSearchResultsMarkup(side);
  });

  calculator.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-damage-field]");
    if (!select) return;
    const side = select.dataset.damageSide;
    const field = select.dataset.damageField;
    const numericFields = new Set(["meleeAttackLevel", "rangedAttackLevel", "meleeArmorLevel", "pierceArmorLevel"]);
    damageSideState(side)[field] = numericFields.has(field) ? Number(select.value) : select.value;
    refreshDamageCalculator();
  });

  calculator.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-damage-select]");
    if (!button) return;
    const side = button.dataset.damageSide;
    const state = damageSideState(side);
    state.selectedId = button.dataset.damageSelect;
    state.query = "";
    refreshDamageCalculator();
  });
}

function damageCategoryButtonsMarkup(side) {
  const state = damageSideState(side);
  return `
    <div class="damage-calc-category-tabs" aria-label="单位分类">
      ${counterCategories().map((category) => `
        <button
          type="button"
          class="damage-calc-category-button"
          data-damage-side="${escapeHTML(side)}"
          data-damage-category="${escapeHTML(category.name)}"
          aria-pressed="${String((state.category || "全部") === category.name)}"
        >
          ${escapeHTML(category.name)}
        </button>
      `).join("")}
    </div>
  `;
}

function damageFilteredEntities(side) {
  const state = damageSideState(side);
  const query = normalizeSearchText(state.query);
  const category = state.category || "全部";
  return (counterData.entities || [])
    .filter((entity) => counterEntityMatchesCategory(entity, category))
    .filter((entity) => !query || counterSearchText(entity).includes(query));
}

function damageEntityFlags(entity) {
  const mode = damageAttackMode(entity);
  const hasClass = (classId) => damageHasArmourClass(entity, classId);
  const building = entity?.nodeType === "building" || entity?.kind === "building";
  const ship = damageHasCategory(entity, "船只") || hasClass(16) || entity?.buildingId === 45;
  const siege = damageHasCategory(entity, "攻城") || hasClass(20) || hasClass(17) || entity?.buildingId === 49;
  const monk = damageHasCategory(entity, "僧侣") || hasClass(25) || entity?.buildingId === 1806 || entity?.buildingId === 104;
  const infantry = damageHasCategory(entity, "步兵") || hasClass(1);
  const archer = damageHasCategory(entity, "弓兵") || hasClass(15) || hasClass(28);
  const cavalry = damageHasCategory(entity, "骑兵") || hasClass(8) || hasClass(30);
  const elephant = hasClass(5);
  const gunpowder = damageHasCategory(entity, "火药") || hasClass(23);
  const landUnit = !building && !ship;
  return { mode, building, ship, siege, monk, infantry, archer, cavalry, elephant, gunpowder, landUnit };
}

function damageOption(value, label, config = {}) {
  return { value, label, ...config };
}

function damageAttackTechOptions(entity) {
  const flags = damageEntityFlags(entity);
  if (flags.mode === "none" || flags.monk || flags.siege || flags.gunpowder) {
    return [damageOption("none", "无可用攻击科技", { short: "", flat: 0, notes: [] })];
  }

  if (flags.mode === "melee" && !flags.building && !flags.ship) {
    return [
      damageOption("none", "无", { short: "", flat: 0, notes: [] }),
      damageOption("melee1", "锻造（+1）", { short: "1级攻击", flat: 1, notes: ["锻造 +1"] }),
      damageOption("melee2", "锻造 + 铁铸（+2）", { short: "2级攻击", flat: 2, notes: ["锻造 +1", "铁铸 +1"] }),
      damageOption("meleeFull", "满级近战攻击（+4）", { short: "满级攻击", flat: 4, notes: ["锻造 +1", "铁铸 +1", "鼓风炉 +2"] })
    ];
  }

  if (flags.mode === "ranged") {
    const labelPrefix = flags.ship ? "船只远程" : flags.building ? "建筑远程" : "远程";
    return [
      damageOption("none", "无", { short: "", flat: 0, notes: [] }),
      damageOption("ranged1", `${labelPrefix}：箭羽（+1）`, { short: "1级攻击", flat: 1, notes: ["箭羽 +1"] }),
      damageOption("ranged2", `${labelPrefix}：箭羽 + 锥状箭头（+2）`, { short: "2级攻击", flat: 2, notes: ["箭羽 +1", "锥状箭头 +1"] }),
      damageOption("ranged3", `${labelPrefix}：护腕前满级（+3）`, { short: "3级攻击", flat: 3, notes: ["箭羽 +1", "锥状箭头 +1", "护腕 +1"] }),
      damageOption("rangedFull", `${labelPrefix}：护腕 + 化学（+4）`, { short: "满级攻击", flat: 4, notes: ["箭羽 +1", "锥状箭头 +1", "护腕 +1", "化学 +1"] })
    ];
  }

  return [damageOption("none", "无可用攻击科技", { short: "", flat: 0, notes: [] })];
}

function damageAttackExtraTechOptions(entity) {
  const flags = damageEntityFlags(entity);
  const options = [damageOption("none", "无", { multiplier: 1, notes: [] })];
  if (flags.siege) {
    options.push(damageOption("siegeEngineers", "攻城技师：对建筑 +20%", {
      multiplier: 1.2,
      trigger: "building",
      notes: ["攻城技师：对建筑 x1.20"]
    }));
  }
  if (flags.building) {
    options.push(damageOption("heatedShot", "预热射击：对船只 +125%", {
      multiplier: 2.25,
      trigger: "ship",
      notes: ["预热射击：对船只 x2.25"]
    }));
  }
  return options;
}

function damageDefenseTechOptions(entity) {
  const flags = damageEntityFlags(entity);
  if (flags.building) {
    return [
      damageOption("none", "无", { short: "", melee: 0, pierce: 0, notes: [] }),
      damageOption("masonry", "砖瓦技术（+1 近防 / +1 远防）", { short: "1级防御", melee: 1, pierce: 1, notes: ["砖瓦技术 +1/+1"] }),
      damageOption("architecture", "建筑学（+2 近防 / +2 远防）", { short: "2级防御", melee: 2, pierce: 2, notes: ["砖瓦技术 +1/+1", "建筑学 +1/+1"] })
    ];
  }

  if (flags.ship) {
    return [
      damageOption("none", "无", { short: "", melee: 0, pierce: 0, notes: [] }),
      damageOption("careening", "倾侧维修（+1 近防 / +1 远防）", { short: "1级防御", melee: 1, pierce: 1, notes: ["倾侧维修 +1/+1"] }),
      damageOption("dryDock", "干船坞（+2 近防 / +2 远防）", { short: "2级防御", melee: 2, pierce: 2, notes: ["倾侧维修 +1/+1", "干船坞 +1/+1"] })
    ];
  }

  if (flags.siege || flags.monk) {
    return [damageOption("none", "无可用防御科技", { short: "", melee: 0, pierce: 0, notes: [] })];
  }

  const line = flags.cavalry ? "骑兵护甲" : flags.archer ? "射手护甲" : "步兵护甲";
  return [
    damageOption("none", "无", { short: "", melee: 0, pierce: 0, notes: [] }),
    damageOption("armor1", `${line} 1级（+1 近防 / +1 远防）`, { short: "1级防御", melee: 1, pierce: 1, notes: [`${line} 1级 +1/+1`] }),
    damageOption("armor2", `${line} 2级（+2 近防 / +2 远防）`, { short: "2级防御", melee: 2, pierce: 2, notes: [`${line} 1级 +1/+1`, `${line} 2级 +1/+1`] }),
    damageOption("armorFull", `${line} 满级（+3 近防 / +4 远防）`, { short: "满级防御", melee: 3, pierce: 4, notes: [`${line} 1级 +1/+1`, `${line} 2级 +1/+1`, `${line} 3级 +1/+2`] })
  ];
}

function damageAttackerCivOptions(entity) {
  const flags = damageEntityFlags(entity);
  const name = counterEntityName(entity);
  const options = [damageOption("none", "无", { short: "", attackMultiplier: 1, notes: [] })];
  if (flags.mode !== "none") {
    options.push(damageOption("tatars", "鞑靼：高地额外 +25%", { short: "鞑靼加成", attackMultiplier: 1, notes: ["鞑靼高地额外 +25%"] }));
  }
  if (/弩炮|火箭推车|楼船/.test(name)) {
    options.push(damageOption("rocketry", "中国：火箭术（攻击 +25%）", { short: "火箭术", attackMultiplier: 1.25, notes: ["火箭术：攻击 x1.25"] }));
  }
  return options;
}

function damageDefenderCivOptions(entity) {
  const flags = damageEntityFlags(entity);
  const options = [damageOption("none", "无", { short: "", melee: 0, pierce: 0, tagMultiplier: 1, notes: [] })];
  if (flags.monk) {
    options.push(damageOption("bengaliMonk", "孟加拉：僧侣 +3/+3 护甲", { short: "孟加拉加成", melee: 3, pierce: 3, tagMultiplier: 1, notes: ["孟加拉僧侣 +3/+3 护甲"] }));
  }
  if (flags.landUnit && !flags.siege) {
    options.push(damageOption("sicilians", "西西里：标签伤害 -40%", { short: "西西里加成", melee: 0, pierce: 0, tagMultiplier: 0.6, notes: ["西西里标签伤害 x0.60"] }));
  }
  if (flags.elephant) {
    options.push(damageOption("bengaliElephant", "孟加拉：象兵标签伤害 -25%", { short: "孟加拉加成", melee: 0, pierce: 0, tagMultiplier: 0.75, notes: ["孟加拉象兵标签伤害 x0.75"] }));
  }
  if (!flags.ship) {
    options.push(damageOption("georgians", "格鲁吉亚：高地减伤 15%", { short: "格鲁吉亚加成", melee: 0, pierce: 0, tagMultiplier: 1, notes: ["格鲁吉亚高地减伤 15%"] }));
  }
  return options;
}

function damagePickOption(options, value) {
  return options.find((option) => option.value === value) || options[0] || damageOption("none", "无");
}

function damageSelectMarkup(side, field, label, options) {
  if (!options.length || (field !== "terrain" && options.length === 1 && options[0].value === "none")) {
    const reservedFields = new Set(["attackTech", "defenseTech", "civBonus"]);
    return reservedFields.has(field)
      ? `<div class="damage-calc-control damage-calc-control-empty" data-damage-control="${escapeHTML(field)}" aria-hidden="true"></div>`
      : "";
  }
  const value = damagePickOption(options, String(damageSideState(side)[field] ?? "none")).value;
  return `
    <label class="damage-calc-control" data-damage-control="${escapeHTML(field)}">
      <span>${escapeHTML(label)}</span>
      <select data-damage-side="${escapeHTML(side)}" data-damage-field="${escapeHTML(field)}">
        ${options.map((option) => `
          <option value="${escapeHTML(option.value)}"${option.value === value ? " selected" : ""}>${escapeHTML(option.label)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function damageCombatantCardMarkup(side) {
  const state = damageSideState(side);
  const isAttacker = side === "attacker";
  const title = isAttacker ? "进攻方" : "被进攻方";
  const entity = damageEntity(side);
  const attackTechOptions = damageAttackTechOptions(entity);
  const attackExtraOptions = damageAttackExtraTechOptions(entity);
  const defenseTechOptions = damageDefenseTechOptions(entity);
  const civOptions = isAttacker ? damageAttackerCivOptions(entity) : damageDefenderCivOptions(entity);
  return `
    <article class="damage-calc-card damage-calc-combatant" data-damage-card="${escapeHTML(side)}">
      <h4>${escapeHTML(title)}</h4>
      <label class="damage-calc-search">
        <input
          class="damage-calc-search-input"
          data-damage-side="${escapeHTML(side)}"
          type="search"
          autocomplete="off"
          placeholder="搜索单位 / 建筑"
          value="${escapeHTML(state.query)}"
        >
      </label>
      ${damageCategoryButtonsMarkup(side)}
      <div class="damage-calc-results" data-damage-results="${escapeHTML(side)}">
        ${damageSearchResultsMarkup(side)}
      </div>
      ${damageEntitySummaryMarkup(entity)}
      <div class="damage-calc-controls">
        ${isAttacker
          ? `
            ${damageSelectMarkup(side, "attackTech", "可用科技", attackTechOptions)}
            ${damageSelectMarkup(side, "attackExtraTech", "额外科技", attackExtraOptions)}
          `
          : `${damageSelectMarkup(side, "defenseTech", "可用科技", defenseTechOptions)}`}
        ${damageSelectMarkup(side, "civBonus", "民族 / 独特加成", civOptions)}
        ${damageSelectMarkup(side, "terrain", "地形位置", damageTerrainOptions)}
      </div>
    </article>
  `;
}

function damageTerrainLabel(value) {
  return ({ low: "低地", level: "平地", high: "高地" })[value] || "平地";
}

function damageTerrainMultiplier(attackerState, defenderState, attackerCiv, defenderCiv) {
  const ranks = { low: 0, level: 1, high: 2 };
  const attackerRank = ranks[attackerState.terrain] ?? 1;
  const defenderRank = ranks[defenderState.terrain] ?? 1;
  const notes = [];
  let multiplier = 1;
  let label = "1.00（同高度）";

  if (attackerRank > defenderRank) {
    multiplier = 1.25;
    label = "1.25（高打低）";
    notes.push("高地攻击低地：1.25");
  } else if (attackerRank < defenderRank) {
    multiplier = 0.75;
    label = "0.75（低打高）";
    notes.push("低地攻击高地：0.75");
  } else {
    notes.push("同高度：1.00");
  }

  if (attackerCiv?.value === "tatars" && attackerRank > defenderRank) {
    multiplier += 0.25;
    label = `${damageFormat(multiplier)}（高打低 + 鞑靼）`;
    notes.push("鞑靼高地：+0.25");
  }

  if (defenderCiv?.value === "georgians" && defenderRank > attackerRank) {
    multiplier = Math.max(0, multiplier - 0.15);
    label = `${damageFormat(multiplier)}（低打高 + 格鲁吉亚）`;
    notes.push("格鲁吉亚高地：-0.15");
  }

  return { multiplier, label, notes };
}

function damageAttackAdjustment(entity, state) {
  const mode = damageAttackMode(entity);
  const original = mode === "ranged" ? damageNumber(entity?.stats?.rangedAttack) : mode === "melee" ? damageNumber(entity?.stats?.meleeAttack) : 0;
  const tech = damagePickOption(damageAttackTechOptions(entity), state.attackTech);
  const civ = damagePickOption(damageAttackerCivOptions(entity), state.civBonus);
  const flat = damageNumber(tech.flat);
  const multiplier = damageNumber(civ.attackMultiplier || 1) || 1;
  const beforeMultiplier = original + flat;
  const value = beforeMultiplier * multiplier;
  return {
    original,
    flat,
    multiplier,
    value,
    tech,
    civ,
    notes: [...(tech.notes || []), ...(civ.value !== "none" ? civ.notes || [] : [])]
  };
}

function damageDefenseAdjustment(entity, state, mode) {
  const original = mode === "ranged" ? damageNumber(entity?.stats?.pierceArmor) : mode === "melee" ? damageNumber(entity?.stats?.meleeArmor) : 0;
  const tech = damagePickOption(damageDefenseTechOptions(entity), state.defenseTech);
  const civ = damagePickOption(damageDefenderCivOptions(entity), state.civBonus);
  const techFlat = mode === "ranged" ? damageNumber(tech.pierce) : damageNumber(tech.melee);
  const civFlat = mode === "ranged" ? damageNumber(civ.pierce) : damageNumber(civ.melee);
  return {
    original,
    flat: techFlat + civFlat,
    value: original + techFlat + civFlat,
    tech,
    civ,
    tagMultiplier: damageNumber(civ.tagMultiplier || 1) || 1,
    notes: [...(tech.notes || []), ...(civ.value !== "none" ? civ.notes || [] : [])]
  };
}

function damageExtraMultiplier(attacker, defender, attackerState) {
  const extra = damagePickOption(damageAttackExtraTechOptions(attacker), attackerState.attackExtraTech);
  const defenderIsBuilding = defender?.nodeType === "building" || defender?.kind === "building";
  const defenderIsShip = damageHasCategory(defender, "船只") || damageHasArmourClass(defender, 16);

  if (extra.value === "siegeEngineers") {
    return defenderIsBuilding
      ? { multiplier: extra.multiplier, label: "1.20（攻城技师）", notes: extra.notes }
      : { multiplier: 1, label: "1.00", notes: ["攻城技师：未触发"] };
  }

  if (extra.value === "heatedShot") {
    return defenderIsShip
      ? { multiplier: extra.multiplier, label: "2.25（预热射击）", notes: extra.notes }
      : { multiplier: 1, label: "1.00", notes: ["预热射击：未触发"] };
  }

  return { multiplier: 1, label: "1.00", notes: [] };
}

function damageTerm(original, flat, multiplier = 1) {
  const base = flat ? `（${damageFormat(original)}+${damageFormat(flat)}）` : damageFormat(original);
  return multiplier !== 1 ? `${base}×${damageFormat(multiplier)}` : base;
}

function damageShortPhrase(terrain, option) {
  return `${damageTerrainLabel(terrain)}${option?.short || ""}`;
}

function calculateDamage() {
  const attackerState = damageSideState("attacker");
  const defenderState = damageSideState("defender");
  const attacker = damageEntity("attacker");
  const defender = damageEntity("defender");
  const mode = damageAttackMode(attacker);
  const attack = damageAttackAdjustment(attacker, attackerState);
  const defense = damageDefenseAdjustment(defender, defenderState, mode);
  const baseDamage = mode === "none" ? 0 : Math.max(0, attack.value - defense.value);
  const armourByClass = new Map((defender?.armourTags || []).map((tag) => [Number(tag.classId), tag]));
  const tagDetails = (attacker?.bonusAttacks || [])
    .filter((tag) => armourByClass.has(Number(tag.classId)))
    .map((tag) => {
      const armour = armourByClass.get(Number(tag.classId));
      const attackValue = damageNumber(tag.amount);
      const defenseValue = damageNumber(armour.amount);
      const rawDamage = Math.max(0, attackValue - defenseValue);
      const damage = rawDamage * defense.tagMultiplier;
      return { label: tag.label, attack: attackValue, defense: defenseValue, rawDamage, damage };
    });
  const tagRaw = tagDetails.reduce((sum, item) => sum + item.rawDamage, 0);
  const tagDamage = tagDetails.reduce((sum, item) => sum + item.damage, 0);
  const terrain = damageTerrainMultiplier(attackerState, defenderState, attack.civ, defense.civ);
  const extra = damageExtraMultiplier(attacker, defender, attackerState);
  const subtotal = baseDamage + tagDamage;
  const rawDamage = subtotal * terrain.multiplier * extra.multiplier;
  const canAttack = mode !== "none" || tagRaw > 0;
  const finalDamage = canAttack ? Math.max(1, Math.floor(rawDamage + 0.000001)) : 0;

  return {
    attacker,
    defender,
    mode,
    attack,
    defense,
    baseDamage,
    tagRaw,
    tagDamage,
    tagDetails,
    terrain,
    extra,
    subtotal,
    rawDamage,
    finalDamage
  };
}

function damageBaseFormula(result) {
  return `${damageTerm(result.attack.original, result.attack.flat, result.attack.multiplier)} - ${damageTerm(result.defense.original, result.defense.flat)} = ${damageFormat(result.baseDamage)}`;
}

function damageTagDetailsMarkup(result) {
  if (!result.tagDetails.length) return `<p class="damage-calc-note">没有命中的标签伤害</p>`;
  return `
    <ul class="damage-calc-tags">
      ${result.tagDetails.map((item) => `
        <li><strong>${escapeHTML(item.label)}</strong>：${escapeHTML(item.attack)} - ${escapeHTML(item.defense)}${result.defense.tagMultiplier !== 1 ? `，再 × ${escapeHTML(damageFormat(result.defense.tagMultiplier))}` : ""} = ${escapeHTML(damageFormat(item.damage))}</li>
      `).join("")}
    </ul>
  `;
}

function damageResultTitle(result) {
  const attackPhrase = damageShortPhrase(damageSideState("attacker").terrain, result.attack.tech);
  const defensePhrase = damageShortPhrase(damageSideState("defender").terrain, result.defense.tech);
  return `${attackPhrase}的${counterEntityName(result.attacker)}攻击${defensePhrase}的${counterEntityName(result.defender)}`;
}

function damageResultPairMarkup(result) {
  const attackPhrase = damageShortPhrase(damageSideState("attacker").terrain, result.attack.tech);
  const defensePhrase = damageShortPhrase(damageSideState("defender").terrain, result.defense.tech);
  return `
    ${escapeHTML(attackPhrase)}的<strong>${escapeHTML(counterEntityName(result.attacker))}</strong>
    攻击
    ${escapeHTML(defensePhrase)}的<strong>${escapeHTML(counterEntityName(result.defender))}</strong>
  `;
}

function damageResultCardMarkup() {
  const result = calculateDamage();
  const multiplierNotes = [
    ...result.attack.notes,
    ...result.defense.notes,
    ...result.terrain.notes,
    ...result.extra.notes
  ].filter(Boolean);
  return `
    <article class="damage-calc-card damage-calc-result">
      <h4>最终伤害</h4>
      <div class="damage-result-number">${escapeHTML(result.finalDamage)}</div>
      <p class="damage-result-pair">${damageResultPairMarkup(result)}</p>
      <dl class="damage-result-breakdown">
        <dt>基础伤害</dt><dd>${escapeHTML(damageBaseFormula(result))}</dd>
        <dt>标签伤害</dt><dd>${escapeHTML(damageFormat(result.tagDamage))}</dd>
        <dt>最终倍率</dt><dd>${escapeHTML(result.terrain.label)} × ${escapeHTML(result.extra.label)}</dd>
      </dl>
      ${damageTagDetailsMarkup(result)}
      <div class="damage-calc-note-list">
        ${multiplierNotes.map((note) => `<span>${escapeHTML(note)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderDamageCalculator() {
  return `
    <section class="damage-calculator" id="damageCalculator" aria-label="伤害计算器">
      <div class="damage-calculator-head">
        <h3>伤害计算器</h3>
      </div>
      <div class="damage-calc-grid">
        ${damageCombatantCardMarkup("attacker")}
        ${damageCombatantCardMarkup("defender")}
        ${damageResultCardMarkup()}
      </div>
    </section>
  `;
}

function bindDamageCalculator() {
  const calculator = document.querySelector("#damageCalculator");
  if (!calculator) return;

  calculator.addEventListener("input", (event) => {
    const input = event.target.closest(".damage-calc-search-input");
    if (!input) return;
    const side = input.dataset.damageSide;
    damageSideState(side).query = input.value;
    const results = calculator.querySelector(`[data-damage-results="${side}"]`);
    if (results) results.innerHTML = damageSearchResultsMarkup(side);
  });

  calculator.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-damage-field]");
    if (!select) return;
    const side = select.dataset.damageSide;
    const field = select.dataset.damageField;
    damageSideState(side)[field] = select.value;
    refreshDamageCalculator();
  });

  calculator.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("button[data-damage-category]");
    if (categoryButton) {
      const side = categoryButton.dataset.damageSide;
      const state = damageSideState(side);
      state.category = categoryButton.dataset.damageCategory || "全部";
      state.query = "";
      refreshDamageCalculator();
      return;
    }

    const button = event.target.closest("button[data-damage-select]");
    if (!button) return;
    const side = button.dataset.damageSide;
    const state = damageSideState(side);
    state.selectedId = button.dataset.damageSelect;
    state.query = "";
    state.attackTech = "none";
    state.attackExtraTech = "none";
    state.defenseTech = "none";
    state.civBonus = "none";
    refreshDamageCalculator();
  });
}

const damageClassIds = {
  infantry: 1,
  elephant: 5,
  cavalry: 8,
  allBuildings: 11,
  stoneDefense: 13,
  ship: 16,
  siege: 20,
  standardBuilding: 21,
  spearman: 27,
  cavalryArcher: 28,
  camel: 30
};

function damageEntityName(entity) {
  return counterEntityName(entity);
}

function damageIncludesName(entity, ...needles) {
  const name = damageEntityName(entity);
  return needles.some((needle) => name.includes(needle));
}

function damageHasAnyArmourClass(entity, classIds) {
  return classIds.some((classId) => damageHasArmourClass(entity, classId));
}

function damageEntityFlags(entity) {
  const mode = damageAttackMode(entity);
  const hasClass = (classId) => damageHasArmourClass(entity, classId);
  const building = entity?.nodeType === "building" || entity?.kind === "building";
  const ship = damageHasCategory(entity, "船只") || hasClass(16) || entity?.buildingId === 45;
  const siege = damageHasCategory(entity, "攻城") || hasClass(20) || hasClass(17) || entity?.buildingId === 49;
  const monk = damageHasCategory(entity, "僧侣") || hasClass(25) || entity?.buildingId === 1806 || entity?.buildingId === 104;
  const infantry = !building && (damageHasCategory(entity, "步兵") || hasClass(1));
  const archer = !building && (damageHasCategory(entity, "弓兵") || hasClass(15) || hasClass(28) || hasClass(38));
  const cavalry = !building && (damageHasCategory(entity, "骑兵") || hasClass(8) || hasClass(30) || hasClass(5));
  const elephant = hasClass(5) || damageIncludesName(entity, "象");
  const gunpowder = damageHasCategory(entity, "火药") || hasClass(23);
  const landUnit = !building && !ship;
  const barracksUnit = entity?.buildingId === 12;
  const stableUnit = entity?.buildingId === 101;
  const archeryRangeUnit = entity?.buildingId === 87;
  return {
    mode,
    building,
    ship,
    siege,
    monk,
    infantry,
    archer,
    cavalry,
    elephant,
    gunpowder,
    landUnit,
    barracksUnit,
    stableUnit,
    archeryRangeUnit
  };
}

function damageIsSpearLine(entity) {
  return damageIncludesName(entity, "长矛兵", "长枪兵", "长戟兵");
}

function damageIsSkirmisherLine(entity) {
  return damageIncludesName(entity, "掷矛手");
}

function damageIsMilitiaLine(entity) {
  return damageIncludesName(entity, "民兵", "剑士", "冠军剑士");
}

function damageIsKnightLine(entity) {
  return damageIncludesName(entity, "骑士", "重装骑士", "游侠", "贵族铁骑", "黑光铠骑兵");
}

function damageIsScoutLine(entity) {
  return damageIncludesName(entity, "斥候骑兵", "轻骑兵", "翼骑兵", "匈牙利轻骑兵");
}

function damageIsCavalryArcher(entity) {
  return damageHasArmourClass(entity, damageClassIds.cavalryArcher) || damageIncludesName(entity, "骑射手", "蒙古突骑", "马扎尔骠骑");
}

function damageIsCamel(entity) {
  return damageHasArmourClass(entity, damageClassIds.camel) || damageIncludesName(entity, "骆驼");
}

function damageIsSteppeLancer(entity) {
  return damageIncludesName(entity, "草原枪兵", "草原枪骑兵");
}

function damageIsCataphract(entity) {
  return damageIncludesName(entity, "甲胄骑兵");
}

function damageIsArrowShip(entity) {
  return damageEntityFlags(entity).ship && damageHasAnyArmourClass(entity, [damageClassIds.ship, 60]) && !damageEntityFlags(entity).gunpowder;
}

function damageStateList(side, field) {
  const state = damageSideState(side);
  if (!Array.isArray(state[field])) state[field] = [];
  return state[field];
}

function damageSetStateList(side, field, values) {
  damageSideState(side)[field] = [...new Set(values)];
}

function damageCanUseChemistry(entity) {
  const flags = damageEntityFlags(entity);
  return flags.mode === "ranged" && !flags.gunpowder && !flags.siege && !flags.monk && (flags.archer || flags.ship || flags.building);
}

function damageCanUseArson(entity) {
  const flags = damageEntityFlags(entity);
  return flags.infantry && !flags.siege && !flags.monk && !flags.ship;
}

function damageCanUseSiegeEngineers(entity) {
  const flags = damageEntityFlags(entity);
  return flags.siege;
}

function damageCanUseHeatedShot(entity) {
  const flags = damageEntityFlags(entity);
  return flags.building && flags.mode === "ranged";
}

function damageAttackTechOptions(entity) {
  const flags = damageEntityFlags(entity);
  if (flags.mode === "none" || flags.monk || flags.siege || flags.gunpowder) {
    return [damageOption("none", "无可用铁匠铺攻击科技", { short: "", flat: 0, notes: [] })];
  }

  if (flags.mode === "melee" && flags.landUnit) {
    return [
      damageOption("none", "无", { short: "", flat: 0, notes: [] }),
      damageOption("melee1", "锻造（+1）", { short: "1级攻击", flat: 1, notes: ["锻造 +1"] }),
      damageOption("melee2", "锻造 + 铁铸（+2）", { short: "2级攻击", flat: 2, notes: ["锻造 +1", "铁铸 +1"] }),
      damageOption("meleeFull", "满级近战攻击（+4）", { short: "满级攻击", flat: 4, notes: ["锻造 +1", "铁铸 +1", "鼓风炉 +2"] })
    ];
  }

  if (flags.mode === "ranged") {
    const labelPrefix = flags.ship ? "船只远程" : flags.building ? "建筑远程" : "远程";
    return [
      damageOption("none", "无", { short: "", flat: 0, notes: [] }),
      damageOption("ranged1", `${labelPrefix}：箭羽（+1）`, { short: "1级攻击", flat: 1, notes: ["箭羽 +1"] }),
      damageOption("ranged2", `${labelPrefix}：箭羽 + 锥状箭头（+2）`, { short: "2级攻击", flat: 2, notes: ["箭羽 +1", "锥状箭头 +1"] }),
      damageOption("rangedFull", `${labelPrefix}：箭羽 + 锥状箭头 + 护腕（+3）`, { short: "满级铁匠铺攻击", flat: 3, notes: ["箭羽 +1", "锥状箭头 +1", "护腕 +1"] })
    ];
  }

  return [damageOption("none", "无可用铁匠铺攻击科技", { short: "", flat: 0, notes: [] })];
}

function damageDefenseTechOptions(entity) {
  const flags = damageEntityFlags(entity);
  if (flags.building) {
    return [
      damageOption("none", "无", { short: "", melee: 0, pierce: 0, notes: [] }),
      damageOption("masonry", "砖瓦技术（+1 近防 / +1 远防）", { short: "1级防御", melee: 1, pierce: 1, notes: ["砖瓦技术 +1/+1"] }),
      damageOption("architecture", "砖瓦技术 + 建筑学（+2 近防 / +2 远防）", { short: "2级防御", melee: 2, pierce: 2, notes: ["砖瓦技术 +1/+1", "建筑学 +1/+1"] })
    ];
  }

  if (flags.ship) {
    return [
      damageOption("none", "无", { short: "", melee: 0, pierce: 0, notes: [] }),
      damageOption("careening", "倾侧维修（+1 近防 / +1 远防）", { short: "1级防御", melee: 1, pierce: 1, notes: ["倾侧维修 +1/+1"] }),
      damageOption("dryDock", "倾侧维修 + 干船坞（+2 近防 / +2 远防）", { short: "2级防御", melee: 2, pierce: 2, notes: ["倾侧维修 +1/+1", "干船坞 +1/+1"] })
    ];
  }

  if (flags.siege || flags.monk) {
    return [damageOption("none", "无可用铁匠铺防御科技", { short: "", melee: 0, pierce: 0, notes: [] })];
  }

  const line = flags.cavalry ? "骑兵护甲" : flags.archer ? "射手护甲" : "步兵护甲";
  return [
    damageOption("none", "无", { short: "", melee: 0, pierce: 0, notes: [] }),
    damageOption("armor1", `${line} 1级（+1 近防 / +1 远防）`, { short: "1级防御", melee: 1, pierce: 1, notes: [`${line} 1级 +1/+1`] }),
    damageOption("armor2", `${line} 2级（+2 近防 / +2 远防）`, { short: "2级防御", melee: 2, pierce: 2, notes: [`${line} 1级 +1/+1`, `${line} 2级 +1/+1`] }),
    damageOption("armorFull", `${line} 满级（+3 近防 / +4 远防）`, { short: "满级防御", melee: 3, pierce: 4, notes: [`${line} 1级 +1/+1`, `${line} 2级 +1/+1`, `${line} 3级 +1/+2`] })
  ];
}

function damageCommonTechOptions(side, entity) {
  const options = [];
  if (side === "attacker") {
    if (damageCanUseChemistry(entity)) {
      options.push(damageOption("chemistry", "化学：远程攻击 +1", { flat: 1, notes: ["化学 +1"] }));
    }
    if (damageCanUseArson(entity)) {
      options.push(damageOption("arson", "纵火：对建筑 +2", {
        tagFlatByClass: { [damageClassIds.standardBuilding]: 2 },
        notes: ["纵火：标准建筑标签 +2"]
      }));
    }
    if (damageCanUseSiegeEngineers(entity)) {
      options.push(damageOption("siegeEngineers", "攻城技师：对建筑 +20%", {
        multiplier: 1.2,
        trigger: "building",
        notes: ["攻城技师：对建筑 x1.20"]
      }));
    }
    if (damageCanUseHeatedShot(entity)) {
      options.push(damageOption("heatedShot", "预热射击：对船只 +125%", {
        multiplier: 2.25,
        trigger: "ship",
        notes: ["预热射击：对船只 x2.25"]
      }));
    }
  }
  return options;
}

function damageSelectedCommonTechs(side, entity) {
  const options = damageCommonTechOptions(side, entity);
  const allowed = new Set(options.map((option) => option.value));
  const selected = damageStateList(side, "commonTechs").filter((value) => allowed.has(value));
  damageSetStateList(side, "commonTechs", selected);
  return options.filter((option) => selected.includes(option.value));
}

function damageCommonTechsMarkup(side, label, options) {
  if (!options.length) return `<div class="damage-calc-checks damage-calc-checks-empty" aria-hidden="true"></div>`;
  const selected = new Set(damageStateList(side, "commonTechs"));
  return `
    <fieldset class="damage-calc-checks">
      <legend>${escapeHTML(label)}</legend>
      <div class="damage-calc-check-list">
        ${options.map((option) => `
          <label class="damage-calc-check">
            <input
              type="checkbox"
              data-damage-side="${escapeHTML(side)}"
              data-damage-common-tech="${escapeHTML(option.value)}"
              ${selected.has(option.value) ? "checked" : ""}
            >
            <span>${escapeHTML(option.label)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function damageAttackerCivOptions(entity) {
  const flags = damageEntityFlags(entity);
  const name = damageEntityName(entity);
  const options = [damageOption("none", "无", { short: "", attackFlat: 0, attackMultiplier: 1, tagMultiplier: 1, tagFlatByClass: {}, notes: [] })];

  if (flags.mode !== "none") {
    options.push(damageOption("tatars", "鞑靼：高地额外 +25%", { short: "鞑靼加成", notes: ["鞑靼高地额外 +25%"] }));
  }
  if (damageIsSpearLine(entity)) {
    options.push(damageOption("bohemianSpears", "波西米亚：长矛兵系额外伤害 +25%", {
      short: "波西米亚加成",
      tagMultiplier: 1.25,
      notes: ["波西米亚长矛兵系标签伤害 x1.25"]
    }));
  }
  if (flags.cavalry) {
    options.push(damageOption("gurjaraMountedBonus", "古尔加拉：骑兵额外伤害 +40%", {
      short: "古尔加拉加成",
      tagMultiplier: 1.4,
      notes: ["古尔加拉骑乘单位标签伤害 x1.40"]
    }));
    options.push(damageOption("malianFarimba", "马里：死士（骑兵攻击 +5）", {
      short: "死士",
      attackFlat: 5,
      notes: ["死士：骑兵攻击 +5"]
    }));
  }
  if (flags.gunpowder) {
    options.push(damageOption("burgundianGunpowder", "勃艮第：火药单位攻击 +25%", {
      short: "勃艮第火药",
      attackMultiplier: 1.25,
      notes: ["勃艮第火药单位攻击 x1.25"]
    }));
    options.push(damageOption("spanishGunpowder", "西班牙：火药单位攻击 +18%", {
      short: "西班牙火药",
      attackMultiplier: 1.18,
      notes: ["西班牙火药单位攻击 x1.18"]
    }));
  }
  if (/弩炮|火箭推车|楼船/.test(name)) {
    options.push(damageOption("chineseRocketry", "中国：火箭术（攻击 +25%）", {
      short: "火箭术",
      attackMultiplier: 1.25,
      notes: ["火箭术：攻击 x1.25"]
    }));
  }
  if (flags.infantry) {
    options.push(damageOption("burmeseInfantry", "缅甸：帝王时代步兵攻击 +3", {
      short: "缅甸加成",
      attackFlat: 3,
      notes: ["缅甸步兵攻击 +3"]
    }));
    options.push(damageOption("aztecGarlandWars", "阿兹特克：荣冠战争（步兵攻击 +4）", {
      short: "荣冠战争",
      attackFlat: 4,
      notes: ["荣冠战争：步兵攻击 +4"]
    }));
    options.push(damageOption("gothInfantryVsBuildings", "哥特：帝王步兵对建筑 +3", {
      short: "哥特加成",
      tagFlatByClass: { [damageClassIds.standardBuilding]: 3 },
      notes: ["哥特步兵对标准建筑标签 +3"]
    }));
    options.push(damageOption("vikingChieftains", "维京：酋长（步兵反骑兵 / 骆驼）", {
      short: "酋长",
      tagFlatByClass: { [damageClassIds.cavalry]: 5, [damageClassIds.camel]: 4 },
      notes: ["酋长：骑乘单位标签 +5，骆驼标签 +4"]
    }));
  }
  if (damageIsSkirmisherLine(entity)) {
    options.push(damageOption("aztecAtlatl", "阿兹特克：掷矛器（掷矛手攻击 +1）", {
      short: "掷矛器",
      attackFlat: 1,
      notes: ["掷矛器：掷矛手攻击 +1"]
    }));
  }
  if (damageIsCavalryArcher(entity)) {
    options.push(damageOption("magyarRecurveBow", "马扎尔：反曲弓（骑射手攻击 +1）", {
      short: "反曲弓",
      attackFlat: 1,
      notes: ["反曲弓：骑射手攻击 +1"]
    }));
  }
  if (damageIsKnightLine(entity) || name.includes("烈堤司")) {
    options.push(damageOption("lithuanianRelics", "立陶宛：4 圣物（骑士系 / 烈堤司攻击 +4）", {
      short: "4圣物",
      attackFlat: 4,
      notes: ["4 件圣物：攻击 +4"]
    }));
  }
  if (flags.mode === "melee" && (flags.infantry || flags.cavalry)) {
    options.push(damageOption("dravidianWootz", "达罗毗荼：乌兹钢（步兵和骑兵无视护甲）", {
      short: "乌兹钢",
      ignoreBaseArmor: true,
      notes: ["乌兹钢：基础近战护甲按 0 计算"]
    }));
  }
  if (damageIsCataphract(entity)) {
    options.push(damageOption("byzantineLogistica", "拜占庭：后勤学（甲胄骑兵对步兵 +6）", {
      short: "后勤学",
      tagFlatByClass: { [damageClassIds.infantry]: 6 },
      notes: ["后勤学：步兵标签 +6"]
    }));
  }
  if (flags.building && name.includes("塔")) {
    options.push(damageOption("britonYeomenTower", "不列颠：英皇侍卫（塔攻击 +2）", {
      short: "英皇侍卫",
      attackFlat: 2,
      notes: ["英皇侍卫：塔攻击 +2"]
    }));
    options.push(damageOption("georgianSvanTowers", "格鲁吉亚：斯万箭塔（防御工事攻击 +2）", {
      short: "斯万箭塔",
      attackFlat: 2,
      notes: ["斯万箭塔：防御工事攻击 +2"]
    }));
  }
  if (damageIsArrowShip(entity)) {
    options.push(damageOption("romanBallistasShip", "罗马：弩炮（箭船攻击 +2）", {
      short: "罗马弩炮",
      attackFlat: 2,
      notes: ["罗马弩炮：箭船攻击 +2"]
    }));
  }

  return options;
}

function damageDefenderCivOptions(entity) {
  const flags = damageEntityFlags(entity);
  const options = [damageOption("none", "无", { short: "", melee: 0, pierce: 0, tagMultiplier: 1, armorTechMultiplier: 1, notes: [] })];

  if (flags.landUnit && !flags.siege) {
    options.push(damageOption("sicilianBonusDamage", "西西里：士兵受到加成伤害 -40%", {
      short: "西西里加成",
      tagMultiplier: 0.6,
      notes: ["西西里标签伤害 x0.60"]
    }));
  }
  if (flags.elephant) {
    options.push(damageOption("bengaliElephant", "孟加拉：象兵加成伤害 -25%", {
      short: "孟加拉象兵",
      tagMultiplier: 0.75,
      notes: ["孟加拉象兵标签伤害 x0.75"]
    }));
    options.push(damageOption("burmeseElephantArmor", "缅甸：象兵护甲 +2/+2", {
      short: "缅甸象兵",
      melee: 2,
      pierce: 2,
      notes: ["缅甸象兵护甲 +2/+2"]
    }));
  }
  if (flags.monk) {
    options.push(damageOption("bengaliMonk", "孟加拉：僧侣 +3/+3 护甲", {
      short: "孟加拉僧侣",
      melee: 3,
      pierce: 3,
      notes: ["孟加拉僧侣 +3/+3 护甲"]
    }));
  }
  if (!flags.ship) {
    options.push(damageOption("georgianHighland", "格鲁吉亚：高地减伤 15%", {
      short: "格鲁吉亚加成",
      notes: ["格鲁吉亚高地减伤 15%"]
    }));
  }
  if (flags.barracksUnit || flags.stableUnit) {
    options.push(damageOption("teutonMeleeArmor", "条顿：兵营和马厩单位近防 +2", {
      short: "条顿近防",
      melee: 2,
      notes: ["条顿兵营 / 马厩单位近防 +2"]
    }));
  }
  if (flags.siege) {
    options.push(damageOption("teutonIronclad", "条顿：重装甲（攻城武器近防 +4）", {
      short: "重装甲",
      melee: 4,
      notes: ["重装甲：攻城武器近防 +4"]
    }));
  }
  if (flags.infantry) {
    options.push(damageOption("romanInfantryArmor", "罗马：步兵护甲升级效果加倍", {
      short: "罗马护甲",
      armorTechMultiplier: 2,
      notes: ["罗马步兵护甲升级效果加倍"]
    }));
  }
  if (flags.barracksUnit) {
    options.push(damageOption("malianBarracksPierce", "马里：兵营单位远防 +3", {
      short: "马里远防",
      pierce: 3,
      notes: ["马里兵营单位远防 +3"]
    }));
  }
  if (damageIsMilitiaLine(entity)) {
    options.push(damageOption("bulgarianBagains", "保加利亚：协议（民兵系近防 +5）", {
      short: "协议",
      melee: 5,
      notes: ["协议：民兵系近防 +5"]
    }));
  }
  if (flags.gunpowder) {
    options.push(damageOption("hindustaniGunpowderArmor", "印度斯坦：火药单位 +1/+1 护甲", {
      short: "印度斯坦火药",
      melee: 1,
      pierce: 1,
      notes: ["印度斯坦火药单位 +1/+1 护甲"]
    }));
  }
  if ((flags.archeryRangeUnit && !flags.gunpowder && !damageIsSkirmisherLine(entity)) || damageIncludesName(entity, "意大利佣兵")) {
    options.push(damageOption("italianArcherArmor", "意大利：步弓手 / 意大利佣兵 +1/+1", {
      short: "意大利护甲",
      melee: 1,
      pierce: 1,
      notes: ["意大利步弓手 / 意大利佣兵 +1/+1"]
    }));
  }
  if (damageIsSpearLine(entity) || damageIsSkirmisherLine(entity)) {
    options.push(damageOption("lithuanianTowerShields", "立陶宛：塔盾（长矛兵系 / 掷矛手远防 +2）", {
      short: "塔盾",
      pierce: 2,
      notes: ["塔盾：远防 +2"]
    }));
  }
  if (damageIsCamel(entity) || damageIsCavalryArcher(entity)) {
    options.push(damageOption("gurjaraFrontierGuards", "古尔加拉：边防部队（骆驼 / 骑象弓兵近防 +4）", {
      short: "边防部队",
      melee: 4,
      notes: ["边防部队：近防 +4"]
    }));
  }
  if (damageIsScoutLine(entity) || damageIsCavalryArcher(entity) || damageIsSteppeLancer(entity)) {
    options.push(damageOption("tatarSilkArmor", "鞑靼：丝护甲（轻骑 / 草原枪兵 / 骑射手 +1/+1）", {
      short: "丝护甲",
      melee: 1,
      pierce: 1,
      notes: ["丝护甲：护甲 +1/+1"]
    }));
  }
  if (damageIsKnightLine(entity)) {
    options.push(damageOption("sicilianHauberk", "西西里：锁子甲（骑士系 +1/+2）", {
      short: "锁子甲",
      melee: 1,
      pierce: 2,
      notes: ["锁子甲：骑士系 +1/+2"]
    }));
  }
  if (flags.cavalry) {
    options.push(damageOption("weiMingguang", "魏：明光铠（骑兵近防 +4）", {
      short: "明光铠",
      melee: 4,
      notes: ["明光铠：骑兵近防 +4"]
    }));
  }
  if (flags.ship && damageIsArrowShip(entity)) {
    options.push(damageOption("romanShipArmor", "罗马：箭船系和德罗蒙战舰 +1/+1", {
      short: "罗马船防",
      melee: 1,
      pierce: 1,
      notes: ["罗马箭船系和德罗蒙战舰 +1/+1"]
    }));
  }
  if (flags.archer || damageIncludesName(entity, "蔷琵战士")) {
    options.push(damageOption("muiscaMeleeArmor", "穆伊斯卡：靶场单位 / 蔷琵战士近防 +3", {
      short: "穆伊斯卡近防",
      melee: 3,
      notes: ["穆伊斯卡近防 +3"]
    }));
  }

  return options;
}

function damageCombatantCardMarkup(side) {
  const state = damageSideState(side);
  const isAttacker = side === "attacker";
  const title = isAttacker ? "进攻方" : "被进攻方";
  const entity = damageEntity(side);
  const attackTechOptions = damageAttackTechOptions(entity);
  const defenseTechOptions = damageDefenseTechOptions(entity);
  const commonOptions = damageCommonTechOptions(side, entity);
  const civOptions = isAttacker ? damageAttackerCivOptions(entity) : damageDefenderCivOptions(entity);
  return `
    <article class="damage-calc-card damage-calc-combatant" data-damage-card="${escapeHTML(side)}">
      <h4>${escapeHTML(title)}</h4>
      <label class="damage-calc-search">
        <input
          class="damage-calc-search-input"
          data-damage-side="${escapeHTML(side)}"
          type="search"
          autocomplete="off"
          placeholder="搜索单位 / 建筑"
          value="${escapeHTML(state.query)}"
        >
      </label>
      ${damageCategoryButtonsMarkup(side)}
      <div class="damage-calc-results" data-damage-results="${escapeHTML(side)}">
        ${damageSearchResultsMarkup(side)}
      </div>
      ${damageEntitySummaryMarkup(entity)}
      <div class="damage-calc-controls">
        ${isAttacker
          ? `${damageSelectMarkup(side, "attackTech", "铁匠铺攻击", attackTechOptions)}`
          : `${damageSelectMarkup(side, "defenseTech", "防御科技", defenseTechOptions)}`}
        ${damageCommonTechsMarkup(side, "通用科技", commonOptions)}
        ${damageSelectMarkup(side, "civBonus", "民族 / 特色科技", civOptions)}
        ${damageSelectMarkup(side, "terrain", "地形位置", damageTerrainOptions)}
      </div>
    </article>
  `;
}

function damageMergeClassMap(target, source) {
  for (const [classId, value] of Object.entries(source || {})) {
    const key = Number(classId);
    target.set(key, (target.get(key) || 0) + damageNumber(value));
  }
}

function damageAttackAdjustment(entity, state) {
  const mode = damageAttackMode(entity);
  const original = mode === "ranged" ? damageNumber(entity?.stats?.rangedAttack) : mode === "melee" ? damageNumber(entity?.stats?.meleeAttack) : 0;
  const tech = damagePickOption(damageAttackTechOptions(entity), state.attackTech);
  const civ = damagePickOption(damageAttackerCivOptions(entity), state.civBonus);
  const commonTechs = damageSelectedCommonTechs("attacker", entity);
  const commonFlat = commonTechs.reduce((sum, option) => sum + damageNumber(option.flat), 0);
  const civFlat = damageNumber(civ.attackFlat);
  const flat = damageNumber(tech.flat) + commonFlat + civFlat;
  const multiplier = damageNumber(civ.attackMultiplier || 1) || 1;
  const tagFlatByClass = new Map();
  commonTechs.forEach((option) => damageMergeClassMap(tagFlatByClass, option.tagFlatByClass));
  damageMergeClassMap(tagFlatByClass, civ.tagFlatByClass);
  const tagMultiplier = damageNumber(civ.tagMultiplier || 1) || 1;
  const value = (original + flat) * multiplier;
  return {
    original,
    flat,
    multiplier,
    value,
    tech,
    civ,
    commonTechs,
    tagFlatByClass,
    tagMultiplier,
    ignoreBaseArmor: Boolean(civ.ignoreBaseArmor),
    notes: [
      ...(tech.notes || []),
      ...commonTechs.flatMap((option) => option.notes || []),
      ...(civ.value !== "none" ? civ.notes || [] : [])
    ]
  };
}

function damageDefenseAdjustment(entity, state, mode) {
  const original = mode === "ranged" ? damageNumber(entity?.stats?.pierceArmor) : mode === "melee" ? damageNumber(entity?.stats?.meleeArmor) : 0;
  const tech = damagePickOption(damageDefenseTechOptions(entity), state.defenseTech);
  const civ = damagePickOption(damageDefenderCivOptions(entity), state.civBonus);
  const baseTechFlat = mode === "ranged" ? damageNumber(tech.pierce) : mode === "melee" ? damageNumber(tech.melee) : 0;
  const techMultiplier = damageNumber(civ.armorTechMultiplier || 1) || 1;
  const techFlat = baseTechFlat * techMultiplier;
  const civFlat = mode === "ranged" ? damageNumber(civ.pierce) : mode === "melee" ? damageNumber(civ.melee) : 0;
  const flat = techFlat + civFlat;
  return {
    original,
    flat,
    value: original + flat,
    tech,
    civ,
    tagMultiplier: damageNumber(civ.tagMultiplier || 1) || 1,
    notes: [
      ...(tech.notes || []),
      ...(civ.value !== "none" ? civ.notes || [] : [])
    ]
  };
}

function damageExtraMultiplier(attacker, defender, attackerState) {
  const commonTechs = damageSelectedCommonTechs("attacker", attacker);
  const defenderIsBuilding = defender?.nodeType === "building" || defender?.kind === "building";
  const defenderIsShip = damageHasCategory(defender, "船只") || damageHasArmourClass(defender, 16);
  const notes = [];
  const labels = [];
  let multiplier = 1;

  for (const option of commonTechs) {
    if (option.value === "siegeEngineers") {
      if (defenderIsBuilding) {
        multiplier *= option.multiplier;
        labels.push("1.20（攻城技师）");
        notes.push(...(option.notes || []));
      } else {
        notes.push("攻城技师：未触发");
      }
    }
    if (option.value === "heatedShot") {
      if (defenderIsShip) {
        multiplier *= option.multiplier;
        labels.push("2.25（预热射击）");
        notes.push(...(option.notes || []));
      } else {
        notes.push("预热射击：未触发");
      }
    }
  }

  return {
    multiplier,
    label: labels.length ? labels.join(" × ") : "1.00",
    notes
  };
}

function damageTerrainMultiplier(attackerState, defenderState, attackerCiv, defenderCiv) {
  const ranks = { low: 0, level: 1, high: 2 };
  const attackerRank = ranks[attackerState.terrain] ?? 1;
  const defenderRank = ranks[defenderState.terrain] ?? 1;
  const notes = [];
  let multiplier = 1;
  let label = "1.00（同高度）";

  if (attackerRank > defenderRank) {
    multiplier = 1.25;
    label = "1.25（高打低）";
    notes.push("高地攻击低地：1.25");
  } else if (attackerRank < defenderRank) {
    multiplier = 0.75;
    label = "0.75（低打高）";
    notes.push("低地攻击高地：0.75");
  } else {
    notes.push("同高度：1.00");
  }

  if (attackerCiv?.value === "tatars" && attackerRank > defenderRank) {
    multiplier += 0.25;
    label = `${damageFormat(multiplier)}（高打低 + 鞑靼）`;
    notes.push("鞑靼高地：+0.25");
  }

  if (defenderCiv?.value === "georgianHighland" && defenderRank > attackerRank) {
    multiplier = Math.max(0, multiplier - 0.15);
    label = `${damageFormat(multiplier)}（低打高 + 格鲁吉亚）`;
    notes.push("格鲁吉亚高地：-0.15");
  }

  return { multiplier, label, notes };
}

function calculateDamage() {
  const attackerState = damageSideState("attacker");
  const defenderState = damageSideState("defender");
  const attacker = damageEntity("attacker");
  const defender = damageEntity("defender");
  const mode = damageAttackMode(attacker);
  const attack = damageAttackAdjustment(attacker, attackerState);
  const defense = damageDefenseAdjustment(defender, defenderState, mode);
  const effectiveDefenseValue = attack.ignoreBaseArmor && mode === "melee" ? 0 : defense.value;
  const baseDamage = mode === "none" ? 0 : Math.max(0, attack.value - effectiveDefenseValue);
  const armourByClass = new Map((defender?.armourTags || []).map((tag) => [Number(tag.classId), tag]));
  const tagDetails = (attacker?.bonusAttacks || [])
    .filter((tag) => armourByClass.has(Number(tag.classId)))
    .map((tag) => {
      const classId = Number(tag.classId);
      const armour = armourByClass.get(classId);
      const originalAttack = damageNumber(tag.amount);
      const flat = damageNumber(attack.tagFlatByClass.get(classId));
      const attackValue = originalAttack + flat;
      const defenseValue = damageNumber(armour.amount);
      const rawDamage = Math.max(0, attackValue - defenseValue);
      const multiplier = attack.tagMultiplier * defense.tagMultiplier;
      const damage = rawDamage * multiplier;
      return {
        classId,
        label: tag.label,
        originalAttack,
        flat,
        attack: attackValue,
        defense: defenseValue,
        rawDamage,
        multiplier,
        damage
      };
    });
  const tagRaw = tagDetails.reduce((sum, item) => sum + item.rawDamage, 0);
  const tagDamage = tagDetails.reduce((sum, item) => sum + item.damage, 0);
  const terrain = damageTerrainMultiplier(attackerState, defenderState, attack.civ, defense.civ);
  const extra = damageExtraMultiplier(attacker, defender, attackerState);
  const subtotal = baseDamage + tagDamage;
  const rawDamage = subtotal * terrain.multiplier * extra.multiplier;
  const canAttack = mode !== "none" || tagRaw > 0;
  const finalDamage = canAttack ? Math.max(1, Math.floor(rawDamage + 0.000001)) : 0;

  return {
    attacker,
    defender,
    mode,
    attack,
    defense,
    effectiveDefenseValue,
    baseDamage,
    tagRaw,
    tagDamage,
    tagDetails,
    terrain,
    extra,
    subtotal,
    rawDamage,
    finalDamage
  };
}

function damageTagTerm(original, flat) {
  return flat ? `（${damageFormat(original)}+${damageFormat(flat)}）` : damageFormat(original);
}

function damageBaseFormula(result) {
  const defenseTerm = result.attack.ignoreBaseArmor && result.mode === "melee"
    ? "0（乌兹钢）"
    : damageTerm(result.defense.original, result.defense.flat);
  return `${damageTerm(result.attack.original, result.attack.flat, result.attack.multiplier)} - ${defenseTerm} = ${damageFormat(result.baseDamage)}`;
}

function damageTagDetailsMarkup(result) {
  if (!result.tagDetails.length) return `<p class="damage-calc-note">没有命中的标签伤害</p>`;
  return `
    <ul class="damage-calc-tags">
      ${result.tagDetails.map((item) => `
        <li><strong>${escapeHTML(item.label)}</strong>：${escapeHTML(damageTagTerm(item.originalAttack, item.flat))} - ${escapeHTML(item.defense)}${item.multiplier !== 1 ? `，再 × ${escapeHTML(damageFormat(item.multiplier))}` : ""} = ${escapeHTML(damageFormat(item.damage))}</li>
      `).join("")}
    </ul>
  `;
}

function bindDamageCalculator() {
  const calculator = document.querySelector("#damageCalculator");
  if (!calculator) return;

  calculator.addEventListener("input", (event) => {
    const input = event.target.closest(".damage-calc-search-input");
    if (!input) return;
    const side = input.dataset.damageSide;
    damageSideState(side).query = input.value;
    const results = calculator.querySelector(`[data-damage-results="${side}"]`);
    if (results) results.innerHTML = damageSearchResultsMarkup(side);
  });

  calculator.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox'][data-damage-common-tech]");
    if (checkbox) {
      const side = checkbox.dataset.damageSide;
      const value = checkbox.dataset.damageCommonTech;
      const selected = new Set(damageStateList(side, "commonTechs"));
      if (checkbox.checked) {
        selected.add(value);
      } else {
        selected.delete(value);
      }
      damageSetStateList(side, "commonTechs", [...selected]);
      refreshDamageCalculator();
      return;
    }

    const select = event.target.closest("select[data-damage-field]");
    if (!select) return;
    const side = select.dataset.damageSide;
    const field = select.dataset.damageField;
    damageSideState(side)[field] = select.value;
    refreshDamageCalculator();
  });

  calculator.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("button[data-damage-category]");
    if (categoryButton) {
      const side = categoryButton.dataset.damageSide;
      const state = damageSideState(side);
      state.category = categoryButton.dataset.damageCategory || "全部";
      state.query = "";
      refreshDamageCalculator();
      return;
    }

    const button = event.target.closest("button[data-damage-select]");
    if (!button) return;
    const side = button.dataset.damageSide;
    const state = damageSideState(side);
    state.selectedId = button.dataset.damageSelect;
    state.query = "";
    state.attackTech = "none";
    state.attackExtraTech = "none";
    state.defenseTech = "none";
    state.commonTechs = [];
    state.civBonus = "none";
    refreshDamageCalculator();
  });
}

function basicKnowledgeSearchRecord(chapter, section, title, text, targetId, tags = []) {
  return {
    type: "基础",
    title: title || section?.title || chapter.title || "基础知识",
    text: (Array.isArray(text) ? text : [text]).filter(Boolean).join(" "),
    tags: ["基础知识", chapter.title, section?.title, ...tags].filter(Boolean),
    breadcrumb: ["基础知识", chapter.title, section?.title].filter(Boolean).join(" / "),
    view: "builds",
    basicTarget: targetId || section?.id || chapter.sections?.[0]?.id || ""
  };
}

function basicKnowledgeSectionSearchItems(chapter, section) {
  const records = [basicKnowledgeSearchRecord(
    chapter,
    section,
    section.title,
    [section.introText, ...(section.body || []), section.ageUp],
    section.id
  )];
  const add = (title, text, targetId, tags) => {
    if (!title || !(Array.isArray(text) ? text : [text]).some(Boolean)) return;
    records.push(basicKnowledgeSearchRecord(chapter, section, title, text, targetId, tags));
  };

  (section.aoe2Analysis?.points || []).forEach((point) => add(point.takeaway, point.detail, point.id, [section.aoe2Analysis.title]));
  (section.items || []).forEach((item) => add(item.label || item.name, [item.time, item.text], item.id || section.id));
  (section.aliases || []).forEach((alias) => add(alias.name, alias.means, section.id, ["玩家称呼"]));
  (section.versions || []).forEach((version) => add(version.name, [version.time, version.alias, version.content], section.id, ["游戏版本"]));
  (section.dlcs || []).forEach((dlc) => add(dlc.name, [dlc.time, dlc.civs, dlc.campaigns], section.id, ["DLC"]));
  (section.groups || []).forEach((group) => {
    add(group.title, group.text, section.id);
    (group.modes || []).forEach((mode) => add(mode.tag, [mode.title, mode.detail], mode.id, [group.title]));
  });
  (section.resources || []).forEach((resource) => add(resource.name, [`主要来源：${resource.source}`, `主要用途：${resource.use}`], resource.id, ["资源"]));
  (section.population || []).forEach((item) => add(item.label, item.text, section.id, ["人口"]));
  (section.ages || []).forEach((age) => {
    add(age.name, [age.role, age.detail], age.id, ["时代"]);
    (age.routes || []).forEach((route) => add(route.label, route.text, age.id, [age.name, "战略路线"]));
  });
  (section.unlocks || []).forEach((unlock) => add(`${unlock.from} → ${unlock.to}`, unlock.note, section.id, ["建筑解锁"]));
  (section.attributes || []).forEach((item) => add(item.label, item.text, section.id, ["单位面板"]));
  (section.differences || []).forEach((item) => add(item.label, item.text, section.id, ["文明差异"]));
  (section.terms || []).forEach((term) => add(
    `${term.zh} / ${term.en}`,
    [term.aliases ? `常见写法：${term.aliases}` : "", term.text],
    term.id,
    ["玩家黑话", term.zh, term.en, term.aliases]
  ));
  (section.mapTypes || []).forEach((type) => add(type.name, type.text, type.id, ["地图类型"]));
  (section.maps || []).forEach((map) => add(map.name, [`地图介绍：${map.official}`, `基本思路：${map.understanding}`], map.id, [map.type, "地图"]));

  return records;
}

const basicKnowledgeSearchItems = (basicKnowledgeData.chapters || []).flatMap((chapter) => {
  const chapterRecord = basicKnowledgeSearchRecord(
    chapter,
    null,
    chapter.title,
    [chapter.intro, chapter.notice, chapter.summary],
    chapter.sections?.[0]?.id,
    ["章节"]
  );
  return [chapterRecord, ...(chapter.sections || []).flatMap((section) => basicKnowledgeSectionSearchItems(chapter, section))];
});

function playerEcologySearchRecord(section, title, text, targetId, tags = []) {
  return {
    type: "生态",
    title: title || section.title || playerEcologyData.title,
    text: (Array.isArray(text) ? text : [text]).filter(Boolean).join(" "),
    tags: ["玩家生态", section.title, ...tags].filter(Boolean),
    breadcrumb: ["玩家生态", section.title].filter(Boolean).join(" / "),
    view: "mistakes",
    ecologyTarget: targetId || section.id
  };
}

function playerEcologySectionSearchItems(section) {
  const records = [playerEcologySearchRecord(section, section.title, [section.introText, section.stance], section.id, ["章节"] )];
  const add = (title, text, targetId, tags = []) => {
    if (!title || !(Array.isArray(text) ? text : [text]).some(Boolean)) return;
    records.push(playerEcologySearchRecord(section, title, text, targetId, tags));
  };

  (section.items || []).forEach((item) => add(item.label, item.text, item.id));
  (section.bands || []).forEach((band) => add(
    band.name,
    [
      band.rating,
      band.summary,
      band.mastered,
      band.bottleneck,
      ...(band.recommendations || []).flatMap((item) => [item.name, item.platform, item.note])
    ],
    band.id,
    ["天梯分段", band.rating]
  ));
  (section.groups || []).forEach((group) => {
    add(group.title, [
      group.text,
      group.purpose,
      group.suitableFor,
      ...(group.links || []).flatMap((item) => [item.label, item.platform, item.note])
    ], group.id);
    (group.people || []).forEach((person) => add(
      person.name,
      [person.region, person.status, person.identity, person.detail, ...(person.links || []).map((item) => item.label)],
      person.id,
      [group.title, person.region]
    ));
  });
  (section.series || []).forEach((item) => add(
    item.name,
    [item.tag, item.organizer, item.format, item.text],
    item.id || section.id,
    ["赛事系列", item.tag]
  ));
  return records;
}

const playerEcologySearchItems = (playerEcologyData.sections || []).flatMap(playerEcologySectionSearchItems);

const searchItems = [
  ...allCivs.map((civ) => ({
    type: "文明",
    title: displayCivName(civ),
    text: `科技树 建筑 ${civ.counts?.buildings || 0} 单位 ${civ.counts?.units || 0} 科技 ${civ.counts?.techs || 0}`,
    tags: ["文明", "科技树", civ.key],
    view: "civilizations",
    civKey: civ.key,
    civMode: "techtree"
  })),
  ...civGuides.map((guide) => {
    const civ = civByKey.get(guide.key);
    return {
      type: "解读",
      title: displayCivName(civ),
      text: `${guide.official?.type || ""} ${guide.summary || ""} ${guide.guide?.firstBuild || ""}`,
      tags: ["文明解读", guide.official?.type || "", guide.key],
      view: "civilizations",
      civKey: guide.key,
      civMode: "guides"
    };
  }),
  ...units.map((item) => ({ type: "单位", title: item.name, text: `${item.building} ${item.age} ${item.cost} ${item.role}`, tags: item.tags, view: "units" })),
  ...basicKnowledgeSearchItems,
  ...playerEcologySearchItems,
  { type: "云玩", title: "云玩之家", text: "对话助手 问答模拟 网页斗蛐蛐 单位对战", tags: ["云玩之家", "问答", "斗蛐蛐"], view: "operations" },
  { type: "问题", title: "我被骑士打爆，应该出什么？", text: "先看枪兵线、僧侣、防御和侦查，再结合时代、经济和数量判断。", tags: ["骑士", "克制", "防守"], view: "units" }
];

function showView(view) {
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  document.body.classList.toggle("home-active", view === "home");
  document.querySelector("#siteBar").hidden = view === "home";
  document.querySelectorAll(".view-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function searchQueryTokens(query) {
  return [...new Set(String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean))];
}

function searchItemHaystack(item) {
  return `${item.title} ${item.breadcrumb || ""} ${item.text} ${(item.tags || []).join(" ")}`.toLowerCase();
}

function search(query) {
  const tokens = searchQueryTokens(query);
  if (!tokens.length) return searchItems.slice(0, 8);

  return searchItems
    .filter((item) => tokens.every((token) => searchItemHaystack(item).includes(token)))
    .map((item) => {
      const title = String(item.title || "").toLowerCase();
      const breadcrumb = String(item.breadcrumb || "").toLowerCase();
      const text = String(item.text || "").toLowerCase();
      const score = tokens.reduce((total, token) => total
        + (title.startsWith(token) ? 10 : title.includes(token) ? 7 : 0)
        + (breadcrumb.includes(token) ? 3 : 0)
        + (text.includes(token) ? 1 : 0), 0);
      return { ...item, searchScore: score };
    })
    .sort((a, b) => b.searchScore - a.searchScore || a.title.localeCompare(b.title, "zh-CN"));
}

function searchSnippet(text, query, maxLength = 118) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const lower = clean.toLowerCase();
  const indexes = searchQueryTokens(query).map((token) => lower.indexOf(token)).filter((index) => index >= 0);
  const matchIndex = indexes.length ? Math.min(...indexes) : 0;
  let start = Math.max(0, matchIndex - 34);
  let end = Math.min(clean.length, start + maxLength);
  if (end === clean.length) start = Math.max(0, end - maxLength);
  return `${start > 0 ? "…" : ""}${clean.slice(start, end).trim()}${end < clean.length ? "…" : ""}`;
}

function searchHighlightMarkup(value, query) {
  const tokens = searchQueryTokens(query).sort((a, b) => b.length - a.length);
  if (!tokens.length) return escapeHTML(value);
  const escapedTokens = tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  return String(value || "").split(matcher).map((part, index) => (
    index % 2 ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part)
  )).join("");
}

function renderSearchResults(query) {
  const results = search(query);
  const target = document.querySelector("#searchResults");
  document.querySelector("#moduleSearchInput").value = query;
  target.innerHTML = results.length
    ? results.slice(0, 20).map((item) => `
      <article class="result-card">
        <button type="button" data-view="${item.view}" ${item.civKey ? `data-open-civ="${escapeHTML(item.civKey)}" data-open-civ-mode="${escapeHTML(item.civMode)}"` : ""}${item.basicTarget ? ` data-basic-target="${escapeHTML(item.basicTarget)}"` : ""}${item.ecologyTarget ? ` data-ecology-target="${escapeHTML(item.ecologyTarget)}"` : ""}>
          <span class="search-result-meta"><span class="badge">${escapeHTML(item.type)}</span>${item.breadcrumb ? `<span>${escapeHTML(item.breadcrumb)}</span>` : ""}</span>
          <h3>${searchHighlightMarkup(item.title, query)}</h3>
          <p>${searchHighlightMarkup(searchSnippet(item.text, query), query)}</p>
        </button>
      </article>
    `).join("")
    : `<article class="result-card"><span class="badge">无结果</span><h3>没有找到匹配内容</h3><p>可以换成文明名、兵种名、基础知识，或直接搜“骑士”“弓兵”“被骑士打爆”。</p></article>`;
  showView("search");
}

function setCivMode(mode) {
  civState.mode = mode;
  document.querySelectorAll("[data-civ-mode]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.civMode === mode));
  });
  document.querySelectorAll("[data-civ-mode-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.civModePanel === mode);
  });
}

function renderCivChooser(targetId, civs, selectedKey, onSelect) {
  const target = document.querySelector(targetId);
  const openGroups = getCivChooserOpenGroups(targetId);
  const query = getCivChooserQuery(targetId);
  const hasQuery = Boolean(normalizeSearchText(query));
  const visibleCivs = hasQuery ? civs.filter((civ) => matchesCivSearch(civ, query)) : civs;
  const groups = ["A-G", "H-M", "N-T", "U-Z"].map((label) => ({
    label,
    items: visibleCivs.filter((civ) => civInitialGroup(civ) === label)
  })).filter((group) => group.items.length);

  target.innerHTML = groups.length ? groups.map((group) => `
    <details class="civ-fold" data-civ-group="${escapeHTML(group.label)}" ${hasQuery || openGroups.has(group.label) ? "open" : ""}>
      <summary>${group.label}<span>${group.items.length}</span></summary>
      <div class="civ-button-list">
        ${group.items.map((civ) => `
          <button type="button" class="civ-select" data-civ-key="${escapeHTML(civ.key)}" aria-selected="${civ.key === selectedKey}">
            ${civ.emblem ? `<img src="${escapeHTML(civ.emblem)}" alt="">` : ""}
            <span>${escapeHTML(civ.zhName || civ.name || civ.key)}</span>
            <small>${escapeHTML(civ.key)}</small>
          </button>
        `).join("")}
      </div>
    </details>
  `).join("") : `<p class="mini-search-empty">没有匹配文明</p>`;

  target.querySelectorAll(".civ-fold").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (hasQuery) return;
      const group = details.dataset.civGroup;
      if (!group) return;
      if (details.open) {
        openGroups.add(group);
      } else {
        openGroups.delete(group);
      }
    });
  });

  target.onclick = (event) => {
    const button = event.target.closest("button[data-civ-key]");
    if (!button) return;
    if (hasQuery) {
      setCivChooserQuery(targetId, "");
      syncCivChooserInput(targetId);
    }
    onSelect(button.dataset.civKey);
  };
}

function renderTechCivList() {
  renderCivChooser("#techCivList", allCivs, civState.techKey, selectTechCiv);
}

function bindCivSearch(inputId, targetId, renderList) {
  const input = document.querySelector(inputId);
  if (!input) return;
  input.value = getCivChooserQuery(targetId);
  input.addEventListener("input", () => {
    setCivChooserQuery(targetId, input.value);
    renderList();
  });
}

function statusClass(status) {
  if (status === "NotAvailable") return "locked";
  if (status === "ResearchRequired") return "required";
  return "available";
}

function statusLabel(status) {
  if (status === "NotAvailable") return "不可用";
  if (status === "ResearchRequired") return "需升级";
  return "可用";
}

function nodeTypeLabel(node) {
  if (!node) return "项目";
  return {
    building: "建筑",
    "regional-building": "区域建筑",
    "unique-building": "特色建筑",
    unit: "单位",
    "regional-unit": "区域单位",
    "unique-unit": "特色单位",
    tech: "科技"
  }[node.kind] || "项目";
}

function statLabel(key) {
  return {
    age: "时代",
    status: "状态",
    cost: "成本",
    hp: "生命值",
    meleeAttack: "近战攻击",
    rangedAttack: "远程攻击",
    range: "射程",
    meleeArmor: "近防",
    pierceArmor: "远防",
    garrison: "驻扎",
    time: "训练 / 研究时间",
    speed: "移动速度",
    reloadTime: "攻击间隔",
    attackDelay: "攻击延迟",
    accuracy: "命中率",
    minRange: "最小射程",
    lineOfSight: "视野",
    frameDelay: "开火帧延迟",
    blastWidth: "溅射半径",
    maxCharge: "充能上限",
    rechargeRate: "充能速率",
    rechargeDuration: "充能持续"
  }[key] || key;
}

function findDefaultNode(civ) {
  const nodes = Object.values(civ.nodes || {});
  return nodes.find((node) => node.nodeType === "UniqueUnit" && node.status !== "NotAvailable")
    || nodes.find((node) => node.type === "Building" && node.status !== "NotAvailable")
    || nodes.find((node) => node.status !== "NotAvailable")
    || nodes[0];
}

function renderNode(node, selectedNodeId, nodeSize) {
  if (!node) return "";
  const active = node.id === selectedNodeId ? " active" : "";
  return `
    <button
      type="button"
      class="tech-node tree-node kind-${escapeHTML(node.kind)} ${statusClass(node.status)}${active}"
      data-node-id="${escapeHTML(node.id)}"
      title="${escapeHTML(node.name)}"
      style="left:${node.x}px; top:${node.y}px; width:${nodeSize}px; height:${nodeSize}px"
    >
      <span class="node-image"><img src="${escapeHTML(node.image)}" alt=""></span>
      <span class="node-name">${escapeHTML(node.name)}</span>
    </button>
  `;
}

function connectionPoints(civ, connection) {
  const from = civ.nodes[connection.from];
  const to = civ.nodes[connection.to];
  const size = civ.layout?.nodeSize ?? 48;
  if (!from || !to) return "";
  const offset = size / 2;
  const fromX = from.x + offset;
  const fromY = from.y + offset;
  const toX = to.x + offset;
  const toY = to.y + offset;
  const midY = fromY + size * 2 / 3;
  return `${fromX},${fromY} ${fromX},${midY} ${toX},${midY} ${toX},${toY}`;
}

function collectTechPath(civ, nodeId, acc = { nodes: new Set(), lines: new Set() }) {
  if (!nodeId || acc.nodes.has(nodeId)) return acc;
  acc.nodes.add(nodeId);
  const parents = civ.layout?.parentMap?.[nodeId] || [];
  parents.forEach((parentId) => {
    acc.lines.add(`${parentId}__${nodeId}`);
    collectTechPath(civ, parentId, acc);
  });
  return acc;
}

function applyTechHighlight(civ, nodeId) {
  const board = document.querySelector("#techTreeCanvas");
  const path = collectTechPath(civ, nodeId);
  board.querySelectorAll(".tree-node").forEach((node) => {
    node.classList.toggle("is-path", path.nodes.has(node.dataset.nodeId));
    node.classList.toggle("active", node.dataset.nodeId === nodeId);
  });
  board.querySelectorAll(".tree-line").forEach((line) => {
    line.classList.toggle("is-path", path.lines.has(line.dataset.lineId));
  });
}

function selectTechNode(civ, nodeId) {
  if (!civ?.nodes?.[nodeId]) return;
  civState.selectedNodeByCiv[civ.key] = nodeId;
  renderNodeDetail(civ, nodeId);
  applyTechHighlight(civ, nodeId);
}

function renderTechTree(key, requestedNodeId) {
  const civ = civByKey.get(key) || allCivs[0];
  if (!civ) return;

  civState.techKey = civ.key;
  const defaultNode = findDefaultNode(civ);
  const selectedNodeId = requestedNodeId || civState.selectedNodeByCiv[civ.key] || defaultNode?.id;
  civState.selectedNodeByCiv[civ.key] = selectedNodeId;

  document.querySelector("#techCivName").textContent = displayCivName(civ);
  document.querySelector("#techCivMeta").textContent = "";

  const legend = document.querySelector("#techLegend");
  legend.innerHTML = (techtreeData.nodeKindLegend || []).map((item) => `
    <span><i class="kind-dot kind-${escapeHTML(item.kind)}"></i>${escapeHTML(item.label)}</span>
  `).join("");

  const board = document.querySelector("#techTreeCanvas");
  const layout = civ.layout || {};
  const nodeSize = layout.nodeSize || 48;
  const width = layout.width || 4200;
  const height = layout.height || 560;
  const nodes = (civ.nodeOrder || Object.keys(civ.nodes || {})).map((id) => civ.nodes[id]).filter(Boolean);
  const connections = layout.connections || [];

  board.innerHTML = `
    <div class="tech-board tree-board" style="width:${width}px; height:${height}px; --node-size:${nodeSize}px">
      ${(layout.ageBands || []).map((age, index) => `
        <section class="age-band age-band-${index + 1}" style="top:${age.y}px; height:${age.height}px; width:${width}px">
          <div class="age-badge">
            <img src="${escapeHTML(age.image)}" alt="">
            <strong>${escapeHTML(age.name)}</strong>
          </div>
        </section>
      `).join("")}
      <svg class="tree-lines" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">
        ${connections.map((connection) => `
          <polyline
            class="tree-line"
            data-line-id="${escapeHTML(connection.from)}__${escapeHTML(connection.to)}"
            points="${connectionPoints(civ, connection)}"
          ></polyline>
        `).join("")}
      </svg>
      <div class="tree-nodes">
        ${nodes.map((node) => renderNode(node, selectedNodeId, nodeSize)).join("")}
      </div>
    </div>
  `;

  board.onmouseover = (event) => {
    const button = event.target.closest("button[data-node-id]");
    if (!button) return;
    applyTechHighlight(civ, button.dataset.nodeId);
  };
  board.onmouseout = (event) => {
    const leavingNode = event.target.closest("button[data-node-id]");
    const enteringNode = event.relatedTarget?.closest?.("button[data-node-id]");
    if (!leavingNode || enteringNode) return;
    applyTechHighlight(civ, civState.selectedNodeByCiv[civ.key]);
  };
  board.onclick = (event) => {
    const button = event.target.closest("button[data-node-id]");
    if (!button) return;
    selectTechNode(civ, button.dataset.nodeId);
  };

  renderNodeDetail(civ, selectedNodeId);
  applyTechHighlight(civ, selectedNodeId);
}

function statListMarkup(stats) {
  const entries = Object.entries(stats || {}).filter(([, value]) => value !== "" && value !== undefined && value !== null);
  if (!entries.length) return "";
  return `
    <dl class="node-stats">
      ${entries.map(([key, value]) => `<dt>${escapeHTML(statLabel(key))}</dt><dd>${escapeHTML(value)}</dd>`).join("")}
    </dl>
  `;
}

function sortCombatTags(items, mode) {
  const priorities = mode === "armour"
    ? ["基础近战", "基础远程"]
    : ["基础远程", "基础近战"];
  return [...(items || [])].sort((a, b) => {
    const aIndex = priorities.indexOf(a.label);
    const bIndex = priorities.indexOf(b.label);
    if (aIndex !== bIndex) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    return Math.abs(Number(b.amount)) - Math.abs(Number(a.amount));
  });
}

function statChipMarkup(items, mode) {
  if (!items?.length) return "";
  const sortedItems = sortCombatTags(items, mode);
  return `
    <div class="stat-chip-list">
      ${sortedItems.map((item) => `
        <span class="stat-chip ${mode}">
          ${escapeHTML(item.label)} ${Number(item.amount) > 0 ? "+" : ""}${escapeHTML(item.amount)}
        </span>
      `).join("")}
    </div>
  `;
}

function isUnitSearchNode(node) {
  return ["unit", "regional-unit", "unique-unit"].includes(node?.kind);
}

function getNodeSearchResults(civ, query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  const nodesById = civ?.nodes || {};
  return (civ?.nodeOrder || Object.keys(nodesById))
    .map((id) => nodesById[id])
    .filter((node) => isUnitSearchNode(node))
    .filter((node) => {
      const haystack = normalizeSearchText(`${node.name} ${node.help?.heading || ""} ${node.help?.description || ""}`);
      return haystack.includes(normalized);
    })
    .slice(0, 8);
}

function nodeSearchResultsMarkup(civ, query) {
  if (!normalizeSearchText(query)) return "";
  const results = getNodeSearchResults(civ, query);
  if (!results.length) return `<p class="mini-search-empty">没有匹配单位</p>`;
  return results.map((node) => `
    <button type="button" class="node-result ${statusClass(node.status)}" data-node-id="${escapeHTML(node.id)}">
      <img src="${escapeHTML(node.image)}" alt="">
      <span>${escapeHTML(node.name)}</span>
      <small>${escapeHTML(techtreeData.ageNames?.[node.ageId] || "")}</small>
    </button>
  `).join("");
}

function nodeSearchMarkup(civ) {
  const query = civState.nodeSearchQuery || "";
  return `
    <div class="mini-search node-search">
      <label for="nodeSearchInput">搜索单位</label>
      <input id="nodeSearchInput" type="search" autocomplete="off" placeholder="输入单位名" value="${escapeHTML(query)}">
      <div class="node-search-results" id="nodeSearchResults">
        ${nodeSearchResultsMarkup(civ, query)}
      </div>
    </div>
  `;
}

function bindNodeSearch(civ) {
  const input = document.querySelector("#nodeSearchInput");
  const results = document.querySelector("#nodeSearchResults");
  if (!input || !results) return;
  input.addEventListener("input", () => {
    civState.nodeSearchQuery = input.value;
    results.innerHTML = nodeSearchResultsMarkup(civ, input.value);
  });
  results.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-node-id]");
    if (!button) return;
    civState.nodeSearchQuery = "";
    selectTechNode(civ, button.dataset.nodeId);
  });
}

function renderNodeDetail(civ, nodeId) {
  const node = civ?.nodes?.[nodeId] || findDefaultNode(civ);
  const detail = document.querySelector("#nodeDetail");
  if (!node) {
    detail.className = "node-detail";
    detail.innerHTML = `${nodeSearchMarkup(civ)}<div class="node-detail-body"><h3>选择一个图标</h3></div>`;
    bindNodeSearch(civ);
    return;
  }

  const basicStats = {
    age: techtreeData.ageNames?.[node.ageId] || "未标注",
    status: statusLabel(node.status),
    ...(node.stats?.basic || {})
  };
  const advancedStats = node.stats?.advanced || {};
  const detailStats = { ...basicStats, ...advancedStats };
  const description = node.help?.description || node.help?.heading || "";
  detail.className = `node-detail detail-kind-${node.kind}`;
  detail.innerHTML = `
    ${nodeSearchMarkup(civ)}
    <div class="node-detail-body">
      <div class="node-thumb ${statusClass(node.status)}">
        <img src="${escapeHTML(node.image)}" alt="">
      </div>
      <span class="badge kind-badge kind-${escapeHTML(node.kind)}">${nodeTypeLabel(node)}</span>
      <h3>${escapeHTML(node.name)}</h3>
      ${description ? `<p class="node-help">${escapeHTML(description)}</p>` : ""}
      ${statListMarkup(detailStats)}
      ${node.stats?.attacks?.length ? `<h4>攻击标签</h4>${statChipMarkup(node.stats.attacks, "attack")}` : ""}
      ${node.stats?.armours?.length ? `<h4>护甲标签</h4>${statChipMarkup(node.stats.armours, "armour")}` : ""}
      ${node.help?.upgrades ? `<h4>升级关联</h4><p class="node-upgrades">${escapeHTML(node.help.upgrades)}</p>` : ""}
    </div>
  `;
  bindNodeSearch(civ);
}

function selectTechCiv(key) {
  if (!civByKey.has(key)) return;
  civState.techKey = key;
  civState.nodeSearchQuery = "";
  renderTechCivList();
  renderTechTree(key);
}

function selectOptionsMarkup(items, selectedId) {
  return items.map((item) => `<option value="${escapeHTML(item.id)}"${item.id === selectedId ? " selected" : ""}>${escapeHTML(item.label)}</option>`).join("");
}

function rankingSnapshotKey() {
  const { queue, elo, mode, duration, mapGroup, patch } = civState.ranking;
  const fullKey = `${patch}_${mode}_${queue}_${elo}_${duration || "all"}_${mapGroup}`;
  if (winrateData.snapshots?.[fullKey]) return fullKey;
  const noPatchKey = `${mode}_${queue}_${elo}_${duration || "all"}_${mapGroup}`;
  if (winrateData.snapshots?.[noPatchKey]) return noPatchKey;
  if (mode === "rm" && elo === "all" && mapGroup === "all") {
    return queue === "team" ? "rm_team_all" : "rm_1v1_all";
  }
  return fullKey;
}

function rankingSelectedLabel(group, id) {
  return rankingControls[group]?.find((item) => item.id === id)?.label || "";
}

function findRankingMapMatch(query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;
  for (const group of rankingControls.mapGroups) {
    const aliases = group.maps || [group.label, group.sourceMap].filter(Boolean);
    const map = aliases.find((item) => normalizeSearchText(item).includes(normalized) || normalized.includes(normalizeSearchText(item)));
    if (map && group.id !== "all") return { group, map };
  }
  return null;
}

function findRankingCivMatch(query) {
  if (!normalizeSearchText(query)) return null;
  return allCivs.find((civ) => matchesCivSearch(civ, query)) || null;
}

function rankingSearchInfo(rows) {
  const query = civState.ranking.search;
  const civ = findRankingCivMatch(query);
  if (civ) {
    const row = rows.find((item) => item.key === civ.key);
    return {
      key: civ.key,
      text: row
        ? `已突出：${displayCivName(civ)} · 第 ${row.rank} 名 · 胜率 ${row.winRate.toFixed(1)}%`
        : `当前榜单没有 ${displayCivName(civ)} 的记录`
    };
  }

  const mapMatch = findRankingMapMatch(query);
  if (mapMatch) {
    return {
      key: "",
      text: `${mapMatch.map}：${mapMatch.group.label}`
    };
  }

  if (normalizeSearchText(query)) {
    return { key: "", text: "没有匹配文明或地图" };
  }

  return { key: "", text: "可搜索文明名突出榜单行，也可搜索地图名查看分类。" };
}

function focusRankingRow(key) {
  if (!key) return;
  const wrap = document.querySelector(".ranking-table-wrap");
  const row = document.querySelector(`#rankingRows tr[data-rank-key="${CSS.escape(key)}"]`);
  if (!wrap || !row) return;
  wrap.scrollTop = Math.max(0, row.offsetTop - wrap.clientHeight / 2 + row.clientHeight / 2);
}

function renderRankingControls() {
  const bindings = [
    ["#rankingQueueSelect", "queue", "queues"],
    ["#rankingDurationSelect", "duration", "durations"],
    ["#rankingEloSelect", "elo", "elos"],
    ["#rankingMapSelect", "mapGroup", "mapGroups"]
  ];

  bindings.forEach(([selector, stateKey, optionsKey]) => {
    const select = document.querySelector(selector);
    select.innerHTML = selectOptionsMarkup(rankingControls[optionsKey], civState.ranking[stateKey]);
    select.onchange = () => {
      civState.ranking[stateKey] = select.value;
      renderWinrateTable();
    };
  });

  const input = document.querySelector("#rankingSearchInput");
  input.value = civState.ranking.search;
  input.addEventListener("input", () => {
    civState.ranking.search = input.value;
    renderWinrateTable();
  });

  renderWinrateTable();
}

function winrateClass(value) {
  if (value >= 52) return "high";
  if (value < 48) return "low";
  return "mid";
}

function renderWinrateTable() {
  const source = winrateData.source || {};
  const sourceParts = [
    rankingSelectedLabel("queues", civState.ranking.queue),
    rankingSelectedLabel("durations", civState.ranking.duration),
    rankingSelectedLabel("elos", civState.ranking.elo),
    rankingSelectedLabel("mapGroups", civState.ranking.mapGroup)
  ];
  const filter = { label: sourceParts.filter(Boolean).join(" · ") };
  const rows = winrateData.snapshots?.[rankingSnapshotKey()] || [];
  const info = rankingSearchInfo(rows);
  const sourceDate = source.sourceRange || "静态快照";
  const patchLabel = rankingControls.patches.find((item) => item.id === civState.ranking.patch)?.fullLabel || rankingSelectedLabel("patches", civState.ranking.patch) || source.gameVersion || "";
  document.querySelector("#rankingSource").textContent = `胜率统计 · ${patchLabel} · ${sourceDate} · ${filter?.label || ""}`;
  const sourceLink = document.querySelector("#rankingSourceLink");
  if (sourceLink) sourceLink.href = source.url || "https://empirestats.online/civs";

  document.querySelector("#rankingSearchHint").textContent = info.text;

  const tbody = document.querySelector("#rankingRows");
  tbody.innerHTML = rows.map((row) => {
    const civ = civByKey.get(row.key);
    return `
      <tr class="${info.key === row.key ? "is-highlighted" : ""}" data-rank-key="${escapeHTML(row.key)}">
        <td>${row.rank}</td>
        <td>
          <button type="button" class="rank-civ-link" data-rank-civ="${escapeHTML(row.key)}">
            ${civ?.emblem ? `<img src="${escapeHTML(civ.emblem)}" alt="">` : ""}
            <span>${escapeHTML(displayCivName(civ) || row.key)}</span>
          </button>
        </td>
        <td><strong class="winrate ${winrateClass(row.winRate)}">${row.winRate.toFixed(1)}%</strong></td>
        <td>${row.pickRate.toFixed(1)}%</td>
        <td>${escapeHTML(row.games)}</td>
      </tr>
    `;
  }).join("");

  if (!rows.length) {
    tbody.innerHTML = `
      <tr class="ranking-empty">
        <td colspan="5">当前组合暂无榜单</td>
      </tr>
    `;
  }

  tbody.onclick = (event) => {
    const button = event.target.closest("button[data-rank-civ]");
    if (!button) return;
    const civ = civByKey.get(button.dataset.rankCiv);
    civState.ranking.search = displayCivName(civ) || button.dataset.rankCiv;
    document.querySelector("#rankingSearchInput").value = civState.ranking.search;
    renderWinrateTable();
  };

}

function renderGuideCivList() {
  const guideCivs = civGuides.map((guide) => civByKey.get(guide.key)).filter(Boolean);
  renderCivChooser("#guideCivList", guideCivs, civState.guideKey, selectGuideCiv);
}

function selectGuideCiv(key) {
  if (!civGuides.some((guide) => guide.key === key)) return;
  civState.guideKey = key;
  renderGuideCivList();
  renderGuideDetail(key);
}

function renderGuideDetail(key) {
  const guide = civGuides.find((item) => item.key === key) || civGuides[0];
  const civ = civByKey.get(guide.key);
  document.querySelector("#guideDetail").innerHTML = `
    <div class="civ-head">
      <div class="civ-title-row">
        ${civ?.emblem ? `<img src="${escapeHTML(civ.emblem)}" alt="">` : ""}
        <div>
          <div class="civ-kind">${escapeHTML(guide.official.type)}</div>
          <h2>${escapeHTML(displayCivName(civ))}</h2>
          <p>${escapeHTML(guide.summary)}</p>
        </div>
      </div>
      <div class="rating">上手难度：${escapeHTML(guide.difficulty)}</div>
    </div>
    <section class="guide-section official-dossier">
      ${guideSectionTitle("文明特色")}
      <div class="official-layout">
        <div class="official-block official-type">
          <h4>文明类型</h4>
          <p>${escapeHTML(guide.official.type)}</p>
        </div>
        <div class="official-block official-bonuses">
          <h4>民族加成</h4>
          ${listMarkup(guide.official.bonuses)}
        </div>
        <div class="official-block official-units">
          <h4>独特单位</h4>
          ${officialCardsMarkup(guide.official.uniqueUnits, civ, { icons: true })}
        </div>
        <div class="official-block official-techs">
          <h4>独特科技</h4>
          ${officialCardsMarkup(guide.official.uniqueTechs, civ)}
        </div>
        <div class="official-block official-team">
          <h4>团队加成</h4>
          <p>${escapeHTML(guide.official.teamBonus)}</p>
        </div>
      </div>
    </section>
    ${guideAnalysisMarkup(guide.analysis)}
    ${mapPlanMarkup(guide.maps)}
    ${guidePlayerManualMarkup(guide.guide)}
  `;
}

function renderCivModule() {
  document.querySelector(".civ-mode-tabs").onclick = (event) => {
    const button = event.target.closest("button[data-civ-mode]");
    if (!button) return;
    setCivMode(button.dataset.civMode);
  };

  renderTechCivList();
  renderTechTree(civState.techKey);
  renderRankingControls();
  renderGuideCivList();
  renderGuideDetail(civState.guideKey);
  bindCivSearch("#techCivSearch", "#techCivList", renderTechCivList);
  bindCivSearch("#guideCivSearch", "#guideCivList", renderGuideCivList);
}

function renderUnits() {
  document.querySelector("#unitList").innerHTML = `
    <article class="damage-guide">
      ${renderCounterAtlas()}
      ${renderDamageCalculator()}

      <section class="formula-grid" aria-label="伤害公式">
        <article class="formula-panel">
          <h3 id="damageFormulaTitle">伤害公式</h3>
          <div class="formula-text">最终伤害 = （基础伤害 + 标签伤害1 + 标签伤害2 + ...）× 加减伤最终倍率</div>
        </article>
        <article class="formula-panel">
          <h3>进阶公式</h3>
          <div class="formula-text">最终伤害 = max(1, (max(0, 近战/远程攻击 - 近战/远程护甲) + max(0, (标签1攻击 - 标签1护甲) × (1 + 克制加伤率)) + max(0, (标签2攻击 - 标签2护甲) × (1 + 克制加伤率)) + ...) × 加减伤最终倍率)</div>
        </article>
      </section>

      <section class="damage-columns" aria-label="基础伤害和标签伤害">
        <article class="damage-card">
          <h4>基础伤害</h4>
          <p><strong>基础伤害</strong>来自本次攻击实际使用的<strong>基础近战</strong>或<strong>基础远程</strong>。</p>
          <div class="mini-formula">
            <code>近战攻击 - 近战护甲</code>
            <code>远程攻击 - 远程护甲</code>
          </div>
          <ul>
            <li><strong>基础伤害</strong>最少为 <strong>0</strong>。</li>
            <li><strong>最终伤害</strong>最少为 <strong>1</strong>。</li>
            <li><strong>铁匠铺科技</strong>会改变面板数值：<strong>锻造</strong>、<strong>铁铸</strong>、<strong>鼓风炉</strong>提高近战攻击；<strong>箭羽</strong>、<strong>锥状箭头</strong>、<strong>护腕</strong>提高多数远程单位和防御建筑的远程攻击与射程。</li>
          </ul>
          <p class="example-text">案例：<strong>骑士</strong>攻击<strong>长枪兵</strong>，基础伤害 = max(0, <strong>10</strong> 近战攻击 - <strong>0</strong> 近战护甲) = <strong>10</strong>。</p>
          <p class="note-text">注意：<strong>轻型投石车</strong>、<strong>中型投石车</strong>、<strong>重型投石车</strong>、<strong>手推炮</strong>视觉上是远程弹体，但基础伤害使用<strong>基础近战</strong>结算。</p>
        </article>

        <article class="damage-card">
          <h4>标签伤害</h4>
          <p><strong>标签伤害</strong>来自隐藏的<strong>攻击标签</strong>和<strong>护甲标签</strong>。</p>
          <div class="mini-formula">
            <code>（标签攻击 - 标签护甲）×（1 + 克制加伤率）</code>
          </div>
          <ul>
            <li><strong>标签伤害</strong>最少为 <strong>0</strong>。</li>
            <li>攻击方有<strong>攻击标签</strong>，目标没有对应<strong>护甲标签</strong>时，该标签不造成伤害。</li>
            <li>多个<strong>攻击标签</strong>可以同时命中，分别计算后相加。</li>
          </ul>
          <p class="example-text">案例：<strong>长戟兵</strong>攻击<strong>骑士</strong>，骑乘单位标签伤害 = max(0, <strong>32</strong> 标签攻击 - <strong>0</strong> 标签护甲) = <strong>32</strong>。</p>
          <p class="note-text">案例：<strong>长戟兵</strong>攻击<strong>甲胄骑兵</strong>，骑乘单位标签伤害 = max(0, <strong>32</strong> - <strong>12</strong>) = <strong>20</strong>；攻击<strong>精锐甲胄骑兵</strong>则为 max(0, <strong>32</strong> - <strong>16</strong>) = <strong>16</strong>。</p>
        </article>
      </section>

      <section class="damage-section">
        <h4>总伤害案例</h4>
        <div class="total-example-grid">
          <article>
            <h5>平地：长戟兵攻击游侠</h5>
            <dl class="compact-list">
              <dt>基础伤害</dt><dd>max(0, <strong>6</strong> 近战攻击 - <strong>2</strong> 近战护甲) = <strong>4</strong></dd>
              <dt>标签伤害</dt><dd>max(0, <strong>32</strong> 骑乘单位 - <strong>0</strong> 骑乘单位护甲) = <strong>32</strong></dd>
              <dt>地形倍率</dt><dd><strong>1.00</strong></dd>
              <dt>最终伤害</dt><dd>(<strong>4</strong> + <strong>32</strong>) × <strong>1.00</strong> = <strong>36</strong></dd>
            </dl>
          </article>
          <article>
            <h5>高地：鞑靼骑射手攻击孟加拉长戟兵</h5>
            <dl class="compact-list">
              <dt>基础伤害</dt><dd>max(0, <strong>6</strong> 远程攻击 - <strong>0</strong> 远程护甲) = <strong>6</strong></dd>
              <dt>标签伤害</dt><dd>max(0, <strong>2</strong> 枪兵标签 - <strong>0</strong> 枪兵护甲) = <strong>2</strong></dd>
              <dt>地形倍率</dt><dd><strong>1.25 + 0.25 = 1.50</strong></dd>
              <dt>最终伤害</dt><dd>(<strong>6</strong> + <strong>2</strong>) × <strong>1.50</strong> = <strong>12</strong></dd>
            </dl>
          </article>
        </div>
      </section>

      <section class="damage-section">
        <h4>特殊加减伤计算</h4>
        <div class="modifier-grid">
          <article>
            <h5>地形高差</h5>
            <dl class="compact-list">
              <dt>高地打低地</dt><dd><strong>加减伤最终倍率 = 1.25</strong></dd>
              <dt>低地打高地</dt><dd><strong>加减伤最终倍率 = 0.75</strong></dd>
              <dt>鞑靼高地加伤</dt><dd><strong>1.25 + 0.25 = 1.50</strong></dd>
              <dt>格鲁吉亚高地减伤</dt><dd><strong>0.75 - 0.15 = 0.60</strong></dd>
            </dl>
          </article>
          <article>
            <h5>文明与科技</h5>
            <ul>
              <li><strong>西西里</strong>陆地军事单位受到的<strong>标签伤害</strong>减少 <strong>40%</strong>；<strong>攻城武器</strong>不享受。</li>
              <li><strong>孟加拉</strong>象兵单位受到的<strong>标签伤害</strong>减少 <strong>25%</strong>。</li>
              <li><strong>波斯</strong>研究<strong>堡垒</strong>后，<strong>城堡</strong>受到的<strong>标签伤害</strong>减少 <strong>25%</strong>。</li>
              <li><strong>攻城技师</strong>：多数<strong>攻城武器</strong>对建筑伤害 <strong>+20%</strong>，部分攻城武器射程 <strong>+1</strong>。</li>
              <li><strong>预热射击</strong>：<strong>塔类建筑</strong>对船只伤害 <strong>+125%</strong>；<strong>城堡</strong>、<strong>营垒</strong>、<strong>港口</strong>、<strong>码头</strong>、<strong>强化教堂</strong>对船只 <strong>+4 攻击</strong>。</li>
              <li><strong>乌兹钢</strong>：<strong>达罗毗荼</strong>步兵和骑兵攻击无视护甲。</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="damage-section">
        <h4>特殊单位伤害</h4>
        <div class="special-grid">
          <article>
            <h5>射偏、攻击地面、副箭</h5>
            <ul>
              <li><strong>缅甸：飞镖骑兵</strong>射偏命中非原目标造成 <strong>100%</strong> 伤害；普通版 <strong>12 远程攻击</strong>，精锐版 <strong>14 远程攻击</strong>。</li>
              <li><strong>葡萄牙：风琴炮</strong>射偏命中非原目标造成 <strong>100%</strong> 伤害；普通版 <strong>6 远程攻击 ×5</strong>，精锐版 <strong>8 远程攻击 ×6</strong>。</li>
              <li><strong>波西米亚：胡斯派战车</strong>普通版主弹 <strong>10 远程攻击</strong>，副弹 <strong>4 远程攻击 ×5</strong>；精锐版主弹 <strong>13 远程攻击</strong>，副弹 <strong>6 远程攻击 ×5</strong>；身后单位受到经过战车弹体的伤害减少 <strong>50%</strong>。</li>
              <li><strong>中国：诸葛弩</strong>普通版主箭 <strong>8 远程攻击</strong>，副箭 <strong>3 远程攻击 ×2</strong>；精锐版主箭 <strong>10 远程攻击</strong>，副箭 <strong>3 远程攻击 ×4</strong>。</li>
              <li><strong>库曼：钦察</strong>普通版主箭 <strong>4 远程攻击</strong>，副箭 <strong>3 远程攻击 ×2</strong>；精锐版主箭 <strong>5 远程攻击</strong>，副箭 <strong>3 远程攻击 ×3</strong>。</li>
              <li><strong>投石车系</strong>主伤害按<strong>基础近战</strong>结算；副弹命中时造成最低 <strong>1</strong> 点伤害。轻型投石车副弹 <strong>5</strong>，中型投石车副弹 <strong>7</strong>，重型投石车副弹 <strong>9</strong>。</li>
            </ul>
          </article>
          <article>
            <h5>蓄力伤害</h5>
            <ul>
              <li><strong>勃艮第：马上轻装兵</strong>普通版蓄力攻击额外 <strong>+20</strong> 攻击；精锐版额外 <strong>+25</strong> 攻击；蓄力攻击不作用于建筑。</li>
              <li><strong>达罗毗荼：乌鲁米剑士</strong>普通版蓄力攻击额外 <strong>+12</strong> 攻击，<strong>24 秒</strong>充能。</li>
              <li><strong>达罗毗荼：精锐乌鲁米剑士</strong>蓄力攻击额外 <strong>+15</strong> 攻击，<strong>20 秒</strong>充能；蓄力攻击造成 <strong>50%</strong> 践踏/范围伤害。</li>
            </ul>
          </article>
          <article>
            <h5>践踏伤害</h5>
            <div class="mini-formula">
              <code>践踏伤害 = max(1, (攻击 - 护甲) × 践踏比例)</code>
            </div>
            <ul>
              <li><strong>战象系</strong>：践踏比例 <strong>25%</strong>，范围 <strong>0.4 格</strong>。</li>
              <li><strong>波斯：战象</strong>：践踏比例 <strong>50%</strong>，范围 <strong>0.5 格</strong>。</li>
              <li><strong>攻城象系</strong>：践踏比例 <strong>33%</strong>，范围 <strong>1.5 格</strong>。</li>
              <li><strong>波兰：翼骑兵，研究列赫遗产后</strong>：践踏比例 <strong>33%</strong>，范围 <strong>0.5 格</strong>。</li>
              <li><strong>拜占庭：甲胄骑兵，研究后勤学后</strong>：固定 <strong>5</strong> 点践踏伤害，无视护甲，范围 <strong>0.5 格</strong>。</li>
              <li><strong>斯拉夫：步兵，研究德鲁日纳后</strong>：固定 <strong>5</strong> 点践踏伤害，无视护甲，范围 <strong>0.5 格</strong>。</li>
            </ul>
          </article>
        </div>
      </section>
    </article>
  `;
  bindCounterAtlas();
  bindDamageCalculator();
}

function basicKnowledgeReadyChapters() {
  const chapters = basicKnowledgeData.chapters || [];
  const readyChapters = chapters.filter((chapter) => chapter.status === "ready" && (chapter.sections || []).length);
  return readyChapters.length ? readyChapters : chapters.slice(0, 1);
}

function basicChapterNumber(index) {
  return ["第一章", "第二章", "第三章", "第四章", "第五章", "第六章"][index] || `第${index + 1}章`;
}

function basicTocMarkup() {
  const chapters = basicKnowledgeData.chapters || [];
  return `
    <aside class="basic-toc" aria-label="基础知识目录">
      <div class="basic-toc-title">基础知识</div>
      <nav class="basic-toc-chapters">
        ${chapters.map((item) => {
          const sections = item.sections || [];
          const isReady = item.status === "ready" && sections.length;
          return `
            <details class="basic-toc-group${isReady ? " ready" : ""}" ${isReady ? "open" : ""}>
              <summary>${escapeHTML(item.title)}</summary>
              <div class="basic-toc-section-links">
                ${sections.length
                  ? sections.map((section, index) => `
                    <a href="#${escapeHTML(section.id)}">${escapeHTML(index + 1)}. ${escapeHTML(section.title)}</a>
                  `).join("")
                  : `<span title="${escapeHTML(item.summary || "后续整理")}">后续整理</span>`}
              </div>
            </details>
          `;
        }).join("")}
      </nav>
    </aside>
  `;
}

function basicTimelineMarkup(section) {
  return `
    <div class="basic-timeline" aria-label="${escapeHTML(section.title)}">
      ${(section.items || []).map((item) => {
        const timelineBackground = item.image?.startsWith("assets/") ? `../${item.image}` : item.image;
        return `
          <article class="basic-timeline-item">
            ${item.image ? `
              <figure class="basic-timeline-image${item.imageFit === "contain" ? " fit-contain" : ""}" style="--timeline-bg: url('${escapeHTML(timelineBackground)}')">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.imageAlt || item.name)}" loading="eager" referrerpolicy="no-referrer">
              </figure>
            ` : ""}
            <time>${escapeHTML(item.time)}</time>
            <h4>${escapeHTML(item.name)}</h4>
            <p>${escapeHTML(item.text)}</p>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function basicVersionsMarkup(section) {
  return `
    <div class="basic-alias-list" aria-label="玩家常用说法">
      ${(section.aliases || []).map((alias) => `
        <p><strong>${escapeHTML(alias.name)}</strong>：${escapeHTML(alias.means)}</p>
      `).join("")}
    </div>
    <div class="basic-version-list">
      ${(section.versions || []).map((version) => `
        <article class="basic-version-row">
          <div>
            <time>${escapeHTML(version.time)}</time>
            <strong>${escapeHTML(version.alias)}</strong>
          </div>
          <div>
            <h4>${escapeHTML(version.name)}</h4>
            <p>${escapeHTML(version.content)}</p>
          </div>
        </article>
      `).join("")}
    </div>
    <div class="basic-dlc-wrap">
      <table class="basic-dlc-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>扩展内容</th>
            <th>新增民族</th>
            <th>新增战役</th>
          </tr>
        </thead>
        <tbody>
          ${(section.dlcs || []).map((dlc) => `
            <tr>
              <td>${escapeHTML(dlc.time)}</td>
              <td>${escapeHTML(dlc.name)}</td>
              <td>${escapeHTML(dlc.civs)}</td>
              <td>${escapeHTML(dlc.campaigns)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function basicIntroMarkup(section) {
  return section.introText ? `<p class="basic-section-intro">${escapeHTML(section.introText)}</p>` : "";
}

function basicRowsMarkup(items) {
  return `
    <div class="basic-reference-rows">
      ${(items || []).map((item) => `
        <article${item.id ? ` id="${escapeHTML(item.id)}"` : ""} class="basic-reference-row">
          <h4>${escapeHTML(item.label || item.title)}</h4>
          <p>${escapeHTML(item.text)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function basicGlossaryMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="basic-glossary-list">
      ${(section.terms || []).map((term) => `
        <article class="basic-glossary-row" id="${escapeHTML(term.id || "")}">
          <header>
            <h4>${escapeHTML(term.zh)}</h4>
            <span lang="en">${escapeHTML(term.en)}</span>
            ${term.aliases ? `<small><strong>常见写法</strong>${escapeHTML(term.aliases)}</small>` : ""}
          </header>
          <p>${escapeHTML(term.text)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function basicFeatureLinkMarkup(link) {
  if (!link) return "";
  const civMode = link.view === "civilizations" ? ` data-civ-mode-target="techtree"` : "";
  return `
    <div class="basic-feature-link">
      <p>${escapeHTML(link.text)}</p>
      <button type="button" data-view="${escapeHTML(link.view)}"${civMode}>${escapeHTML(link.label)}</button>
    </div>
  `;
}

function basicTaggedModesMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="basic-mode-groups">
      ${(section.groups || []).map((group) => `
        <section class="basic-mode-group">
          <h4>${escapeHTML(group.title)}</h4>
          <div class="basic-mode-list">
            ${(group.modes || []).map((mode) => `
              <article class="basic-mode-row" id="${escapeHTML(mode.id || "")}">
                <span>${escapeHTML(mode.tag)}</span>
                <div>
                  <h5>${escapeHTML(mode.title)}</h5>
                  <p>${escapeHTML(mode.detail)}</p>
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function basicResourceSystemMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="basic-resource-table" role="table" aria-label="四种资源">
      ${(section.resources || []).map((resource) => `
        <article class="basic-resource-row" id="${escapeHTML(resource.id || "")}" role="row">
          <h4 role="cell">${escapeHTML(resource.name)}</h4>
          <p role="cell"><strong>主要来源</strong>${escapeHTML(resource.source)}</p>
          <p role="cell"><strong>主要用途</strong>${escapeHTML(resource.use)}</p>
        </article>
      `).join("")}
    </div>
    <h4 class="basic-subhead">人口与生产</h4>
    ${basicRowsMarkup(section.population)}
    ${basicFeatureLinkMarkup(section.link)}
  `;
}

function basicAgesMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="basic-age-list">
      ${(section.ages || []).map((age) => `
        <article class="basic-age-row" id="${escapeHTML(age.id || "")}">
          <header>
            <h4>${escapeHTML(age.name)}</h4>
            <strong>${escapeHTML(age.role)}</strong>
          </header>
          <p>${escapeHTML(age.detail)}</p>
          ${(age.routes || []).length ? `
            <div class="basic-route-list">
              ${(age.routes || []).map((route) => `
                <div>
                  <span>${escapeHTML(route.label)}</span>
                  <p>${escapeHTML(route.text)}</p>
                </div>
              `).join("")}
            </div>
          ` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function basicBuildingSystemMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    ${basicRowsMarkup(section.groups)}
    <h4 class="basic-subhead">建筑解锁关系</h4>
    <div class="basic-unlock-list">
      ${(section.unlocks || []).map((unlock) => `
        <article class="basic-unlock-row">
          <div><strong>${escapeHTML(unlock.from)}</strong><span aria-hidden="true">→</span><strong>${escapeHTML(unlock.to)}</strong></div>
          <p>${escapeHTML(unlock.note)}</p>
        </article>
      `).join("")}
    </div>
    <p class="basic-rule-note"><strong>推进时代：</strong>${escapeHTML(section.ageUp || "")}</p>
  `;
}

function basicUnitSystemMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    ${basicRowsMarkup(section.groups)}
    <h4 class="basic-subhead">读懂单位面板</h4>
    ${basicRowsMarkup(section.attributes)}
    ${basicFeatureLinkMarkup(section.link)}
  `;
}

function basicCivilizationSystemMarkup(section) {
  return `
    ${(section.body || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}
    ${basicRowsMarkup(section.differences)}
    ${basicFeatureLinkMarkup(section.link)}
  `;
}

function basicMapGuideMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <h4 class="basic-subhead">基本地图类型</h4>
    <div class="basic-map-type-list">
      ${(section.mapTypes || []).map((type) => `
        <article id="${escapeHTML(type.id || "")}">
          <span>${escapeHTML(type.name)}</span>
          <p>${escapeHTML(type.text)}</p>
        </article>
      `).join("")}
    </div>
    <h4 class="basic-subhead">常见地图</h4>
    <div class="basic-map-list">
      ${(section.maps || []).map((map) => `
        <article class="basic-map-row" id="${escapeHTML(map.id || "")}">
          <header>
            <h4>${escapeHTML(map.name)}</h4>
            <span>${escapeHTML(map.type)}</span>
          </header>
          <p class="basic-map-official"><strong>地图介绍</strong>${escapeHTML(map.official)}</p>
          <p><strong>基本思路</strong>${escapeHTML(map.understanding)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function basicSectionBodyMarkup(section) {
  if (section.type === "timeline") return basicTimelineMarkup(section);
  if (section.type === "versions") return basicVersionsMarkup(section);
  if (section.type === "labeled_list") return `${basicIntroMarkup(section)}${basicRowsMarkup(section.items)}`;
  if (section.type === "tagged_modes") return basicTaggedModesMarkup(section);
  if (section.type === "resource_system") return basicResourceSystemMarkup(section);
  if (section.type === "ages") return basicAgesMarkup(section);
  if (section.type === "building_system") return basicBuildingSystemMarkup(section);
  if (section.type === "unit_system") return basicUnitSystemMarkup(section);
  if (section.type === "civilization_system") return basicCivilizationSystemMarkup(section);
  if (section.type === "map_guide") return basicMapGuideMarkup(section);
  if (section.type === "glossary") return basicGlossaryMarkup(section);
  const prose = (section.body || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
  const analysis = section.aoe2Analysis;
  if (!analysis || !(analysis.points || []).length) return prose;

  return `
    ${prose}
    <div class="basic-game-analysis">
      <h4>${escapeHTML(analysis.title || "放到帝国时代 II 里看")}</h4>
      <ul>
        ${(analysis.points || []).map((point) => `
          <li id="${escapeHTML(point.id || "")}">
            <strong>${escapeHTML(point.takeaway)}</strong>
            <p>${escapeHTML(point.detail)}</p>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function basicSectionMarkup(section, index) {
  return `
    <section class="basic-section" id="${escapeHTML(section.id)}">
      <h3>${escapeHTML(index + 1)}. ${escapeHTML(section.title)}</h3>
      ${basicSectionBodyMarkup(section)}
    </section>
  `;
}

function basicChapterMarkup(chapter, index) {
  const titleId = index === 0 ? ` id="buildsTitle"` : "";
  return `
    <section class="basic-chapter"${chapter.id ? ` id="${escapeHTML(chapter.id)}"` : ""}>
      <header class="basic-head">
        <span>${escapeHTML(basicChapterNumber(index))}</span>
        <h2${titleId}>${escapeHTML(chapter.title)}</h2>
        ${chapter.intro ? `<p class="basic-lead">${escapeHTML(chapter.intro)}</p>` : ""}
        ${chapter.notice ? `<p class="basic-notice">${escapeHTML(chapter.notice)}</p>` : ""}
      </header>
      ${(chapter.sections || []).map((section, sectionIndex) => basicSectionMarkup(section, sectionIndex)).join("")}
    </section>
  `;
}

function renderBasicKnowledge() {
  const target = document.querySelector("#basicKnowledgeRoot");
  if (!target) return;
  const chapters = basicKnowledgeReadyChapters();
  if (!chapters.length) {
    target.innerHTML = `<p class="basic-empty">基础知识正在整理。</p>`;
    return;
  }

  target.innerHTML = `
    ${basicTocMarkup()}
    <article class="basic-article">
      <figure class="basic-hero">
        <img src="${escapeHTML(basicKnowledgeData.heroImage || "")}" alt="Age of Empires II: Definitive Edition">
      </figure>
      ${chapters.map((chapter, index) => basicChapterMarkup(chapter, index)).join("")}
    </article>
  `;
}

function playerEcologyTocMarkup() {
  return `
    <aside class="basic-toc ecology-toc" aria-label="玩家生态目录">
      <div class="basic-toc-title">玩家生态</div>
      <nav class="ecology-toc-links">
        ${(playerEcologyData.sections || []).map((section, index) => `
          <a href="#${escapeHTML(section.id)}">${escapeHTML(index + 1)}. ${escapeHTML(section.title)}</a>
        `).join("")}
      </nav>
    </aside>
  `;
}

function playerEcologyRowsMarkup(items, className = "ecology-reference-rows") {
  return `
    <div class="${escapeHTML(className)}">
      ${(items || []).map((item) => `
        <article class="basic-reference-row ecology-reference-row"${item.id ? ` id="${escapeHTML(item.id)}"` : ""}>
          <h4>${escapeHTML(item.label || item.title || item.name)}</h4>
          <p>${escapeHTML(item.text)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function playerEcologyLinksMarkup(links, className = "") {
  if (!(links || []).length) return "";
  const classNames = ["ecology-link-list", className].filter(Boolean).join(" ");
  return `
    <ul class="${escapeHTML(classNames)}">
      ${links.map((link) => `
        <li>
          <a href="${escapeHTML(link.url || "#")}" target="_blank" rel="noopener noreferrer">
            <strong>${escapeHTML(link.label || link.name)}</strong>
            ${link.platform ? `<span>${escapeHTML(link.platform)}</span>` : ""}
          </a>
          ${link.note ? `<p>${escapeHTML(link.note)}</p>` : ""}
        </li>
      `).join("")}
    </ul>
  `;
}

function playerEcologySkillBandsMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="ecology-skill-list">
      ${(section.bands || []).map((band) => `
        <article class="ecology-skill-row" id="${escapeHTML(band.id || "")}">
          <header>
            <div>
              <h4>${escapeHTML(band.name)}</h4>
              <span>${escapeHTML(band.rating)}</span>
            </div>
            <strong>${escapeHTML(band.summary)}</strong>
          </header>
          <div class="ecology-skill-detail">
            <div class="ecology-skill-field">
              <b>已经掌握</b>
              <p>${escapeHTML(band.mastered)}</p>
            </div>
            <div class="ecology-skill-field">
              <b>主要瓶颈</b>
              <p>${escapeHTML(band.bottleneck)}</p>
            </div>
          </div>
          ${(band.recommendations || []).length ? `
            <div class="ecology-skill-recommendations">
              <h5>观看参考</h5>
              ${playerEcologyLinksMarkup(band.recommendations, "ecology-link-list-compact")}
            </div>
          ` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function playerEcologyCommunityMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="ecology-community-list">
      ${(section.groups || []).map((group) => `
        <article class="basic-reference-row ecology-reference-row" id="${escapeHTML(group.id || "")}">
          <h4>${escapeHTML(group.title)}</h4>
          <div class="ecology-row-content">
            <p>${escapeHTML(group.text)}</p>
            ${playerEcologyLinksMarkup(group.links)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function playerEcologyCreatorsMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="ecology-creator-list">
      ${(section.groups || []).map((group) => `
        <article class="ecology-creator-row" id="${escapeHTML(group.id || "")}">
          <h4>${escapeHTML(group.title)}</h4>
          <div>
            <p><strong>主要内容</strong>${escapeHTML(group.purpose)}</p>
            <p><strong>适合观看</strong>${escapeHTML(group.suitableFor)}</p>
            ${playerEcologyLinksMarkup(group.links)}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function playerEcologyTournamentsMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="ecology-event-list">
      ${(section.series || []).map((event) => `
        <article class="ecology-event-row" id="${escapeHTML(event.id || "")}">
          <header>
            <a href="${escapeHTML(event.url || "#")}" target="_blank" rel="noopener noreferrer">
              <h4>${escapeHTML(event.name)}</h4>
            </a>
            <span>${escapeHTML(event.tag)}</span>
          </header>
          <div class="ecology-event-content">
            <p><strong>主办与定位</strong>${escapeHTML(event.organizer)}</p>
            <p><strong>比赛形式</strong>${escapeHTML(event.format)}</p>
            <p>${escapeHTML(event.text)}</p>
            <a class="ecology-text-link" href="${escapeHTML(event.url || "#")}" target="_blank" rel="noopener noreferrer">查看赛事资料</a>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function playerEcologyPeopleMarkup(section) {
  return `
    ${basicIntroMarkup(section)}
    <div class="ecology-people-groups">
      ${(section.groups || []).map((group) => `
        <section class="ecology-people-group">
          <h4>${escapeHTML(group.title)}</h4>
          <div>
            ${(group.people || []).map((person) => `
              <article class="ecology-person-row" id="${escapeHTML(person.id || "")}">
                <header>
                  ${(person.links || []).length ? `
                    <a href="${escapeHTML(person.links[0].url || "#")}" target="_blank" rel="noopener noreferrer">
                      <h5>${escapeHTML(person.name)}</h5>
                    </a>
                  ` : `<h5>${escapeHTML(person.name)}</h5>`}
                  <span>${escapeHTML(person.region)}</span>
                </header>
                <div>
                  <p class="ecology-person-meta"><strong>${escapeHTML(person.identity)}</strong><span>${escapeHTML(person.status)}</span></p>
                  <p>${escapeHTML(person.detail)}</p>
                  ${playerEcologyLinksMarkup(person.links, "ecology-link-list-compact ecology-person-links")}
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function playerEcologySectionBodyMarkup(section) {
  if (section.type === "skill_bands") return playerEcologySkillBandsMarkup(section);
  if (section.type === "community") return playerEcologyCommunityMarkup(section);
  if (section.type === "creator_types") return playerEcologyCreatorsMarkup(section);
  if (section.type === "tournaments") return playerEcologyTournamentsMarkup(section);
  if (section.type === "people") return playerEcologyPeopleMarkup(section);
  return `
    ${basicIntroMarkup(section)}
    ${section.stance ? `<aside class="ecology-stance"><strong>本站态度</strong><p>${escapeHTML(section.stance)}</p></aside>` : ""}
    ${playerEcologyRowsMarkup(section.items)}
  `;
}

function renderPlayerEcology() {
  const target = document.querySelector("#playerEcologyRoot");
  if (!target) return;
  const sections = playerEcologyData.sections || [];
  if (!sections.length) {
    target.innerHTML = `<p class="basic-empty">玩家生态正在整理。</p>`;
    return;
  }

  target.innerHTML = `
    ${playerEcologyTocMarkup()}
    <article class="basic-article ecology-article">
      <figure class="basic-hero ecology-hero">
        <img src="${escapeHTML(playerEcologyData.heroImage || "")}" alt="${escapeHTML(playerEcologyData.heroAlt || playerEcologyData.title)}">
      </figure>
      <header class="basic-head ecology-head">
        <span>板块导读</span>
        <h2 id="mistakesTitle">${escapeHTML(playerEcologyData.title)}</h2>
        <p class="basic-lead">${escapeHTML(playerEcologyData.intro || "")}</p>
        <p class="basic-notice">${escapeHTML(playerEcologyData.notice || "")}</p>
      </header>
      ${sections.map((section, index) => `
        <section class="basic-section ecology-section" id="${escapeHTML(section.id)}">
          <h3>${escapeHTML(index + 1)}. ${escapeHTML(section.title)}</h3>
          ${playerEcologySectionBodyMarkup(section)}
        </section>
      `).join("")}
    </article>
  `;
}

function renderOperations() {
  document.querySelector("#operationGrid").innerHTML = `
    <article class="operation-card">
      <div class="video-slot">对话助手</div>
      <span class="badge">问答</span>
      <h3>游戏问题随手问</h3>
      <p>后续围绕本站资料回答文明、兵种、经济和对局理解问题。</p>
    </article>
    <article class="operation-card">
      <div class="video-slot">模拟考试</div>
      <span class="badge">练习</span>
      <h3>问答题模拟</h3>
      <p>后续用选择题和问答题检查基础知识、克制关系和经济理解。</p>
    </article>
    <article class="operation-card">
      <div class="video-slot">斗蛐蛐</div>
      <span class="badge">娱乐</span>
      <h3>网页斗蛐蛐</h3>
      <p>后续做成可观看、可调参的单位对战小剧场。</p>
    </article>
  `;
}

const economyCategoryNames = ["全部", "兵营", "靶场", "马厩", "攻城武器厂", "城堡", "修道院", "码头", "其他"];
const economyResourceLabels = { food: "食物", wood: "木材", gold: "黄金", stone: "石头" };
const economyBaseRates = {
  food: { label: "农田村民", perMinute: 18, note: "按农田规划值" },
  wood: { label: "伐木村民", perMinute: 21, note: "按常规伐木场距离" },
  gold: { label: "采金村民", perMinute: 21.6, note: "按采金营地附近金矿" },
  stone: { label: "采石村民", perMinute: 20.4, note: "按采石营地附近石矿" }
};
const economyTechOptions = {
  tc: [
    { value: "none", label: "无轮轴系", multipliers: { food: 1, wood: 1, gold: 1, stone: 1 } },
    { value: "wheelbarrow", label: "轮轴", multipliers: { food: 1.12, wood: 1.03, gold: 1.015, stone: 1.015 } },
    { value: "handcart", label: "轮轴 + 手推车", multipliers: { food: 1.2, wood: 1.06, gold: 1.03, stone: 1.03 } }
  ],
  food: [
    { value: "none", label: "基础农田", multiplier: 1 },
    { value: "heavyPlow", label: "重犁", multiplier: 1.03 }
  ],
  wood: [
    { value: "none", label: "无伐木科技", multiplier: 1 },
    { value: "doubleBitAxe", label: "双刃斧", multiplier: 1.2 },
    { value: "bowSaw", label: "弓锯", multiplier: 1.44 },
    { value: "twoManSaw", label: "双人锯", multiplier: 1.58 }
  ],
  gold: [
    { value: "none", label: "无采金科技", multiplier: 1 },
    { value: "goldMining", label: "采金技术", multiplier: 1.15 },
    { value: "goldShaftMining", label: "深井采金", multiplier: 1.32 }
  ],
  stone: [
    { value: "none", label: "无采石科技", multiplier: 1 },
    { value: "stoneMining", label: "采石技术", multiplier: 1.15 },
    { value: "stoneShaftMining", label: "深井采石", multiplier: 1.32 }
  ],
  trade: [
    { value: "none", label: "无商队", speed: 1.25 },
    { value: "caravan", label: "商队", speed: 1.5 }
  ]
};

function economyClamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function economyOption(kind, value) {
  return economyTechOptions[kind].find((item) => item.value === value) || economyTechOptions[kind][0];
}

function economyRate(resource) {
  const rate = economyBaseRates[resource].perMinute;
  const techKey = `${resource}Tech`;
  const resourceMultiplier = economyOption(resource, economyState[techKey]).multiplier;
  const tcMultiplier = economyOption("tc", economyState.tcTech).multipliers?.[resource] || 1;
  return rate * resourceMultiplier * tcMultiplier;
}

function economyFormat(value, digits = 0) {
  if (!Number.isFinite(value)) return "0";
  return Number(value.toFixed(digits)).toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function economyParseSeconds(value) {
  const match = String(value || "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function economyParseCost(value) {
  const result = { food: 0, wood: 0, gold: 0, stone: 0 };
  const labels = { 食物: "food", 木材: "wood", 黄金: "gold", 石头: "stone" };
  String(value || "").replace(/(食物|木材|黄金|石头)\s*([\d.]+)/g, (_, label, amount) => {
    result[labels[label]] += Number(amount) || 0;
    return "";
  });
  return result;
}

function economyUnitEntities() {
  return (counterData.entities || [])
    .filter((entity) => entity?.nodeType === "unit")
    .filter((entity) => economyParseSeconds(entity?.stats?.time) > 0)
    .filter((entity) => Object.values(economyParseCost(entity?.stats?.cost)).some((value) => value > 0));
}

function economyDefaultUnitId() {
  const units = economyUnitEntities();
  return units.find((entity) => normalizeSearchText(counterEntityName(entity)) === normalizeSearchText("骑士"))?.id
    || units.find((entity) => normalizeSearchText(counterEntityName(entity)).includes(normalizeSearchText("步弓手")))?.id
    || units[0]?.id
    || "";
}

function economySelectedUnit() {
  if (!economyState.selectedId) economyState.selectedId = economyDefaultUnitId();
  const units = economyUnitEntities();
  return units.find((entity) => entity.id === economyState.selectedId) || units[0] || null;
}

function economyCategories() {
  const units = economyUnitEntities();
  return economyCategoryNames.map((name) => ({
    name,
    count: name === "全部"
      ? units.length
      : units.filter((entity) => counterEntityProductionCategory(entity) === name).length
  }));
}

function economyFilteredUnits() {
  const query = normalizeSearchText(economyState.query);
  return economyUnitEntities()
    .filter((entity) => economyState.category === "全部" || counterEntityProductionCategory(entity) === economyState.category)
    .filter((entity) => !query || counterSearchText(entity).includes(query));
}

function economyCategoryTabsMarkup() {
  return `
    <div class="economy-category-tabs" aria-label="单位分类">
      ${economyCategories().map((category) => `
        <button type="button" class="economy-category-button" data-economy-category="${escapeHTML(category.name)}" aria-pressed="${String(economyState.category === category.name)}">
          ${escapeHTML(category.name)}
        </button>
      `).join("")}
    </div>
  `;
}

function economyUnitListMarkup() {
  const selected = economySelectedUnit();
  const units = economyFilteredUnits();
  if (!units.length) return `<p class="economy-empty">没有匹配单位</p>`;
  return units.map((entity) => `
    <button type="button" class="economy-unit-item" data-economy-select="${escapeHTML(entity.id)}" aria-selected="${String(selected?.id === entity.id)}">
      ${entity.image ? `<img src="${escapeHTML(entity.image)}" alt="">` : `<span class="counter-fallback-icon"></span>`}
      <span>
        <strong>${escapeHTML(counterEntityName(entity))}</strong>
        <small>${escapeHTML(counterEntityProductionCategory(entity))} · ${escapeHTML(entity.ageName || "")} · ${escapeHTML(entity.stats?.cost || "")}</small>
      </span>
    </button>
  `).join("");
}

function economyUnitSummaryMarkup(unit) {
  if (!unit) return `<p class="economy-empty">请选择一个单位</p>`;
  return `
    <div class="economy-unit-summary" aria-label="当前选择的单位">
      <div class="economy-unit-thumb">
        ${unit.image ? `<img src="${escapeHTML(unit.image)}" alt="">` : ""}
      </div>
      <div class="economy-unit-summary-main">
        <span class="economy-unit-summary-kicker">当前选择 · ${escapeHTML(counterEntityProductionCategory(unit))} · ${escapeHTML(unit.ageName || "")}</span>
        <h4>${escapeHTML(counterEntityName(unit))}</h4>
        <p>${escapeHTML(unit.stats?.cost || "无成本")} · ${escapeHTML(unit.stats?.time || "无训练时间")}</p>
      </div>
    </div>
  `;
}

function economySelectMarkup(id, label, options, value, field) {
  return `
    <label class="economy-field" for="${escapeHTML(id)}">
      <span>${escapeHTML(label)}</span>
      <select id="${escapeHTML(id)}" data-economy-field="${escapeHTML(field)}">
        ${options.map((option) => `<option value="${escapeHTML(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHTML(option.label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function economySettingsMarkup() {
  const goldIsTrade = economyState.goldSource === "trade";
  return `
    <article class="economy-card economy-settings">
      <h3>生产条件</h3>
      <div class="economy-setting-grid">
        <label class="economy-field" for="economyBuildingCount">
          <span>生产建筑数量</span>
          <input id="economyBuildingCount" data-economy-field="buildingCount" type="number" min="1" max="12" value="${escapeHTML(economyState.buildingCount)}">
        </label>
        ${economySelectMarkup("economyTcTech", "城镇中心科技", economyTechOptions.tc, economyState.tcTech, "tcTech")}
        ${economySelectMarkup("economyFoodTech", "农田加成", economyTechOptions.food, economyState.foodTech, "foodTech")}
        ${economySelectMarkup("economyWoodTech", "伐木科技", economyTechOptions.wood, economyState.woodTech, "woodTech")}
        ${economySelectMarkup("economyStoneTech", "采石科技", economyTechOptions.stone, economyState.stoneTech, "stoneTech")}
        <label class="economy-field" for="economyGoldSource">
          <span>黄金来源</span>
          <select id="economyGoldSource" data-economy-field="goldSource">
            <option value="miners" ${economyState.goldSource === "miners" ? "selected" : ""}>采金农民</option>
            <option value="trade" ${economyState.goldSource === "trade" ? "selected" : ""}>贸易车</option>
          </select>
        </label>
        ${goldIsTrade
          ? `
            ${economySelectMarkup("economyTradeTech", "贸易速度", economyTechOptions.trade, economyState.tradeTech, "tradeTech")}
            <label class="economy-field" for="economyTradeGold">
              <span>单次贸易黄金</span>
              <input id="economyTradeGold" data-economy-field="tradeGold" type="number" min="1" max="200" value="${escapeHTML(economyState.tradeGold)}">
            </label>
            <label class="economy-field" for="economyTradeDistance">
              <span>市场直线距离</span>
              <input id="economyTradeDistance" data-economy-field="tradeDistance" type="number" min="10" max="240" value="${escapeHTML(economyState.tradeDistance)}">
            </label>
          `
          : economySelectMarkup("economyGoldTech", "采金科技", economyTechOptions.gold, economyState.goldTech, "goldTech")}
      </div>
    </article>
  `;
}

function calculateEconomy() {
  const unit = economySelectedUnit();
  const count = economyClamp(economyState.buildingCount, 1, 12, 1);
  economyState.buildingCount = count;
  const time = Math.max(1, economyParseSeconds(unit?.stats?.time));
  const cost = economyParseCost(unit?.stats?.cost);
  const unitsPerMinute = 60 / time * count;
  const demand = Object.fromEntries(Object.entries(cost).map(([key, value]) => [key, value * unitsPerMinute]));
  const workerRates = {
    food: economyRate("food"),
    wood: economyRate("wood"),
    gold: economyRate("gold"),
    stone: economyRate("stone")
  };
  const tradeOption = economyOption("trade", economyState.tradeTech);
  const tradeDistance = economyClamp(economyState.tradeDistance, 10, 240, 100);
  const tradeGold = economyClamp(economyState.tradeGold, 1, 200, 100);
  economyState.tradeDistance = tradeDistance;
  economyState.tradeGold = tradeGold;
  const tradeGoldPerMinute = tradeGold * 60 / Math.max(1, (2 * tradeDistance) / tradeOption.speed);
  const workers = {
    food: demand.food / workerRates.food,
    wood: demand.wood / workerRates.wood,
    gold: economyState.goldSource === "trade" ? 0 : demand.gold / workerRates.gold,
    stone: demand.stone / workerRates.stone,
    trade: economyState.goldSource === "trade" ? demand.gold / tradeGoldPerMinute : 0
  };

  return { unit, count, cost, time, unitsPerMinute, demand, workerRates, tradeGoldPerMinute, workers };
}

function economyNeedCardMarkup(resource, value) {
  return `
    <div class="economy-need-card">
      <span>${escapeHTML(economyResourceLabels[resource])} / 分钟</span>
      <strong>${escapeHTML(economyFormat(value))}</strong>
    </div>
  `;
}

function economyWorkerCardMarkup(label, count, detail, muted = false) {
  const exact = Number.isFinite(count) ? count : 0;
  const rounded = exact > 0 ? Math.ceil(exact) : 0;
  return `
    <div class="economy-worker-card${muted ? " muted" : ""}">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(rounded)}<small> ${label === "贸易车" ? "辆" : "人"}</small></strong>
      <p>${escapeHTML(detail)} · 精确值 ${escapeHTML(economyFormat(exact, 1))}</p>
    </div>
  `;
}

function economyResultMarkup(result) {
  const unitName = counterEntityName(result.unit);
  const goldCard = economyState.goldSource === "trade"
    ? economyWorkerCardMarkup("贸易车", result.workers.trade, `每辆约 ${economyFormat(result.tradeGoldPerMinute, 1)} 黄金/分钟`)
    : economyWorkerCardMarkup("采金村民", result.workers.gold, `${economyFormat(result.workerRates.gold, 1)} 黄金/人/分钟`);
  return `
    <article class="economy-card economy-result">
      <h3>持续生产分配</h3>
      <div class="economy-result-head">
        <span>${escapeHTML(result.count)} 个生产建筑</span>
        <strong>${escapeHTML(economyFormat(result.unitsPerMinute, 1))} 个 / 分钟</strong>
        <p>持续生产 ${escapeHTML(unitName)}</p>
      </div>
      <div class="economy-need-grid">
        ${economyNeedCardMarkup("food", result.demand.food)}
        ${economyNeedCardMarkup("wood", result.demand.wood)}
        ${economyNeedCardMarkup("gold", result.demand.gold)}
        ${economyNeedCardMarkup("stone", result.demand.stone)}
      </div>
      <div class="economy-worker-grid">
        ${economyWorkerCardMarkup("农田村民", result.workers.food, `${economyFormat(result.workerRates.food, 1)} 食物/人/分钟`)}
        ${economyWorkerCardMarkup("伐木村民", result.workers.wood, `${economyFormat(result.workerRates.wood, 1)} 木材/人/分钟`)}
        ${goldCard}
        ${economyWorkerCardMarkup("采石村民", result.workers.stone, `${economyFormat(result.workerRates.stone, 1)} 石头/人/分钟`)}
      </div>
      <p class="economy-tc-note">单 TC 不断村民额外需要 120 食物/分钟，约 ${escapeHTML(Math.ceil(120 / result.workerRates.food))} 名农田村民。</p>
    </article>
  `;
}

function economyPickerMarkup(result) {
  return `
    <article class="economy-card economy-picker">
      <h3>选择训练单位</h3>
      <label class="economy-search" for="economyUnitSearch">
        <span>搜索单位</span>
        <input id="economyUnitSearch" type="search" autocomplete="off" placeholder="输入单位名" value="${escapeHTML(economyState.query)}">
      </label>
      ${economyCategoryTabsMarkup()}
      <div class="economy-unit-list" id="economyUnitList">
        ${economyUnitListMarkup()}
      </div>
      ${economyUnitSummaryMarkup(result.unit)}
    </article>
  `;
}

function economyLogicMarkup(result) {
  return `
    <section class="economy-guide">
      <article class="economy-guide-card wide">
        <h3>计算逻辑</h3>
        <p>本计算器计算单个或多个生产建筑持续出同一种单位时，每分钟消耗多少资源，再换算成需要多少名村民或多少辆贸易车。食物按农田规划值计算，黄金可切换为采金农民或贸易车，木材、黄金、石头都采用考虑必要移动后的规划效率。城镇中心的轮轴系科技会同时改变农田、伐木、采金和采石效率。</p>
      </article>
      <article class="economy-guide-card">
        <h3>单 TC 不断村民</h3>
        <p>村民 25 秒训练 1 个，单 TC 每分钟需要 120 食物。出食物兵种时，先把这 120 食物预留出来，否则兵没断，村民反而断了。</p>
      </article>
      <article class="economy-guide-card">
        <h3>村民采集速度</h3>
        <ul>
          <li>农田：基础规划值 ${escapeHTML(economyBaseRates.food.perMinute)} 食物/分钟，重犁约 +3%；轮轴约 +12%，轮轴 + 手推车累计约 +20%。</li>
          <li>木材：基础规划值 ${escapeHTML(economyBaseRates.wood.perMinute)} 木材/分钟，双刃斧、弓锯、双人锯按约 +20% / +44% / +58% 折算；轮轴系额外按约 +3% / +6% 折算。</li>
          <li>黄金：基础规划值 ${escapeHTML(economyBaseRates.gold.perMinute)} 黄金/分钟，采金技术、深井采金按约 +15% / +32% 折算；轮轴系额外按约 +1.5% / +3% 折算。</li>
          <li>石头：基础规划值 ${escapeHTML(economyBaseRates.stone.perMinute)} 石头/分钟，采石技术、深井采石按约 +15% / +32% 折算；轮轴系额外按约 +1.5% / +3% 折算。</li>
        </ul>
      </article>
      <article class="economy-guide-card">
        <h3>渔船等价</h3>
        <ul>
          <li>养殖鱼：约 15 食物/分钟，可当作海上农田，但木材成本高，适合长期安全水域。</li>
          <li>深海鱼：约 32 食物/分钟；近海鱼：约 29 食物/分钟，近距离鱼点通常明显强于农田村民。</li>
          <li>牡蛎：约 23 黄金/分钟，估算时可以对照采金村民，不放进当前计算器，避免和陆地经济混在一起。</li>
          <li>刺网会提升渔船采集效率，干船坞和造船匠主要影响船速、成本或生产节奏，不直接等同于村民采集科技。</li>
        </ul>
      </article>
      <article class="economy-guide-card">
        <h3>贸易效率</h3>
        <p>贸易车按单次返回黄金和两市场直线距离估算：单车黄金/分钟 = 单次黄金 × 60 ÷ 往返时间。当前只考虑理想直线距离，不计算安全、寻路、碰撞和市场排队。贸易车基础速度按 1.25，商队后按 1.5，所以会减少同等黄金需求下的车辆数；海上贸易同理按船只往返时间折算。</p>
      </article>
      <article class="economy-guide-card">
        <h3>民族加成</h3>
        <p>采集速度加成应改动村民效率，生产速度加成应改动单位产量。比如不列颠牧羊更快影响黑暗时代食物，法兰克采果更快影响浆果期，蒙古打猎更快影响前期上时代；阿兹特克军事生产更快、哥特兵营更快，则会让同样建筑数量需要更多资源工。</p>
      </article>
      <article class="economy-guide-card wide">
        <h3>常用经济卡片</h3>
        <div class="economy-scenario-grid">
          ${economyScenarioCardsMarkup(result)}
        </div>
      </article>
    </section>
  `;
}

function economyScenarioCardsMarkup(result) {
  const archerRate = 60 / 35 * 2;
  const archerWood = 25 * archerRate;
  const archerGold = 45 * archerRate;
  const knightRate = 60 / 30 * 3;
  const knightFood = 60 * knightRate;
  const knightGold = 75 * knightRate;
  const tcFood = 120;
  const stoneNeed = 650 - 200;
  const castleAgeSeconds = 160;
  const baseStoneVillagers = stoneNeed / (economyBaseRates.stone.perMinute / 60 * castleAgeSeconds);
  const stoneTechVillagers = stoneNeed / (economyBaseRates.stone.perMinute * 1.15 / 60 * castleAgeSeconds);

  return `
    <article class="economy-scenario-card">
      <span>封建时代</span>
      <h4>2 靶场步弓手</h4>
      <p>每分钟约 ${escapeHTML(economyFormat(archerRate, 1))} 个步弓手，需木材 ${escapeHTML(economyFormat(archerWood))}、黄金 ${escapeHTML(economyFormat(archerGold))}。</p>
      <strong>${escapeHTML(Math.ceil(archerWood / economyBaseRates.wood.perMinute))} 伐木 + ${escapeHTML(Math.ceil(archerGold / economyBaseRates.gold.perMinute))} 采金</strong>
    </article>
    <article class="economy-scenario-card">
      <span>城堡时代</span>
      <h4>3 马厩骑士 + 单 TC</h4>
      <p>3 马厩骑士每分钟需食物 ${escapeHTML(economyFormat(knightFood))}、黄金 ${escapeHTML(economyFormat(knightGold))}；不断村民再加 ${escapeHTML(tcFood)} 食物。</p>
      <strong>${escapeHTML(Math.ceil((knightFood + tcFood) / economyBaseRates.food.perMinute))} 农田 + ${escapeHTML(Math.ceil(knightGold / economyBaseRates.gold.perMinute))} 采金</strong>
    </article>
    <article class="economy-scenario-card">
      <span>直城落堡</span>
      <h4>点城堡时代后攒城堡石头</h4>
      <p>从 200 石头到 650 石头，需要补 ${escapeHTML(stoneNeed)} 石头；城堡时代升级时间按 ${escapeHTML(castleAgeSeconds)} 秒估算。</p>
      <strong>无采石约 ${escapeHTML(Math.ceil(baseStoneVillagers))} 人，有采石技术约 ${escapeHTML(Math.ceil(stoneTechVillagers))} 人</strong>
    </article>
  `;
}

function renderEconomyCalculator() {
  const target = document.querySelector("#economyCalculator");
  if (!target) return;
  const result = calculateEconomy();
  target.innerHTML = `
    <section class="economy-calculator-panel" aria-label="持续生产经济计算器">
      <div class="economy-grid">
        ${economyPickerMarkup(result)}
        ${economySettingsMarkup()}
        ${economyResultMarkup(result)}
      </div>
    </section>
    ${economyLogicMarkup(result)}
  `;
}

function bindEconomyCalculator() {
  const target = document.querySelector("#economyCalculator");
  if (!target) return;
  target.addEventListener("input", (event) => {
    const searchInput = event.target.closest("#economyUnitSearch");
    if (searchInput) {
      economyState.query = searchInput.value;
      const list = target.querySelector("#economyUnitList");
      if (list) list.innerHTML = economyUnitListMarkup();
      return;
    }

    const input = event.target.closest("input[data-economy-field]");
    if (!input) return;
    const field = input.dataset.economyField;
    if (field === "buildingCount") {
      economyState.buildingCount = economyClamp(input.value, 1, 12, 1);
    } else if (field === "tradeGold") {
      economyState.tradeGold = economyClamp(input.value, 1, 200, 100);
    } else if (field === "tradeDistance") {
      economyState.tradeDistance = economyClamp(input.value, 10, 240, 100);
    }
    renderEconomyCalculator();
  });

  target.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-economy-field]");
    if (!select) return;
    economyState[select.dataset.economyField] = select.value;
    renderEconomyCalculator();
  });

  target.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("button[data-economy-category]");
    if (categoryButton) {
      economyState.category = categoryButton.dataset.economyCategory || "全部";
      economyState.query = "";
      renderEconomyCalculator();
      return;
    }

    const unitButton = event.target.closest("button[data-economy-select]");
    if (!unitButton) return;
    economyState.selectedId = unitButton.dataset.economySelect;
    economyState.query = "";
    renderEconomyCalculator();
  });
}

function bindNavigation() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (!trigger) return;

    if (trigger.dataset.openCiv) {
      const mode = trigger.dataset.openCivMode || "techtree";
      setCivMode(mode);
      if (mode === "guides") {
        selectGuideCiv(trigger.dataset.openCiv);
      } else {
        selectTechCiv(trigger.dataset.openCiv);
      }
    } else if (trigger.dataset.civModeTarget) {
      setCivMode(trigger.dataset.civModeTarget);
    }

    showView(trigger.dataset.view);

    if (trigger.dataset.basicTarget) {
      const targetId = trigger.dataset.basicTarget;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = document.getElementById(targetId);
          if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
        });
      });
    }

    if (trigger.dataset.ecologyTarget) {
      const targetId = trigger.dataset.ecologyTarget;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = document.getElementById(targetId);
          if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
        });
      });
    }
  });
}

function bindSearch() {
  document.querySelector("#homeSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderSearchResults(document.querySelector("#homeSearchInput").value);
  });
  document.querySelector("#moduleSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderSearchResults(document.querySelector("#moduleSearchInput").value);
  });
}

function init() {
  renderCivModule();
  renderUnits();
  renderBasicKnowledge();
  renderPlayerEcology();
  renderOperations();
  renderEconomyCalculator();
  bindNavigation();
  bindSearch();
  bindEconomyCalculator();
  showView("home");
}

init();
