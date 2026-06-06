# 剧本 YAML Schema 规范

## 概述

本工具将中文小说文本转换为结构化 YAML 剧本。YAML 格式便于人类阅读和编辑，适合编剧手动调整 AI 生成的内容。

---

## 顶层结构

```yaml
screenplay:
  meta:          # 剧本元信息
  characters:    # 角色列表
  locations:     # 地点列表
  scenes:        # 场景列表
  act_structure: # 三幕结构（可选）
```

---

## 字段定义

### meta — 剧本元信息

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 剧本标题 |
| author | string | 编剧 |
| genre | string | 类型：剧情/喜剧/悬疑/科幻等 |
| logline | string | 一句话概要 |
| source_title | string | 原著小说名 |
| created_at | string | 生成时间（ISO 8601） |

### characters — 角色列表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一 ID，如 `C01` |
| name | string | 角色名 |
| description | string | 角色简介 |
| age | string | 年龄/年龄段 |
| role | string | 角色类型：`protagonist` / `antagonist` / `supporting` / `minor` |

### locations — 地点列表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一 ID，如 `L01` |
| name | string | 地点名 |
| type | string | `INT`（室内）/ `EXT`（室外）/ `INT/EXT` |
| description | string | 地点描述 |

### scenes — 场景列表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 场景 ID，如 `S01` |
| chapter_ref | number | 对应原著第几章 |
| heading | string | 场景标题，如 `INT. 咖啡馆 - 夜晚` |
| location_id | string | 引用 locations 中的 id |
| time_of_day | string | 白天/夜晚/黄昏/清晨 |
| summary | string | 场景概要 |
| content | array | 场景内容数组（见下表） |

### scenes[].content — 场景内容

每个元素是一个内容块，通过 `type` 区分：

| type | 字段 | 说明 |
|------|------|------|
| action | text | 动作/场景描写 |
| dialogue | character_id, parenthetical?, text | 对话，可选括号注释 |
| transition | text | 转场，如"切至""淡出" |
| note | text | 编导注释 |

### act_structure — 三幕结构（可选）

| 字段 | 类型 | 说明 |
|------|------|------|
| act | number | 幕号：1, 2, 3 |
| scene_ids | string[] | 该幕包含的场景 ID |
| summary | string | 该幕概要 |

---

## ID 命名规则

| 类型 | 前缀 | 示例 |
|------|------|------|
| 角色 | C | `C01`, `C02`, ... |
| 地点 | L | `L01`, `L02`, ... |
| 场景 | S | `S01`, `S02`, ... |

---

## 设计理由

**1. characters/locations 独立定义，scenes 用 id 引用**

- 同一角色/地点出现多次时无需重复
- 前端可独立展示角色列表、地点列表
- 修改角色名只需改一处

**2. content 用 type 联合类型**

剧本只有四种元素（动作、对话、转场、注释），用 `type` 区分后前端可做不同渲染样式。

**3. chapter_ref 保留章节映射**

方便回溯原著，也支持增量重新生成单章。

**4. act_structure 可选**

不是所有剧本都遵循三幕结构，标记为可选不强制。

**5. YAML 而非 JSON**

- 人类可读可编辑
- 支持注释
- 缩进结构直观

---

## 示例

```yaml
screenplay:
  meta:
    title: 相遇
    author: AI 编剧
    genre: 剧情
    logline: 一封误会的信让两个年轻人经历波折最终走到一起
    source_title: test-novel
    created_at: "2026-06-06T12:00:00Z"

  characters:
    - id: C01
      name: 李明
      description: 内向的男高中生，暗恋同班同学张小雨
      age: "17"
      role: protagonist
    - id: C02
      name: 张小雨
      description: 活泼开朗的女高中生，李明的同班同学
      age: "17"
      role: protagonist
    - id: C03
      name: 王芳
      description: 隔壁班女生，被误认为情书收件人
      age: "17"
      role: minor

  locations:
    - id: L01
      name: 城市街道
      type: EXT
      description: 黄昏时分的街道，人来人往
    - id: L02
      name: 教室
      type: INT
      description: 普通高中教室，课桌椅排列整齐
    - id: L03
      name: 操场看台
      type: EXT
      description: 学校操场的看台，可以看到远处的夕阳

  scenes:
    - id: S01
      chapter_ref: 1
      heading: "EXT. 城市街道 - 黄昏"
      location_id: L01
      time_of_day: 黄昏
      summary: 李明回家路上遇到张小雨，张小雨发现他手中的信
      content:
        - type: action
          text: 黄昏时分，城市的街道上人来人往。李明背着书包，低头走在回家的路上。
        - type: dialogue
          character_id: C02
          parenthetical: 气喘吁吁
          text: "李明！等等我！"
        - type: action
          text: 李明转过身，看到张小雨正朝他跑来。
        - type: dialogue
          character_id: C02
          text: "你走这么快干嘛？"
        - type: dialogue
          character_id: C01
          parenthetical: 淡淡地
          text: "没什么，就是想快点回家。"
        - type: action
          text: 张小雨注意到他手里攥着一封信。
        - type: dialogue
          character_id: C02
          text: "那是什么？"
        - type: action
          text: 李明连忙把信塞进口袋。
        - type: dialogue
          character_id: C01
          parenthetical: 紧张
          text: "没什么，一封普通的信。"

    - id: S02
      chapter_ref: 2
      heading: "INT. 教室 - 白天"
      location_id: L02
      time_of_day: 白天
      summary: 谣言传开，李明被误会给王芳写情书，张小雨伤心离开
      content:
        - type: action
          text: 教室里气氛异样，同学们窃窃私语。
        - type: dialogue
          character_id: C03
          parenthetical: 小声
          text: "听说了吗？李明给隔壁班的王芳写了情书。"
        - type: action
          text: 李明愣住了，脸变得通红。
        - type: dialogue
          character_id: C01
          parenthetical: 大声
          text: "不是那样的！"
        - type: action
          text: 张小雨坐在角落里，低着头，眼眶泛红。
        - type: dialogue
          character_id: C01
          parenthetical: 急切
          text: "小雨，你听我解释。"
        - type: dialogue
          character_id: C02
          parenthetical: 强忍泪水
          text: "不用解释了，我都明白了。"
        - type: action
          text: 她站起身，快步走出教室。
        - type: transition
          text: 切至

    - id: S03
      chapter_ref: 3
      heading: "EXT. 操场看台 - 傍晚"
      location_id: L03
      time_of_day: 傍晚
      summary: 李明向张小雨坦白，两人和好
      content:
        - type: action
          text: 李明在操场上找到了张小雨，她独自坐在看台上。
        - type: dialogue
          character_id: C01
          parenthetical: 轻声
          text: "小雨，那封信不是情书。"
        - type: action
          text: 张小雨没有看他，只是静静地听着。
        - type: dialogue
          character_id: C01
          parenthetical: 真挚
          text: "那是我写给你的。"
        - type: action
          text: 李明从口袋里掏出那封皱巴巴的信，递到她面前。
        - type: dialogue
          character_id: C01
          parenthetical: 不好意思
          text: "我只是不知道怎么开口，所以写了信。"
        - type: action
          text: 张小雨接过信，小心翼翼地打开。
        - type: action
          text: 泪水模糊了视线，她用力地点了点头。
        - type: dialogue
          character_id: C02
          parenthetical: 轻声
          text: "我愿意。"
        - type: action
          text: 夕阳将两人的影子拉得很长，他们的手紧紧握在了一起。
        - type: transition
          text: 淡出
```
