# 文献引用 / 交叉引用 —— 可行性技术分析

> 状态：**待批准**（本文档仅为方案分析，不含任何代码改动）
> 范围：`slidev-theme-ket` 主题
> 目标能力：① 正文内的引用标记（in-page citation）② 末页参考文献（end-of-deck references）③ 公式与图片的交叉引用（equation / figure cross-reference）

---

## 0. 结论先行（TL;DR）

**三项能力均可实现，且风险低、改动纯增量。** 推荐采用与现有主题哲学一致的「**手写编号 + 轻量 Vue 组件**」路线，而**不**引入自动编号/全局引用注册表。

| 能力 | 可行性 | 推荐实现 | 自动编号？ |
| --- | --- | --- | --- |
| 正文引用 `[1]` | ✅ | `<Cite :n="1"/>` 组件 | 否（手写） |
| 末页参考文献 | ✅ | `<References :entries="[...]"/>` 组件 + `references` 布局 | 否（手写） |
| 公式交叉引用 Eq.(1) | ✅ | `\tag{1}` + `<EqRef :n="1"/>` | 否（手写） |
| 图片交叉引用 Fig.1 | ✅（已具备半数） | 复用 `Figure :number` + `<FigRef :n="1"/>` | 否（手写） |

**核心约束**：KaTeX 无状态（`0.16.28` 实测见 §3）、Slidev 逐页编译（每页是独立 Vue SFC，见 §3），这两点决定了「自动编号 + 跨页引用注册表」路线在 dev/build/导出三套渲染路径下都不可靠，因此不推荐。

---

## 1. 背景与现有基础

主题已有的编号约定（这是本次方案的基础，必须与之保持一致）：

- [Bra.vue](../components/Bra.vue) — 定理/定义区块，`<Bra type="theorem" :number="1">`，编号**手写**。
- [Figure.vue](../components/Figure.vue) — 图片，`<Figure src="..." :number="1">`，渲染 `Fig. 1`，编号**手写**。
- [example.md](../example.md) — 主题回归基线，每个新能力都要在此演示。

主题一贯采用「**编号由作者显式给出**」而非「自动递增」。这很关键：幻灯片不是论文，引用/公式数量稀疏、顺序稳定，手写编号的维护成本可忽略，换来的是**每页自包含、渲染无状态依赖**的健壮性。

---

## 2. 三类需求的方案分析

### 2.1 正文内引用标记（in-page citation）

> 形如 `… 信噪比界 [1,2]` 或 `… (Nielsen & Chuang, 2010)`，指向末页参考文献。

**候选方案：**

| 方案 | 做法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **A1** `<Cite>` 组件 | `<Cite :n="1"/>` → 渲染上标式 `[1]`，可选 `href` 跳末页 | 与 Bra/Figure 手写编号哲学一致；dev/build/PDF 均稳定 | 插入新文献需手动重排（幻灯片场景可忽略） |
| A2 全局自动编号 | `useCitations()` 组合式 + `<Cite key="nielsen"/>`，按首次出现排序 | DRY、无需手写号 | ⚠️ Slidev 逐页编译 + 懒渲染，末页 refs 渲染时其它页未必已收集，SSG/导出时顺序不稳 |
| A3 `markdown-it-footnote` | `[^nielsen]` 语法，插件自动编号 | 语法简洁 | ⚠️ 脚注渲染在**每页底部**，不是「末页文献」；跨页编号每页重置；语义错位 |

**推荐：A1。** 理由：与主题现有哲学一致（手写号）、零全局状态、三套渲染路径都稳。可选地把 `[1]` 做成可点击内链跳到参考文献页（见 §4 链接策略）。

### 2.2 末页参考文献（end-of-deck references）

> 最后一页（或倒数第二页）集中列出所有文献，带编号、与正文 `[1]` 对应。

**候选方案：**

| 方案 | 做法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **B1** `<References>` 组件 | 接受数组 prop 或默认插槽（markdown），渲染紧凑学术编号列表 | 单页自包含；编号与 `<Cite>` 手写对应；样式可控 | 文献数据写在 slide 里（可接受） |
| **B2** `references` 布局 | 专用布局 + 默认插槽当文献列表 | 与 `cover`/`thanks` 等布局并列，语义清晰 | 本质等同 B1，二选一即可（见 §4） |
| B3 外部数据文件 | `refs.yml` 在 setup 解析注入 | 文献多时整洁 | 需要额外的数据加载机制，过设计 |

**推荐：B1 + 一个等价的 `references` 布局（B2）。** 组件承载样式与数据结构，布局提供「整页」语义与页眉。二者配合：`layout: references` 的默认插槽里放 `<References :entries="...">`，或直接写 markdown 编号列表（布局已套好样式）。文献数据就近写在末页 frontmatter / 插槽，避免引入外部数据文件。

### 2.3 公式交叉引用（equation cross-reference）

> 形如 `由 Eq. (1) 可得…`，指向某页的某个展示公式 `(1)`。

**关键约束（实测）：** KaTeX `0.16.28` 是**无状态**渲染器——每个公式独立求值，无跨公式注册表。

```
\tag{1}   →  ✅ 正常渲染 (1)   （Eq. 行尾编号）
\eqref{}  →  ❌ Undefined control sequence
\label{}  →  ❌ Undefined control sequence
```

**候选方案：**

| 方案 | 做法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **C1** `\tag` + `<EqRef>` | 公式写 `$$ … \tag{1} $$`；引用处写 `<EqRef :n="1"/>` → `Eq. (1)` | 用足 KaTeX 已有能力；无全局状态；稳定 | 编号手写（可接受） |
| C2 markdown-it 预扫描注册表 | 自定义插件全文扫描 `\label`/`\tag`，建 `key→N` 表，注入 KaTeX macros 令 `\eqref` 生效 | 模拟 LaTeX | ⚠️ Slidev **逐页编译**，第 3 页的 `\label` 在第 5 页编译时不可见，需整 deck 预扫描——重型自定义、脆弱 |
| C3 运行时 Vue 注册 | 用组件包裹展示公式并 `provide` 编号 | 可自动 | 同 A2 的跨页状态问题；且 `<Katex>` 包装破坏 markdown 内 `$$` 渲染 |

**推荐：C1。** 这是 KaTeX 无状态约束下的唯一稳健解。`\tag{}` 已被 Slidev 的 KaTeX 支持（无需配置），`<EqRef>` 仅是把 `Eq. (1)` 文本样式化（accent 色、可选链接）。幻灯片单页公式数少，手写 `\tag` 是惯例。

### 2.4 图片交叉引用（figure cross-reference）

> 形如 `如 Fig. 1 所示…`，指向 `<Figure :number="1">`。

**已完成一半：** [Figure.vue](../components/Figure.vue) 已渲染 `Fig. 1` 标签。只差一个**引用端**组件 `<FigRef :n="1"/>` → `Fig. 1`（与图本身样式呼应）。这与 `<EqRef>` 同构，成本极低。

---

## 3. 关键技术事实（已核实）

1. **KaTeX 版本**：`katex@0.16.28`（Slidev 52.12 依赖）。
   - `\tag{N}` ✅ 可用——在 `$$ ... \tag{1} $$` 行尾渲染 `(1)`。
   - `\eqref{}` / `\label{}` ❌ 不可用——`Undefined control sequence`。
   - 原因：KaTeX 设计上无状态，每个数学块独立渲染，无法维护跨公式标签表。

2. **Slidev 逐页编译**：`@slidev/parser` 以 `---` 切分 markdown，**每页编译为独立的 Vue SFC**。因此：
   - 任何依赖「全文扫描后建立跨页编号表」的方案（C2/A2）在 dev 热更、build、PDF 导出三种路径下行为不一致，不可靠。
   - 反之，「每页自包含、手写编号」的方案天然免疫此问题。

3. **跨页跳转锚点**：Slidev SPA 支持 `[链接](#/5)` 式的页码深链（dev 与 build 的 SPA 均可导航；PDF 导出会生成内部页跳转）。但**页号会因插入新页而漂移**，故引用组件的 `href` 设为**可选**——默认仅渲染样式化标记，作者需要时再显式给 `href`。

4. **markdown-it 插件机制**：Slidev 支持在 `setup/` 下加自定义 markdown-it 插件。本方案**不需要**任何新插件——全部用现有 Vue 组件 + KaTeX `\tag` 实现，零编译期改动。

---

## 4. 拟定设计（待批准后实施）

### 4.1 新增组件（均为无状态、手写编号）

```vue
<!-- Cite.vue —— 正文引用标记 -->
<!-- <Cite :n="1"/>            → [1]
     <Cite :n="[1,3]"/>       → [1,3]
     <Cite n="NC2010"/>       → [NC2010]      作者-年风格
     <Cite :n="1" href="#/20"/>→ 可点击 [1]    可选 -->
```

```vue
<!-- EqRef.vue —— 公式引用 -->
<!-- <EqRef :n="1"/>           → Eq. (1)        accent 色，可选 href -->
```

```vue
<!-- FigRef.vue —— 图片引用 -->
<!-- <FigRef :n="1"/>          → Fig. 1         与 Figure 标签同色 -->
```

```vue
<!-- References.vue —— 末页文献列表 -->
<!-- <References :entries="[
       { n:1, text:'M. A. Nielsen, I. L. Chuang. *Quantum Computation…*, Cambridge, 2010.' },
       { n:2, text:'…' } ]"/> -->
```

### 4.2 新增布局

- `layouts/references.vue` —— 整页语义布局：标题区（如 `# References`）+ 紧凑双栏编号列表区（文献多时自动两栏），样式与 `default` / `thanks` 协调。可与 `<References>` 组件配合，也可直接放 markdown 编号列表。

### 4.3 样式（追加到 [styles/layout.css](../styles/layout.css)）

- `.ket-cite`（上标式、accent 色、`vertical-align: super`、`font-size: .8em`）
- `.ket-eqref` / `.ket-figref`（行内、accent 色、可选 `tabular-nums`）
- `.ket-refs`（两栏、紧凑行高 `1.45`、悬挂缩进使编号与文本对齐、编号用 accent 色 `tabular-nums`）

全部复用既有 CSS 变量（`--ket-ac`、`--ket-t1`、`--ket-radius-md` 等），无新色板。

### 4.4 example.md 演示（回归基线）

计划在 §2 方法比较表附近增加：
- 一页「正文引用 + 公式/图片交叉引用」综合演示：Bra 定理内用 `[1]` 引用、行内 `Eq. (1)` 指向同页 `\tag{1}` 公式、`Fig. 1` 指向已有 Bloch 球图。
- 末页（`thanks` 之前）增加 `layout: references` 的参考文献页，列出 2–3 条示例文献，编号与正文 `[1]` 对应。

### 4.5 文档更新

- [README.md](../README.md)：新增「引用与交叉引用」章节。
- [.claude/skills/author/SKILL.md](../../.claude/skills/author/SKILL.md)（author skill）：补一节引用排版规范与 `$$ \tag{} $$` 注意事项。

---

## 5. 权衡与「明确不做」

| 不做 | 原因 |
| --- | --- |
| 自动编号 / 全局引用注册表（A2/C2/C3） | Slidev 逐页编译，跨页状态在 dev/build/导出下不可靠；幻灯片引用稀疏，收益不抵风险 |
| `markdown-it-footnote`（A3） | 渲染在**每页底部**且每页重置编号，与「末页集中文献」语义不符 |
| KaTeX `\label`/`\eqref`（C2 的前提） | KaTeX 无状态，需重型自定义预扫描，脆弱 |
| 外部 `refs.yml` 数据文件（B3） | 过设计；末页内联数据已足够 |

**取舍原则：每页自包含、无跨页状态、与现有手写编号哲学一致。** 这保证改动在 dev 热更、`s build`、PDF 导出三条路径下行为一致，且完全可逆（纯增量）。

---

## 6. 工作量与风险

- **规模**：4 个小组件（各 ~30 行）、1 个布局、~60 行 CSS、example.md 2 页演示、README/skill 各一段。
- **风险**：低。无 markdown-it 插件、无全局状态、无编译期改动；纯增量，可逐项回退。
- **验证**：`s theme` 热更目检 + `s check` 逐页溢出检测 + `s build` 编译验证（与既有流程一致）。

---

## 7. 待确认事项

1. 引用风格：**编号式 `[1]`** 为主，是否同时要支持**作者-年 `[NC2010]`**？（组件设计上已预留，只需定默认。）
2. 正文 `[1]` 是否需要**可点击跳转**到末页参考文献？（默认建议：不跳，仅样式化；按需可给 `href`。）
3. 末页文献布局：**单栏紧凑**还是**双栏**？（文献 ≤6 条建议单栏；>6 条自动双栏可由 CSS `columns` 实现。）

---

*请审阅本方案。批准后我将按 §4 的设计实施，完成后用 `s theme` / `s check` / `s build` 验证，并在 submodule 与根仓库分别提交、推送。*
