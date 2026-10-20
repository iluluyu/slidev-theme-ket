---
theme: .
layout: cover
title: Quantum Entanglement and Information Processing
author: iluluyu
organization: Fudan University
date: 2026-06-14
gradient: true
footerTitle: Quantum Entanglement and Information Processing
info: |
  ## Ket 主题特性展示
  Quantum-style cover · section · Pad theorem/proof · table · code · footer progress
---

# slidev-theme-ket

Quantum-style academic theme · Standard cover

---
layout: cover-deco
gradient: true
tag: Quantum Information · Research Seminar
---

# Quantum Entanglement<br>and Information Processing

A framework for multipartite entanglement measures and their role in quantum communication protocols.

> Cover variants in this example: `cover`, `cover-deco`, `cover-cosmic`, `PaperCover`, and `PaperCover deco`.

---
layout: cover-cosmic
heading: Gravitational-Wave Astronomy
date: 2026-10-06
link: https://www.youtube.com/watch?v=demo
linkLabel: Watch on YouTube
linkSublabel: Simons Institute talk
---

<!-- cover-cosmic：Three.js 黑洞（引力透镜/吸积盘/差动粒子流）+ 左侧文字栈 + 毛玻璃链接卡。
     可调 prop：innerColor、outerColor、focus（left/center）、speed、stars、quality、motion、maxFps；
     默认 motion:auto 遵循系统偏好；总览/打印/下一页预览静止，仅当前可见封面持续渲染。
     link/linkLabel/linkSublabel 渲染玻璃卡（YouTube 链接自动换播放圈标）。
     标题、作者、机构、日期由 headmatter 提供（标题可用本页 heading 覆盖），不要在正文里再写 # 标题。 -->

---
layout: cover-cosmic
heading: Motion Without System Effects
motion: always
maxFps: 24
quality: low
---

<!-- motion:always 是明确的播放选择；即使 Windows 动态效果关闭，黑洞仍旋转。
     quality:low + maxFps:24 限制渲染预算；软件 WebGL 自动进一步降至 12 FPS。
     离开此页、隐藏标签页、进入总览，都取消 RAF 与计时器。 -->

---
layout: cover-cosmic
heading: A Still Cosmic Cover
motion: never
quality: low
---

<!-- motion:never 保留静态首帧，无持续循环；2D 回退同样遵守此设置。 -->

---

# Overview · *Outline*

<div class="steps">
  <div class="step"><div class="step-n">1</div><div class="step-body">

**Mathematical framework** — quantum states, density matrices, and von Neumann entropy.

  </div></div>
  <div class="step"><div class="step-n">2</div><div class="step-body">

**Main results** — subadditivity, strong subadditivity, and Schmidt decomposition.

  </div></div>
  <div class="step"><div class="step-n">3</div><div class="step-body">

**Applications** — teleportation, entanglement-assisted communication, and protocol costs.

  </div></div>
  <div class="step"><div class="step-n">4</div><div class="step-body">

**Design system** — theorem boxes, tables, code, and page footer.

  </div></div>
</div>

---
layout: section
sectionNumber: §1
tags:
  - Density matrices
  - Entropy
  - No-cloning
---

# Mathematical Framework

Quantum states, density matrices, and the von Neumann entropy as the central quantity.

---

# §1 · Mathematical Framework · *Theorem Blocks*

<Pad type="theorem" name="No-Cloning" :number="1">

There is no unitary $U$ such that $U(|\psi\rangle|0\rangle)=|\psi\rangle|\psi\rangle$ holds for all non-orthogonal states $|\psi\rangle$. Quantum information cannot be duplicated.

</Pad>

<Pad type="definition" name="Von Neumann Entropy" :number="2">

For a quantum state $\rho$, the von Neumann entropy is
$S(\rho)=-\operatorname{Tr}(\rho\log_2\rho)=-\sum_i\lambda_i\log_2\lambda_i$.

</Pad>

<Pad type="proof">

由 $K_i^\dagger K_i$ 的半正定性即可得出完备性。Completeness follows from $\sum_i K_i^\dagger K_i=\mathbf{1}$. $\square$

</Pad>

---

# §1 · Main Results · *Proof Style*

<Pad type="theorem" name="Subadditivity" :number="3">

For a bipartite quantum state $\rho_{AB}$,
$$
S(\rho_{AB}) \le S(\rho_A)+S(\rho_B).
$$

</Pad>

<Pad type="proof">

The result follows by monotonicity of relative entropy under the partial trace. Equivalently, applying strong subadditivity to a purification of $\rho_{AB}$ yields the desired inequality. $\square$

</Pad>

<Pad type="corollary" name="Entanglement Entropy">

For a pure bipartite state $|\psi_{AB}\rangle$, $S(\rho_{AB})=0$ and $S(\rho_A)=S(\rho_B)$.

</Pad>

---

# Template · Design System · *Semantic Tones*

<div grid="~ cols-2 gap-3">

<Pad title="Theorem" tone="default">

主定理、核心结果，紫色高亮。

</Pad>

<Pad title="Definition" tone="primary">

定义、符号约定，蓝色强调。

</Pad>

<Pad title="Lemma" tone="success">

辅助性结论，绿色提示正向进展。

</Pad>

<Pad title="Remark" tone="warning">

补充说明和注意事项，琥珀色。

</Pad>

<Pad title="Corollary" tone="danger">

重要衍生结果，玫红色。

</Pad>

<Pad title="Proof" tone="muted">

证明过程和次要支撑信息，灰色。

</Pad>

</div>

---

# Template · Design System · *Color Palette*

The deck-wide palette switch lives in the headmatter — `mono` is the default and this example runs it:

```yaml
---
themeConfig:
  palette: mono    # default — neutral academic scheme
  # palette: vivid # original quantum-violet scheme
---
```

`mono` spends one indigo accent `#5856D6` on neutral surfaces, with muted traffic-light dots and restrained semantic fills. `vivid` restores the violet ramp `#7229E8`, the rainbow cover gradient and the saturated keyword tones. Layout, geometry and typography stay identical — only colors switch.

Current keyword tones: <span class="kw-danger">danger</span> · <span class="kw-gold">gold</span> · <span class="kw-blue">blue</span> · <span class="kw-green">green</span> · <span class="kw-violet">violet</span> — and badges: <span class="badge badge-v">accent</span> <span class="badge badge-g">success</span> <span class="badge badge-b">primary</span>.

---

# Template · Design System · *Compact Mode*

<Pad type="theorem" compact>Theorem has no cloning.</Pad>
<Pad type="definition" compact>Definition — von Neumann entropy.</Pad>
<Pad type="lemma" compact>Lemma — subadditivity holds.</Pad>
<Pad type="remark" compact>Remark — compact for notes.</Pad>

<Pad type="theorem" name="Named" compact :number="7">Compact with name and number.</Pad>
<Pad type="proof" compact>

Done via induction. $\square$
</Pad>

<!-- Titles render inline markdown too — math ($...$), **bold**, *italic*, `code` —
     not just plain text. Useful for headers like "all outcomes in $H^\perp$". -->
<Pad title="Hiding property → all outcomes in $H^\perp$" tone="warning" compact>
Every measurement outcome falls in $H^{\perp}$.
</Pad>
<Pad title="**Recall:** the *symmetric* cloner needs $t = \Theta(2^n)$ copies" compact>
Werner's optimal cloner projects onto the symmetric subspace.
</Pad>

---

# §2 · Method Comparison · *Table*

<!-- 裸 markdown 管道表：不套 <div>，避免 HTML-block 与 inline markdown 层级冲突导致 $...$ 不渲染。
     圆角外框 / 表头分割线由 styles/layout.css 的 .slidev-layout table 直接提供。 -->

| Method | Sample complexity | Quantum resource | Notes |
| --- | --- | --- | --- |
| **Tomography** | $O(d^4)$ | Classical measurement | Baseline with exponential overhead |
| **Classical shadows** | $O(d^2)$ | Random Clifford | Random measurement, quadratic gain |
| **Entangled measurement** | $O(d)$ | Auxiliary entanglement | Information-theoretic optimal rate |
| **Lower bound** | $\Omega(d)$ | Theoretical limit | Cannot be asymptotically improved |

<Pad type="remark">

Here $d=2^n$ is the Hilbert-space dimension of an $n$-qubit system. The entangled method reaches the information-theoretic lower bound.

</Pad>

---

# §2 · Implementation · *Code Block*

```python
import jax
import jax.numpy as jnp

@jax.jit
def von_neumann_entropy(rho: jnp.ndarray) -> float:
    eigenvalues = jnp.linalg.eigvalsh(rho)
    eigenvalues = jnp.clip(eigenvalues, 1e-12, 1.0)
    return float(-jnp.sum(eigenvalues * jnp.log2(eigenvalues)))
```

行内代码示例：`jnp.trace(obs @ rho)` 计算矩阵迹。按 <kbd>Space</kbd> 翻页，按 <kbd>O</kbd> 进入总览。



---
class: code-compact
---

# Code Block · *Compact Mode*

Opt into compact rendering with `class: code-compact` on the slide (every block) or by wrapping a single fence in `<div class="code-compact">` — the macOS window chrome drops and padding / line-height tighten, for dense snippets or two-column code.

```python
@jax.jit
def partial_trace(rho: jnp.ndarray, d_a: int) -> jnp.ndarray:
    """Trace out subsystem B of a d_a (x) d_b bipartite state."""
    d_b = rho.shape[0] // d_a
    return jnp.einsum('ikjk->ij', rho.reshape(d_a, d_b, d_a, d_b))
```

---
layout: two-cols-header
cols: 1.05fr 0.95fr
class: code-compact
---

# Two-Column · *Code + Note*

::left::

```python
@jax.jit
def expect(state: jnp.ndarray, obs: jnp.ndarray) -> float:
    """Expectation <O> for a pure state."""
    return float(jnp.vdot(state, obs @ state).real)
```

::right::

`layout: two-cols-header` — the default slot is the header; `::left::` / `::right::` fill the columns, and `cols` tunes the ratio.

With `class: code-compact` the snippet on the left renders without window chrome, leaving room for the note on the right.

---
layout: two-cols-header
cols: 0.9fr 1.1fr
---

# Figure · *Image References*

::left::

<Figure src="/figures/bloch-sphere.svg" :number="1" width="80%">

**Bloch sphere** — a pure state $|\psi\rangle=\cos(\theta/2)|0\rangle+e^{i\varphi}\sin(\theta/2)|1\rangle$ lives on the unit sphere (see Fig. 1).

</Figure>

::right::

Use `<Figure>` for proper image references:

- `src` — image path; the theme ships `public/figures/bloch-sphere.svg`
- `:number="1"` — optional `Fig. N` label in the accent color
- `width` — CSS width; `flat` drops the frame for transparent art
- the caption is a Markdown slot, so inline `$\ldots$` and emphasis render

---
layout: two-cols-header
cols: 1fr 1fr
---

# Continuous Corners · *Apple-style*

`corner-shape: squircle` · large radius 22px · small radius 14px

::left::

<Pad type="theorem" name="Ring" :number="1">

Filled Pad — tinted background defines the region; no outline ring, only a soft no-spread shadow.

</Pad>

<Pad type="theorem" border>

Outlined Pad — a real colored border traces the squircle evenly.

</Pad>

<div class="steps">
  <div class="step"><div class="step-n">1</div><div class="step-body">

Step card — 1px border + soft shadow.

  </div></div>
</div>

::right::

```python
# 21px squircle code frame
x = jnp.trace(obs @ rho)
```

Inline `code` and <kbd>Tab</kbd> use the small 14px radius.

| Surface | radius |
| --- | --- |
| Code · Table · Pad | 22px |
| Inline code · kbd | 14px |

---
layout: section
sectionNumber: §2
tags:
  - Teleportation
  - QKD
  - Protocols
---

# Applications

Quantum teleportation, quantum key distribution, and entanglement-assisted protocols.

::decoration::
<svg width="380" height="260" viewBox="0 0 380 260" fill="none" aria-hidden="true">
  <!-- 颜色走色板 token（SVG 属性位不能写 var()，改用 style）；mono 单强调色，vivid 回紫+玫红 -->
  <path d="M42 170 C96 70, 164 70, 218 170 S340 270, 360 128" style="stroke: var(--ket-deco-accent, #7229E8)" stroke-width="3" opacity=".95"/>
  <circle cx="42" cy="170" r="10" style="fill: var(--ket-ac-m, #8B3CF7)"/>
  <circle cx="218" cy="170" r="10" style="fill: var(--ket-ac-m, #8B3CF7)"/>
  <circle cx="360" cy="128" r="10" style="fill: var(--ket-deco-accent-alt, #E11D48)"/>
  <path d="M82 204 H298" style="stroke: var(--ket-ac-bd, #C4B5FD)" stroke-width="2" stroke-dasharray="7 7"/>
  <circle cx="190" cy="204" r="46" style="stroke: var(--ket-ac-bd, #C4B5FD)" stroke-width="2"/>
</svg>
::

---

# Evidence · *XCard / XFan*

<div class="lead-slot">
  <p v-click="[0, 3]">Community voices, stacked as they arrive.</p>
  <p v-click="3">One card per claim — the fan recomputes for any card count.</p>
</div>

<XFan>
  <XCard name="AliceRF" handle="@alice" time="11h">

Frontier models seem extremely well suited to generate workshop-style papers.

  </XCard>
  <XCard name="Bob Q." handle="@bobq" time="Jul 21" verified>

**THIS IS NOT A PAPER ON ARXIV!** Start the discussion, not another preprint.

  </XCard>
  <XCard name="Carol Expt" handle="@carlhe" time="Jul 22">

My agents are proving theorems I've wanted for years. <span class="hl">One-shot a good paper.</span>

  </XCard>
</XFan>

<!-- XFan computes the fan transforms from the card count (no nth-child CSS);
     each card reveals on its own click. `.hl` is the marker-pen highlight. -->

---

# Emphasis · *Keyword / Lead / Claim*

<p class="claim">A claim line opens the argument: one sentence, `1.15rem`, tone-one color.</p>

<div class="lead-slot">
  <p v-click="[1, 2]">The lead slot swaps lines on click — <span class="kw-danger">crisis</span> first.</p>
  <p v-click="[2, 3]">Then the <span class="kw-gold">way out</span>.</p>
  <p v-click="3">Then the <span class="kw-blue">accumulation</span> of knowledge.</p>
</div>

Keyword tones: <span class="kw-danger">danger</span> · <span class="kw-gold">gold</span> ·
<span class="kw-blue">blue</span> · <span class="kw-green">green</span> ·
<span class="kw-violet">violet</span> — all with `.dark` variants.

---

# §2 · Applications · *Protocol Steps*

<div class="steps">
  <div class="step"><div class="step-n">1</div><div class="step-body">

**Entangle.** Alice applies CNOT and Hadamard gates to $|\psi\rangle\otimes A'$.

  </div></div>
  <div class="step"><div class="step-n">2</div><div class="step-body">

**Measure.** Alice measures in the computational basis and obtains $m\in\{00,01,10,11\}$.

  </div></div>
  <div class="step"><div class="step-n">3</div><div class="step-body">

**Communicate.** Alice sends two classical bits to Bob through a channel limited by $c$.

  </div></div>
  <div class="step"><div class="step-n">4</div><div class="step-body">

**Correct.** Bob applies the corresponding Pauli operator from $\{I,X,Z,XZ\}$.

  </div></div>
</div>

<p style="margin-top: 1rem;">
  <span class="badge badge-v">SVD-based proof</span>
  <span class="badge badge-g">Dark-mode ready</span>
  <span class="badge badge-b">Quantum template</span>
</p>

---
class: centered
---

# PaperCover · *Academic Cover*

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
class: centered
---

# PaperCover · *Deco Mode*

<PaperCover
  deco
  title="Cloning is as Hard as Learning"
  subtitle="A compact paper-title layout with a faint Bloch-sphere watermark"
  :authors="[
    { name: 'Alice', mark: '1' },
    { name: 'Bob', mark: '2' },
  ]"
  :affiliations="[
    { mark: '1', text: 'Department A, University X' },
    { mark: '2', text: 'Department B, University Y' },
  ]"
  title-size="2.15rem"
/>

---
layout: two-cols-header
---

# Lists · *Quiet Hierarchy*

::left::

- Main evidence stays readable.
  - Secondary evidence uses a quieter marker.
    - Supporting detail keeps the same text size.
- A longer item wraps beneath its own text rather than beneath the bullet, preserving a clean hanging alignment.

::right::

1. Prepare the argument.
   1. Check the assumptions.
      1. Verify the conclusion.

2. Communicate the result.

   A second paragraph keeps its spacing within the same item.

---
layout: thanks
---

# Thanks For Your Attention

Quantum-style closing slide · Gradient title mirroring the cover
