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
  Quantum-style cover · section · Bra theorem/proof · table · code · footer progress
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

> Cover variants in this example: `cover`, `cover-deco`, `PaperCover`, and `PaperCover deco`.

---

# Overview · *Outline*

<div class="steps">
  <div class="step"><div class="step-n">1</div><div class="step-body"><strong>Mathematical framework</strong> — quantum states, density matrices, and von Neumann entropy.</div></div>
  <div class="step"><div class="step-n">2</div><div class="step-body"><strong>Main results</strong> — subadditivity, strong subadditivity, and Schmidt decomposition.</div></div>
  <div class="step"><div class="step-n">3</div><div class="step-body"><strong>Applications</strong> — teleportation, entanglement-assisted communication, and protocol costs.</div></div>
  <div class="step"><div class="step-n">4</div><div class="step-body"><strong>Design system</strong> — theorem boxes, tables, code, and page footer.</div></div>
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

<Bra type="theorem" name="No-Cloning" :number="1">

There is no unitary $U$ such that $U(|\psi\rangle|0\rangle)=|\psi\rangle|\psi\rangle$ holds for all non-orthogonal states $|\psi\rangle$. Quantum information cannot be duplicated.

</Bra>

<Bra type="definition" name="Von Neumann Entropy" :number="2">

For a quantum state $\rho$, the von Neumann entropy is
$S(\rho)=-\operatorname{Tr}(\rho\log_2\rho)=-\sum_i\lambda_i\log_2\lambda_i$.

</Bra>

<Bra type="proof">

由 $K_i^\dagger K_i$ 的半正定性即可得出完备性。Completeness follows from $\sum_i K_i^\dagger K_i=\mathbf{1}$. $\square$

</Bra>

---

# §1 · Main Results · *Proof Style*

<Bra type="theorem" name="Subadditivity" :number="3">

For a bipartite quantum state $\rho_{AB}$,
$$
S(\rho_{AB}) \le S(\rho_A)+S(\rho_B).
$$

</Bra>

<Bra type="proof">

The result follows by monotonicity of relative entropy under the partial trace. Equivalently, applying strong subadditivity to a purification of $\rho_{AB}$ yields the desired inequality. $\square$

</Bra>

<Bra type="corollary" name="Entanglement Entropy">

For a pure bipartite state $|\psi_{AB}\rangle$, $S(\rho_{AB})=0$ and $S(\rho_A)=S(\rho_B)$.

</Bra>

---

# Template · Design System · *Semantic Tones*

<div grid="~ cols-2 gap-3">

<Bra title="Theorem" tone="default">

主定理、核心结果，紫色高亮。

</Bra>

<Bra title="Definition" tone="primary">

定义、符号约定，蓝色强调。

</Bra>

<Bra title="Lemma" tone="success">

辅助性结论，绿色提示正向进展。

</Bra>

<Bra title="Remark" tone="warning">

补充说明和注意事项，琥珀色。

</Bra>

<Bra title="Corollary" tone="danger">

重要衍生结果，玫红色。

</Bra>

<Bra title="Proof" tone="muted">

证明过程和次要支撑信息，灰色。

</Bra>

</div>

---

# §2 · Method Comparison · *Table*

<div class="tbl-wrap">

| Method | Sample complexity | Quantum resource | Notes |
| --- | --- | --- | --- |
| **Tomography** | $O(d^4)$ | Classical measurement | Baseline with exponential overhead |
| **Classical shadows** | $O(d^2)$ | Random Clifford | Random measurement, quadratic gain |
| **Entangled measurement** | $O(d)$ | Auxiliary entanglement | Information-theoretic optimal rate |
| **Lower bound** | $\Omega(d)$ | Theoretical limit | Cannot be asymptotically improved |

</div>

<Bra type="remark">

Here $d=2^n$ is the Hilbert-space dimension of an $n$-qubit system. The entangled method reaches the information-theoretic lower bound.

</Bra>

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
  <path d="M42 170 C96 70, 164 70, 218 170 S340 270, 360 128" stroke="#7229E8" stroke-width="3" opacity=".95"/>
  <circle cx="42" cy="170" r="10" fill="#8B3CF7"/>
  <circle cx="218" cy="170" r="10" fill="#8B3CF7"/>
  <circle cx="360" cy="128" r="10" fill="#E11D48"/>
  <path d="M82 204 H298" stroke="#C4B5FD" stroke-width="2" stroke-dasharray="7 7"/>
  <circle cx="190" cy="204" r="46" stroke="#C4B5FD" stroke-width="2"/>
</svg>
::

---

# §2 · Applications · *Protocol Steps*

<div class="steps">
  <div class="step"><div class="step-n">1</div><div class="step-body"><strong>Entangle.</strong> Alice applies CNOT and Hadamard gates to $|\psi\rangle\otimes A'$.</div></div>
  <div class="step"><div class="step-n">2</div><div class="step-body"><strong>Measure.</strong> Alice measures in the computational basis and obtains $m\in\{00,01,10,11\}$.</div></div>
  <div class="step"><div class="step-n">3</div><div class="step-body"><strong>Communicate.</strong> Alice sends two classical bits to Bob through a channel limited by $c$.</div></div>
  <div class="step"><div class="step-n">4</div><div class="step-body"><strong>Correct.</strong> Bob applies the corresponding Pauli operator from $\{I,X,Z,XZ\}$.</div></div>
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
