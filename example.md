---
theme: .
title: slidev-theme-ket
author: iluluyu
organization: Fudan University
date: 2026-06-14
gradient: true
info: |
  ## Ket 主题特性展示
  cover · intro · Bra · PaperCover · projector · gradient · glass · KaTeX
---

# slidev-theme-ket

学术演示主题 · 特性展示

---
layout: intro
---

# 布局与组件一览

cover · intro · default

Bra · PaperCover · projector · gradient · glass

---

# 标题层级

## 二级标题 H2

### 三级标题 H3

#### 四级标题 H4

##### 五级标题 H5

###### 六级标题 H6

正文：**加粗**、*斜体*、`行内代码`、~~删除线~~。

---

# 列表

- 无序第一项
- 无序第二项
  - 嵌套子项
    - 更深一层
- 无序第三项

1. 有序第一项
2. 有序第二项
3. 有序第三项

> 列表标记自动着色为主题主色，投影仪模式下保持高对比。

---

# 表格

| 方法 | 采样复杂度 | 备注 |
| --- | --- | --- |
| 层析法 | $O(d^4)$ | 经典基线 |
| 经典阴影 | $O(d^2)$ | 随机测量 |
| 纠缠增强 | $O(d)$ | 指数加速 |

> 表格在投影仪模式下会自动增强边框与斑马纹对比度。

---

# 代码块

```python
import jax
import jax.numpy as jnp

@jax.jit
def expectation(rho: jnp.ndarray, obs: jnp.ndarray) -> float:
    """密度矩阵 rho 对可观测量 obs 的期望值。"""
    return float(jnp.real(jnp.trace(obs @ rho)))
```

行内代码：`pnpm dev` 启动开发服务器。快捷键 <kbd>Space</kbd> 翻页，<kbd>Esc</kbd> 进入总览。

---

# 引用与分隔线

> 这是一个引用块（blockquote），适合放置重要引述或强调内容。投影仪模式下字重会自动增强。

上方内容

---

`<hr>` 分隔线，用于视觉切分。

---

# 数学公式

行内公式：测量后状态 $\rho' = K_i \rho K_i^\dagger \,/\, \operatorname{tr}(K_i \rho K_i^\dagger)$。

完备性关系：

$$
\sum_{i} K_{i}^{\dagger} K_{i} = \mathbb{I}.
$$

采样复杂度上界：

$$
N = O\!\left(\frac{d^2 \log d}{\varepsilon^2}\right), \quad d = 2^n.
$$

---

# Bra · 预设类型

<Bra type="theorem" name="No-Cloning" :number="1">

不存在通用克隆酉 $U$ 使 $U(|\psi\rangle|0\rangle) = |\psi\rangle|\psi\rangle$ 对所有非正交态 $|\psi\rangle$ 同时成立。

</Bra>

<Bra type="definition" name="Sample Amplification" :number="1">

给定来自某类已知分布的随机样本，生成更大的、与真实样本不可区分的数据集。

</Bra>

<Bra type="proof">

由 $K_i^\dagger K_i$ 的半正定性即可得出完备性。$\square$

</Bra>

---

# Bra · 语义色调

<div grid="~ cols-2 gap-3">

<Bra title="Default" tone="default">

默认主题色

</Bra>

<Bra title="Primary" tone="primary">

强调核心内容

</Bra>

<Bra title="Success" tone="success">

正面结论

</Bra>

<Bra title="Warning" tone="warning">

需要注意

</Bra>

<Bra title="Danger" tone="danger">

关键警示

</Bra>

<Bra title="Muted" tone="muted">

次要信息

</Bra>

</div>

---

# Bra · 样式变体

<Bra title="无边框纯背景" :border="false">

`:border="false"` — 仅背景色，无边框。

</Bra>

<Bra title="斜体正文" italic>

`italic` — 正文斜体，适合定义或引述。

</Bra>

<Bra title="自定义颜色" bg-color="rgba(99,102,241,0.08)" title-color="#6366f1" border-color="rgba(99,102,241,0.36)">

`bg-color` / `title-color` / `border-color` — 底层颜色覆写。

</Bra>

---

# PaperCover · 学术封面（数组式）

<PaperCover
  title="Exponential Speedup in Measurement Property Learning"
  subtitle="Post-Measurement States Enable Quantum Advantage"
  :authors="[
    ['Z. Liu', '1'],
    ['Q. Ye', '1,2'],
    ['J. Eisert', '3'],
  ]"
  :affiliations="[
    ['1', 'IIIS, Tsinghua University'],
    ['2', 'Shanghai Qi Zhi Institute'],
    ['3', 'Freie Universität Berlin'],
  ]"
/>

---

# PaperCover · 对象式 + 自定义字号

<PaperCover
  title="Cloning is as Hard as Learning"
  :authors="[
    { name: 'Alice', mark: '1' },
    { name: 'Bob', mark: '2' },
  ]"
  :affiliations="[
    { mark: '1', text: 'Department A, University X' },
    { mark: '2', text: 'Department B, University Y' },
  ]"
  title-size="2.5rem"
/>

---

# 投影仪模式

在 frontmatter 添加 `projector: true` 即可启用投影仪优化：

- **对比度增强** — RGB 16–235 动态范围压缩，避免纯黑/纯白溢出
- **边框加粗** — 代码块、表格、`<kbd>` 边框加粗加深
- **字重提升** — 标题 700、正文 450，防止细笔画在投影上模糊
- **透明度补偿** — 低透明度元素自动提亮，保证后排可读

> 投影仪模式由 `global-bottom.vue` 通过 `.projector-mode` CSS 类全局切换，覆盖 `squircle.css` 中的 `--ket-*` 变量。

---
layout: cover
gradient: false
glass: true
---

# Glass 玻璃效果

cover 布局 `glass: true` 变体（逐页覆盖 headmatter 的 `gradient`）
