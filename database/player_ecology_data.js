window.AOE2_PLAYER_ECOLOGY = {
  version: "aoe2de_player_ecology_static_2026_08",
  type: "player_ecology",
  title: "玩家生态",
  heroImage: "assets/aoe2de-intro-hero.png",
  heroAlt: "帝国时代 II：决定版文明主题图",
  intro: "从天梯分段到直播赛场，认识和你一起留在帝国时代 II 里的玩家。",
  notice: "本板块以 1v1 随机地图天梯作为分段参照。黑铁、青铜、中端和高端均为玩家间的非官方说法，分数边界会随平台、时期与社区习惯变化；赛事和人物状态按 2026 年 8 月的静态资料整理。",
  sections: [
    {
      id: "ecology_play_spaces",
      title: "玩家都在玩什么",
      type: "rows",
      introText: "帝国时代 II 的玩家并不都在打排位。有人追求天梯分数，有人反复挑战战役，也有人只看比赛、制作地图或和朋友开娱乐房。先分清玩家身处的玩法，才不会拿一套标准评价所有人。",
      items: [
        {
          id: "ecology_play_campaign",
          label: "战役与单机",
          text: "围绕官方战役、历史战役、对战电脑和自定义难度展开。玩家更关心关卡机制、历史叙事、成就和特定局面的解法，不一定熟悉多人天梯的开局节奏。"
        },
        {
          id: "ecology_play_ranked_1v1",
          label: "1v1 排位",
          text: "最常被用来讨论个人竞技水平的环境。玩家独自承担侦察、经济、出兵和决策，分数变化直接反映一段时间内的胜负结果。"
        },
        {
          id: "ecology_play_team",
          label: "团队排位",
          text: "强调位置分工、沟通、兵种配合和贸易经济。前置、口袋、补位与集火会放大团队理解，团队分数不能直接换算成同水平的 1v1 分数。"
        },
        {
          id: "ecology_play_lobby",
          label: "自定义房间",
          text: "包括黑森林条约局、城堡兵局、外交局、倍速局、场景地图和朋友约战。房名与规则比天梯分数更重要，进入前应先看清地图、人口、资源和胜利条件。"
        },
        {
          id: "ecology_play_coop",
          label: "合作与共斗",
          text: "玩家共同完成合作战役或对抗电脑，重点是分工和体验内容。它适合熟悉单位与地图，也能让不想承受天梯压力的玩家继续享受多人游戏。"
        },
        {
          id: "ecology_play_mods",
          label: "地图与模组",
          text: "场景作者、战役作者、地图脚本作者和模组制作者为游戏持续补充内容。这个圈层评价的是设计、脚本、美术和可玩性，而不是对战分数。"
        },
        {
          id: "ecology_play_spectating",
          label: "直播与观赛",
          text: "不少老玩家投入观看比赛的时间多于亲自排位。看第一视角、赛事解说和复盘，同样会形成稳定的赛事观众与社区讨论。"
        }
      ]
    },
    {
      id: "ecology_ladder_rating",
      title: "天梯分数怎么看",
      type: "rows",
      introText: "Elo 是匹配和记录胜负的工具，不是对一个玩家全部能力的总评分。讨论分段时必须先说明模式，通常默认指 1v1 随机地图天梯。",
      items: [
        {
          id: "ecology_ladder_mode",
          label: "先看队列",
          text: "1v1 随机地图、帝国战争、团队排位和其他队列分别计算。一个玩家可能擅长团队口袋位，却不习惯 1v1 开放图，不能只拿最高的那项分数概括水平。"
        },
        {
          id: "ecology_ladder_sample",
          label: "再看样本",
          text: "刚定级、长期未玩、只打少量场次或刚换平台时，分数与真实水平可能存在偏差。场次增加后，分数才更接近玩家在当前地图池中的稳定表现。"
        },
        {
          id: "ecology_ladder_specialty",
          label: "分数有专长",
          text: "固定文明、偏好封闭图、擅长海图或只练一套战术，都可能让玩家在特定环境中表现更强。能否跨地图和跨文明稳定发挥，是另一层能力。"
        },
        {
          id: "ecology_ladder_tournament",
          label: "比赛另算",
          text: "天梯是一局接一局的日常对战，比赛还包含备战、地图池、文明选取、系列赛调整和临场压力。高分玩家不一定有同等级的赛事成绩，职业成绩也不能只看某一天的天梯名次。"
        }
      ]
    },
    {
      id: "ecology_skill_bands",
      title: "不同分段玩家画像",
      type: "skill_bands",
      introText: "以下区间只是帮助理解对局样貌的常用参照，不是官方段位。玩家在熟悉图、陌生图、单挑和团队局中的表现可能跨越相邻分段。",
      bands: [
        {
          id: "ecology_band_beginner",
          name: "入门与未定级",
          rating: "未定级或约 700 分以下",
          summary: "先让一局游戏完整运转",
          mastered: "正在认识资源、建筑、时代和单位，能够完成采集、造兵与进攻中的一部分操作。",
          bottleneck: "卡人口、城镇中心空闲、村民大量闲置和不知道该出什么兵会反复出现；镜头一转到战场，家里的经济往往同时停下。",
          recommendations: [
            { name: "梦逝影", platform: "哔哩哔哩", url: "https://space.bilibili.com/19804019/", note: "有零基础教学、民族介绍和娱乐解说，适合先建立游戏概念。" }
          ]
        },
        {
          id: "ecology_band_iron",
          name: "黑铁局",
          rating: "常指约 700 至 900 分",
          summary: "会开局，但还不能持续执行",
          mastered: "通常记得一套简单开局，知道基本兵种克制，也开始主动进攻或围家。",
          bottleneck: "开局之后容易失去目标，资源浮动、生产建筑空转和单线投入过多最常见；被骚扰后很难同时恢复经济与军事。",
          recommendations: [
            { name: "梦逝影", platform: "哔哩哔哩", url: "https://space.bilibili.com/19804019/", note: "长期解说黑铁局和观众投稿，适合从真实低分对局里观察常见失误；内容偏娱乐，不等同于严格教学。" }
          ]
        },
        {
          id: "ecology_band_bronze",
          name: "青铜局",
          rating: "常指约 900 至 1100 分",
          summary: "从背流程转向看局势",
          mastered: "能够较完整地执行一两套开局，知道侦察关键建筑，也会根据常见兵种补基础反制。",
          bottleneck: "过度依赖原定流程，对前置、偷袭、资源封锁和陌生地图的适应较慢；常能看出问题，却来不及完成转型。",
          recommendations: [
            { name: "帝国时代2小加", platform: "哔哩哔哩", url: "https://space.bilibili.com/479714887/", note: "内容覆盖快捷键、围家、常见开局和实战思路，适合补齐排位基本功。" }
          ]
        },
        {
          id: "ecology_band_middle",
          name: "中端玩家",
          rating: "常指约 1100 至 1400 分",
          summary: "开始用信息安排节奏",
          mastered: "开局与经济更加稳定，能够依据侦察调整兵种，理解抢时间、换资源、控地图和扩张经济之间的取舍。",
          bottleneck: "多线操作、连续生产与中后期资源重分配仍会拉开明显差距；有时能做出正确判断，但执行速度不足以抓住窗口。",
          recommendations: [
            { name: "帝国时代2骑士老爷", platform: "哔哩哔哩", url: "https://space.bilibili.com/481623535/", note: "可以观察开局调配、发育思路和第一视角实战。" },
            { name: "TownYan", platform: "哔哩哔哩", url: "https://space.bilibili.com/295879206/", note: "早期入门指南和约 1300 分段排位记录，适合对照普通玩家怎样执行完整对局。" }
          ]
        },
        {
          id: "ecology_band_high",
          name: "高端玩家",
          rating: "常指约 1400 至 1800 分",
          summary: "让经济和军事同时保持压力",
          mastered: "能稳定维持生产、侦察和多线操作，对文明强势期、地图控制和兵种转型有清楚判断，明显失误已经减少。",
          bottleneck: "胜负更多来自细小效率、战斗取舍和决策先后。面对顶分玩家时，一次错误交战或一次迟缓转型就可能失去整局主动权。",
          recommendations: [
            { name: "Hera黑鸭_帝国时代2", platform: "哔哩哔哩", url: "https://space.bilibili.com/3546889469299605/", note: "以高水平实战、职业内容和版本打法为主，适合已经能自行判断基础局势的玩家。" }
          ]
        },
        {
          id: "ecology_band_top",
          name: "顶分玩家",
          rating: "常指约 1800 分以上",
          summary: "在高强度中维持极少失误",
          mastered: "具备成熟的地图理解、操作速度和临场调整，能够迅速识别对手计划，并把小幅经济优势转成持续军事压力。",
          bottleneck: "分数继续上升后，对手数量变少、打法研究更深，个人专长与地图池影响更明显。顶分仍不等于职业选手，正式比赛是另一套考验。"
        },
        {
          id: "ecology_band_pro",
          name: "职业与赛事级",
          rating: "不以固定分数划线",
          summary: "赢下一场，也要赢下一轮系列赛",
          mastered: "除了顶级操作和判断，还要准备地图、文明与对手，在长系列赛里调整策略，并长期维持训练、心态和比赛状态。",
          bottleneck: "职业差距常体现在地图专项准备、选文明博弈、隐藏战术和连续高压下的稳定性，不能用普通天梯的一次交手下结论。"
        }
      ]
    },
    {
      id: "ecology_matchmaking_terms",
      title: "匹配中的灰色现象",
      type: "rows",
      introText: "低分段偶尔会遇到实力明显不相称的对手，但分数失真有多种原因。先看账号场次和对局表现，再判断是正常波动还是刻意破坏匹配。",
      stance: "本站不支持炸鱼、故意掉分、代打等破坏公平匹配的行为，但也不会假装这些现象不存在。新手遇到明显超出分段的对手时不必气馁，一场失配不能说明你的真实水平；有经验的玩家也应有所克制，不要把反复碾压新人当成优越感，更不要为了节目效果或轻松取胜主动制造低分账号。",
      items: [
        {
          id: "ecology_term_smurf",
          label: "炸鱼",
          text: "高水平玩家刻意使用低分账号进入较弱对局，并反复利用实力差距获得碾压体验。核心不只是“打得很强”，而是明知水平不符仍长期停留在低分环境。"
        },
        {
          id: "ecology_term_alt",
          label: "小号",
          text: "玩家使用的第二个或更多账号。小号可能用于练习、直播或重新定级，并不自动等于炸鱼；但新号前期确实会给匹配带来较大波动。"
        },
        {
          id: "ecology_term_returning",
          label: "回归与定级",
          text: "老玩家长时间停玩后回归，或从旧平台转到决定版，账号分数可能暂时低于实际经验。随着场次增加，系统通常会逐渐把玩家送回更接近实力的位置。"
        },
        {
          id: "ecology_term_sandbagging",
          label: "故意掉分",
          text: "通过连续投降等方式主动降低分数，再回到低分段取胜。这会直接伤害正常玩家的匹配体验，也让账号分数失去参考意义。"
        },
        {
          id: "ecology_term_boosting",
          label: "代打与带分",
          text: "由更强玩家操作账号或长期带队抬高分数。账号回到本人手中后容易出现反向失配，团队局也会因为组队水平差距造成比赛强度失衡。"
        }
      ]
    },
    {
      id: "ecology_china_community",
      title: "国内玩家生态",
      type: "community",
      introText: "国内帝国时代 II 圈子同时保留着老版平台时代的记忆，也在 Steam 决定版、直播与视频平台上形成了新的交流方式。它规模不算庞大，但战役、联机、赛事和内容创作都有长期稳定的人群。",
      groups: [
        {
          id: "ecology_china_play",
          title: "联机与约战",
          text: "排位玩家主要进入决定版官方匹配，自定义房则承接黑森林、团队局、场景玩法和熟人约战。国内长期约战主要依靠 QQ 群和微信群：玩家会在群内报分、组队、约地图、补位或组织小型比赛，因此公开天梯只呈现了国内联机生态的一部分。"
        },
        {
          id: "ecology_china_groups",
          title: "怎样找到玩家群",
          text: "群号和入群方式经常调整，最稳妥的入口通常是哔哩哔哩、抖音和斗鱼等公开平台：查看帝国时代 II UP 主的个人简介、视频简介、置顶动态、直播间公告或粉丝群说明，再按自己的分段、常玩地图和在线时间选择群。不要从不明网页下载所谓联机整合包，也不要随意向陌生人提供账号信息。"
        },
        {
          id: "ecology_china_content",
          title: "直播与视频",
          text: "斗鱼、哔哩哔哩、抖音等平台承担直播、赛事转播、录像补档、教学和短视频传播。不同平台的观众习惯差异很大，直播热度不能直接换算成真实在线玩家数量。",
          links: [
            { label: "梦逝影", platform: "哔哩哔哩", url: "https://space.bilibili.com/19804019/", note: "黑铁局、娱乐解说、民族介绍与入门内容" },
            { label: "帝国时代2小加", platform: "哔哩哔哩", url: "https://space.bilibili.com/479714887/", note: "开局、操作、排位与教学内容" },
            { label: "Hera黑鸭_帝国时代2", platform: "哔哩哔哩", url: "https://space.bilibili.com/3546889469299605/", note: "高水平对局与职业内容" }
          ]
        },
        {
          id: "ecology_china_language",
          title: "玩家黑话",
          text: "黑铁局、青铜局、炸鱼、偷家、直城、断农等说法让玩家快速描述对局。它们方便交流，但很多词没有统一边界，离开具体分数、地图与模式就容易产生误解。"
        },
        {
          id: "ecology_china_competitive",
          title: "竞技代表",
          text: "Yo、vivi、lyx 等玩家长期代表中国社区参与国际比赛和团队赛。国内观众既关注他们的正式成绩，也会围绕第一视角、直播风格和经典对局形成自己的观赛记忆。",
          links: [
            { label: "Yo", platform: "斗鱼", url: "https://www.douyu.com/753676", note: "国内顶尖选手直播间" },
            { label: "vivi", platform: "斗鱼", url: "https://www.douyu.com/1052202", note: "国内顶尖选手直播间" },
            { label: "lyx", platform: "斗鱼", url: "https://www.douyu.com/1029928", note: "选手与高水平实战内容" }
          ]
        },
        {
          id: "ecology_china_creators",
          title: "战役与模组",
          text: "中文社区拥有活跃的自制战役、地图和本地化内容作者。这个群体与天梯圈有交集，却不应被竞技分数遮盖；许多玩家留在游戏中，正是因为不断出现的新场景与历史内容。"
        }
      ]
    },
    {
      id: "ecology_global_community",
      title: "海外玩家生态",
      type: "community",
      introText: "海外社区以跨地区天梯、英文赛事转播和长期运营的社区网站连接在一起。不同国家的玩家会使用各自语言直播，但大型比赛通常通过英文内容进入更广泛的观众圈。",
      groups: [
        {
          id: "ecology_global_platforms",
          title: "内容平台",
          text: "Twitch 和 YouTube 承担直播、赛事转播、第一视角和录像内容；Reddit、Discord 与 AoEZone 等社区用于讨论版本、组织赛事、发布地图和交流比赛信息。"
        },
        {
          id: "ecology_global_tournaments",
          title: "赛事驱动",
          text: "主播、选手、地图作者、解说和主办方经常围绕一项赛事共同工作。资格赛先制造话题，正赛产生长系列对局，赛后复盘和剪辑又让内容继续传播。"
        },
        {
          id: "ecology_global_regions",
          title: "跨地区竞争",
          text: "欧洲、美洲、中国、东南亚等地区都有高水平玩家。网络延迟、时区和语言会影响日常约战，但国际天梯与线上比赛仍让不同地区保持长期交手。"
        },
        {
          id: "ecology_global_tools",
          title: "数据与观赛工具",
          text: "玩家会通过天梯网站、赛事资料站、录像文件和 CaptureAge 等观赛工具理解比赛。数据擅长说明发生了什么，真正解释为什么发生，仍需要结合地图、文明和当时局势。"
        }
      ]
    },
    {
      id: "ecology_creators",
      title: "主播与内容创作者",
      type: "creator_types",
      introText: "看谁的内容，取决于你想获得什么。职业第一视角、赛事解说、新手教学和娱乐节目承担的作用不同，不能只按主播本人的天梯分数排序。",
      groups: [
        {
          id: "ecology_creator_pro_pov",
          title: "职业第一视角",
          purpose: "看高水平玩家如何侦察、切屏、分配资源和临场转型。",
          suitableFor: "已经能看懂基本开局，希望观察执行细节和判断依据的玩家。",
          links: [
            { label: "Hera", platform: "个人主页", url: "https://linktr.ee/heraaoe2", note: "直播、视频与社交平台入口" },
            { label: "TheViper", platform: "YouTube", url: "https://www.youtube.com/@TheViperAOE", note: "职业第一视角、天梯和多种娱乐玩法" },
            { label: "Yo", platform: "斗鱼", url: "https://www.douyu.com/753676", note: "中文直播与高水平实战" },
            { label: "vivi", platform: "斗鱼", url: "https://www.douyu.com/1052202", note: "中文直播与高水平实战" }
          ]
        },
        {
          id: "ecology_creator_caster",
          title: "赛事解说",
          purpose: "把多个玩家的行动放在同一张地图上解释，帮助观众理解胜负点、文明选择和系列赛走势。",
          suitableFor: "想快速认识职业圈、地图池和赛事规则的观众。",
          links: [
            { label: "T90Official", platform: "官方网站", url: "https://www.t90official.tv/", note: "赛事、直播和 T90 Titans League 入口" },
            { label: "MembTV", platform: "Twitch", url: "https://www.twitch.tv/membtv", note: "赛事解说与赛事组织" },
            { label: "Dave", platform: "Twitch", url: "https://www.twitch.tv/dave_aoe", note: "英语赛事解说" },
            { label: "梦逝影", platform: "哔哩哔哩", url: "https://space.bilibili.com/19804019/", note: "中文赛事解说与录像内容" }
          ]
        },
        {
          id: "ecology_creator_teaching",
          title: "教学与复盘",
          purpose: "把复杂对局拆成开局、经济、兵种、地图和决策问题，重点不是展示操作，而是解释下一次怎样做得更好。",
          suitableFor: "希望把观看时间转化为实际天梯提升的玩家。",
          links: [
            { label: "Survivalist", platform: "Twitch", url: "https://www.twitch.tv/survivalistaoe2de", note: "英语教学、实战与复盘" },
            { label: "Hera", platform: "个人主页", url: "https://linktr.ee/heraaoe2", note: "职业视角教学与开局内容" },
            { label: "帝国时代2小加", platform: "哔哩哔哩", url: "https://space.bilibili.com/479714887/", note: "中文入门、开局与排位教学" }
          ]
        },
        {
          id: "ecology_creator_entertainment",
          title: "娱乐与低分局",
          purpose: "通过特殊规则、社区投稿、低分传奇和挑战玩法展示普通玩家的选择与意外场面。",
          suitableFor: "想轻松看游戏，也想从常见失误中认识基本原则的观众。",
          links: [
            { label: "梦逝影", platform: "哔哩哔哩", url: "https://space.bilibili.com/19804019/", note: "黑铁局、观众投稿与娱乐解说" },
            { label: "T90Official", platform: "YouTube", url: "https://www.youtube.com/@T90Official", note: "Low Elo Legends 与社区故事" }
          ]
        },
        {
          id: "ecology_creator_scenario",
          title: "战役与模组",
          purpose: "介绍官方战役、自制战役、地图脚本、视觉模组和场景编辑，让游戏内容不止停留在竞技对战。热门入门案例包括练习开局的 Interactive Build Order Guide、改善视野的 Small Trees，以及自制战役 Apranik、Tomislav。",
          suitableFor: "偏爱历史内容、单机挑战或创作工具的玩家。模组名称可直接在游戏内模组管理器搜索。",
          links: [
            { label: "官方模组库", platform: "Age of Empires", url: "https://www.ageofempires.com/mods/", note: "浏览决定版公开模组" },
            { label: "自制战役安装指南", platform: "Age of Empires", url: "https://www.ageofempires.com/news/playing-installing-custom-campaigns-for-age-of-empires-ii-de/", note: "官方安装说明与入门推荐" },
            { label: "OrnLu", platform: "YouTube", url: "https://www.youtube.com/@OrnLu_AoE", note: "官方及自制战役完整流程与评测" }
          ]
        }
      ]
    },
    {
      id: "ecology_tournaments",
      title: "代表赛事系列",
      type: "tournaments",
      introText: "帝国时代 II 没有唯一的标准赛制。不同赛事会选择随机地图、帝国战争、单一地图、综合地图池或团队对战，因此同一批选手在不同赛事中也可能呈现完全不同的强弱关系。",
      series: [
        {
          id: "ecology_event_rbw",
          name: "Red Bull Wololo",
          tag: "线下大赛 / 帝国战争",
          organizer: "Red Bull 与帝国时代官方体系",
          format: "以 1v1 帝国战争为代表：选手从已经运转的封建经济开始，前期接触快，主办方地图池和文明选取会显著改变节奏。",
          text: "这一系列以历史场地、舞台制作和顶尖阵容进入更广泛观众视野。它适合观看快速进攻、地图专项准备和长系列赛调整；2026 年 Londinium 在伦敦举行，延续了大型线下决赛的定位。",
          url: "https://www.redbull.com/int-en/red-bull-wololo-londinium-recap-age-of-empires"
        },
        {
          id: "ecology_event_lingyuan_cup",
          name: "凌远杯（LingYuan Cup）",
          tag: "中国线下赛 / 1v1 随机地图",
          organizer: "凌远主办，World's Edge 赞助",
          format: "2025 年赛事先设置国际预选赛和中国大陆预选赛，再于 10 月 22 日至 26 日在北京举行线下正赛。10 名选手先进行四轮瑞士制 BO5，前四名进入单败淘汰阶段并以 BO7 决出冠军。",
          text: "凌远杯把中国本土组织、中文转播和国际顶尖阵容放进同一场线下赛事，也是决定版时期国内少见的大型国际现场赛。综合地图池与九村开局既缩短了前期准备时间，又保留随机地图中的侦察、选文明和系列赛调整。",
          url: "https://www.ageofempires.com/events/lingyuan-cup/"
        },
        {
          id: "ecology_event_hidden_cup",
          name: "Hidden Cup",
          tag: "线上单挑 / 随机地图",
          organizer: "T90Official",
          format: "正赛选手使用隐藏身份参加 1v1 随机地图淘汰赛，解说、观众和其他选手在揭晓前都不知道英雄名背后的真实玩家。",
          text: "多地图与主场图规则要求选手准备开放图、封闭图和混合图。观众除了看胜负，还会从操作习惯、文明偏好和战术选择猜人，最后的人物揭晓是赛事最鲜明的观看体验。",
          url: "https://liquipedia.net/ageofempires/Hidden_Cup"
        },
        {
          id: "ecology_event_kotd",
          name: "King of the Desert",
          tag: "线上单挑 / 阿拉伯",
          organizer: "MembTV",
          format: "1v1 随机地图赛事，但所有比赛围绕赛事版阿拉伯展开，系列赛通常逐轮加长，并限制文明重复使用。",
          text: "只打一张地图不代表内容单一。资源位置、围家条件和文明选择每局都会变化，选手必须反复证明开放图的侦察、封建压制、转型与中后期运营，因此它常被视为阿拉伯基本功的大考。",
          url: "https://liquipedia.net/ageofempires/King_of_the_Desert"
        },
        {
          id: "ecology_event_ttl",
          name: "T90 Titans League",
          tag: "线上联赛 / 随机地图",
          organizer: "T90Official",
          format: "以分级联赛、循环赛和升降级为核心，综合地图池覆盖开放、封闭、水陆混合与赛事自制地图。",
          text: "TTL 不只关注最后冠军，还让不同层级的选手在一个赛季里积累积分、争夺晋级或避免降级。它适合持续观察新选手成长、稳定性和不同地图上的长期表现。",
          url: "https://www.t90official.tv/ttl/"
        },
        {
          id: "ecology_event_nations_cup",
          name: "Nations Cup",
          tag: "国家队 / 团队随机地图",
          organizer: "社区主办的国家与地区代表赛",
          format: "选手按国家或地区组成队伍，版本可能采用 3v3 或 4v4，并配置团队地图池、文明组合和出场阵容。",
          text: "团队赛的重点不是把几个高分玩家简单相加。边家与中家分工、远程和骑兵配兵、共同控图、贸易保护以及队内沟通都会决定结果，也让中国队等地区阵容获得区别于个人赛的故事线。",
          url: "https://liquipedia.net/ageofempires/Nations_Cup"
        },
        {
          id: "ecology_event_sy_nations_cup",
          name: "SY 国家杯与世界之巅",
          tag: "中国主办 / 国际团队赛",
          organizer: "中国赞助方 SY、国内赛事平台与赛事团队",
          format: "2014 至 2017 年间以国家或地区代表队为核心，采用长赛程的多人团队对抗；2017 年“世界之巅”设置线上阶段，并在厦门举行线下总决赛。",
          text: "这一时期是国内力量深度参与帝国时代 II 国际赛事组织的代表记忆。大型奖金、国家队阵容和连续数月的比赛，让中国、芬兰、加拿大、巴西等团队形成长期故事线，也让边家分工、团队指挥与多人局运营成为国内观众熟悉的观赛内容。",
          url: "https://www.douyu.com/cms/detail/new_list/5950.shtml"
        },
        {
          id: "ecology_event_boa",
          name: "Battle of Africa",
          tag: "俱乐部队 / 3v3 团队赛",
          organizer: "MembTV 与赛事团队",
          format: "以 3v3 随机地图和非洲主题赛事地图为代表，队伍需要同时准备文明组合、位置分工和三条战线的支援顺序。",
          text: "它把团队战的配合价值放到最前面：一侧承压时谁来补位、何时合兵、怎样把局部优势转到另一条战线，往往比单个选手的击杀数据更重要。",
          url: "https://liquipedia.net/ageofempires/Battle_of_Africa"
        },
        {
          id: "ecology_event_nac",
          name: "Nili's Apartment Cup",
          tag: "邀请赛 / 线下随机地图",
          organizer: "Nili 与赛事团队",
          format: "邀请顶尖选手在线下集中参赛，以综合随机地图池和较长系列赛检验全能性。",
          text: "公寓式线下环境让选手、解说和观众保持紧密互动，比赛既有正式强度，也保留社区聚会感。多天连续比赛尤其考验地图储备、体力和调整能力。",
          url: "https://liquipedia.net/ageofempires/Nili%27s_Apartment_Cup"
        }
      ]
    },
    {
      id: "ecology_players",
      title: "高手与传奇人物",
      type: "people",
      introText: "下面的人物用于帮助新观众建立坐标，不构成实力排名。现役状态会变化，判断当下强弱应结合最近赛事；理解历史影响，则要看他们长期留下的打法、成绩和社区记忆。",
      groups: [
        {
          title: "中国代表人物",
          people: [
            { id: "ecology_player_yo", name: "Yo", region: "中国", status: "现役选手与主播", identity: "后期判断与综合能力", detail: "长期处于中国玩家的最高竞争行列，以后期能力、多线处理和比赛韧性著称；2020 年赢得首届 Red Bull Wololo，是中国选手国际成绩的重要坐标。", links: [{ label: "斗鱼直播间", url: "https://www.douyu.com/753676" }] },
            { id: "ecology_player_vivi", name: "vivi", region: "中国", status: "现役选手与主播", identity: "主动进攻与直播影响力", detail: "长期活跃于国内直播和国际比赛，打法富有攻击性，也是海外观众认识中国帝国时代 II 圈的重要人物之一。", links: [{ label: "斗鱼直播间", url: "https://www.douyu.com/1052202" }] },
            { id: "ecology_player_lyx", name: "lyx", region: "中国", status: "选手与赛事参与者", identity: "扰乱节奏与团队配合", detail: "以敢于前压、制造混乱和团队战中的进攻作用被玩家熟悉，和 Yo、vivi 等人共同构成中国团队赛的重要记忆。", links: [{ label: "斗鱼直播间", url: "https://www.douyu.com/1029928" }] }
          ]
        },
        {
          title: "国际顶尖选手",
          people: [
            { id: "ecology_player_hera", name: "Hera", region: "加拿大", status: "现役职业选手与主播", identity: "高强度运营与稳定执行", detail: "以快速操作、经济控制和系列赛稳定性著称，赢得 2024 年 El Reinado 与 2026 年 Londinium 等 Red Bull Wololo 冠军，是当前职业圈的重要标杆。", links: [{ label: "直播与视频主页", url: "https://linktr.ee/heraaoe2" }] },
            { id: "ecology_player_liereyy", name: "Liereyy", region: "奥地利", status: "现役职业选手", identity: "远程操作与持续进攻", detail: "以弓兵操作、快速节奏和正面压迫力闻名，在大型赛事中长期保持争冠能力。", links: [{ label: "Twitch", url: "https://www.twitch.tv/liereyy" }] },
            { id: "ecology_player_viper", name: "TheViper", region: "挪威", status: "现役职业选手与主播", identity: "全面、灵活与长期统治力", detail: "能够驾驭大量文明、地图和特殊局面，是决定版前后最具代表性的传奇选手之一；他的长期稳定性塑造了许多玩家对“全能型高手”的理解。", links: [{ label: "YouTube", url: "https://www.youtube.com/@TheViperAOE" }] },
            { id: "ecology_player_tatoh", name: "TaToH", region: "西班牙", status: "现役职业选手与主播", identity: "创意策略与团队价值", detail: "擅长准备特殊战术、处理复杂地图并服务团队体系，赢得 2022 年 Red Bull Wololo: Legacy 的帝国时代 II 项目冠军。", links: [{ label: "Twitch", url: "https://www.twitch.tv/tatoh" }] }
          ]
        },
        {
          title: "长期传奇与社区人物",
          people: [
            { id: "ecology_player_daut", name: "DauT", region: "塞尔维亚", status: "老将、选手与主播", identity: "经验、战略与社区文化", detail: "跨越多个游戏版本保持顶级影响力。玩家既记得他的比赛成绩和战略判断，也把许多经典梗与“老将仍在比赛”的故事同他联系在一起。", links: [{ label: "Twitch", url: "https://www.twitch.tv/daut" }] },
            { id: "ecology_creator_t90", name: "T90Official", region: "美国", status: "解说、主播与赛事主办者", identity: "赛事传播与社区故事", detail: "通过 Hidden Cup、Low Elo Legends 和长期赛事解说连接职业赛场与普通玩家，是英语社区最有代表性的内容创作者之一。", links: [{ label: "官方网站", url: "https://www.t90official.tv/" }] },
            { id: "ecology_creator_memb", name: "MembTV", region: "西班牙", status: "解说与赛事主办者", identity: "高能解说与赛事组织", detail: "长期解说和组织帝国时代 II 赛事，尤其与 King of the Desert、Battle of Africa 等赛事内容联系紧密。", links: [{ label: "Twitch", url: "https://www.twitch.tv/membtv" }] },
            { id: "ecology_creator_dave", name: "Dave", region: "加拿大", status: "赛事解说与主播", identity: "清晰分析与搭档解说", detail: "长期参与大型赛事转播，能够在高强度对局中解释局势，也以自然的搭档互动帮助新观众进入比赛。", links: [{ label: "Twitch", url: "https://www.twitch.tv/dave_aoe" }] }
          ]
        }
      ]
    }
  ]
};
