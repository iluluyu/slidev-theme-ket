<template>
  <div class="cosmic-bg" :class="`cb-focus-${focus}`">
    <div ref="containerRef" class="cb-canvas-container" />
    <div class="cb-overlay" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface Props {
  /** Hot inner-accretion color. */
  innerColor?: string
  /** Cool outer-disk color. */
  outerColor?: string
  /** Where the hole sits; the text-safe gradient follows it. */
  focus?: 'right' | 'left' | 'center'
  /** Global motion multiplier (auto-rotate + disc flow). */
  speed?: number
  /** Enable drag/zoom orbit controls (off for presentations). */
  interactive?: boolean
  /** Render the far starfield. */
  stars?: boolean
  /** 'low' halves particle counts for weak GPUs / long decks. */
  quality?: 'auto' | 'low' | 'high'
}

const props = withDefaults(defineProps<Props>(), {
  innerColor: '#ff8080',
  outerColor: '#3633ff',
  focus: 'right',
  speed: 1,
  interactive: false,
  stars: true,
  quality: 'auto'
})

const containerRef = ref(null)

let animId: number | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let resizeObserver: ResizeObserver | null = null
let cleanupFallback: (() => void) | null = null

// Value-noise texture for the accretion disc shader (from AutoCover).
function makeNoise(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  function hash(x: number, y: number) {
    let h = (x * 374761393 + y * 668265263) | 0
    h = ((h ^ (h >> 13)) * 1274126177) | 0
    return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff
  }
  const sm = (t: number) => t * t * (3 - 2 * t)
  const mix = (a: number, b: number, t: number) => a + t * (b - a)
  const octs = [{ f: 8, a: 0.5 }, { f: 16, a: 0.3 }, { f: 32, a: 0.2 }]
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let v = 0
      for (const { f, a } of octs) {
        const gx = (px / size) * f
        const gy = (py / size) * f
        const ix = Math.floor(gx)
        const iy = Math.floor(gy)
        const fx = sm(gx - ix)
        const fy = sm(gy - iy)
        v += mix(
          mix(hash(ix % f, iy % f), hash((ix + 1) % f, iy % f), fx),
          mix(hash(ix % f, (iy + 1) % f), hash((ix + 1) % f, (iy + 1) % f), fx),
          fy
        ) * a
      }
      const idx = (py * size + px) * 4
      const pv = (Math.max(0, Math.min(1, v)) * 255) | 0
      img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = pv
      img.data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// 2D canvas fallback when WebGL is unavailable (particles in the prop colors).
function start2DFallback(container: HTMLElement): () => void {
  const canvas = document.createElement('canvas')
  canvas.className = 'cb-canvas-inner'
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  let w = (canvas.width = container.clientWidth || 980)
  let h = (canvas.height = container.clientHeight || 552)

  const c1 = props.innerColor
  const c2 = props.outerColor
  const particles: Array<{ r: number; angle: number; speed: number; size: number; color: string }> = []
  const N = 400
  for (let i = 0; i < N; i++) {
    particles.push({
      r: 30 + Math.random() * 260,
      angle: Math.random() * Math.PI * 2,
      speed: 0.005 + (1 - Math.random() * 0.8) * 0.02,
      size: 1 + Math.random() * 2.2,
      color: Math.random() > 0.4 ? c1 : c2
    })
  }

  let running = true
  function draw() {
    if (!running) return
    ctx.fillStyle = 'rgba(5, 3, 15, 0.22)'
    ctx.fillRect(0, 0, w, h)
    const cx = w * 0.65
    const cy = h * 0.5
    for (const p of particles) {
      p.angle -= p.speed * props.speed
      p.r -= 0.15
      if (p.r < 25) p.r = 280
      const x = cx + Math.cos(p.angle) * p.r * 1.5
      const y = cy + Math.sin(p.angle) * p.r * 0.7
      ctx.beginPath()
      ctx.arc(x, y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 8
      ctx.fill()
    }
    animId = requestAnimationFrame(draw)
  }
  draw()

  return () => {
    running = false
    if (animId !== null) cancelAnimationFrame(animId)
    canvas.remove()
  }
}

// Camera rig per focus; mirrors AutoCover's "hole right, text left" framing.
function cameraRig() {
  switch (props.focus) {
    case 'left':
      return { pos: new THREE.Vector3(-5.2, 2.6, 5.2), target: new THREE.Vector3(0.6, 0, 0) }
    case 'center':
      return { pos: new THREE.Vector3(0, 2.6, 7.3), target: new THREE.Vector3(0, 0, 0) }
    default:
      return { pos: new THREE.Vector3(5.2, 2.6, 5.2), target: new THREE.Vector3(-0.6, 0, 0) }
  }
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let W = container.clientWidth || 980
  let H = container.clientHeight || 552
  const PR = Math.min(window.devicePixelRatio || 1, 2)
  // Cap raw pixel budget on hi-dpi screens: the post-process chain samples 2x.
  const lowPower =
    props.quality === 'low' ||
    (props.quality === 'auto' && (window.devicePixelRatio || 1) >= 2)

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  } catch {
    cleanupFallback = start2DFallback(container)
    return
  }

  renderer.setSize(W, H)
  renderer.setPixelRatio(lowPower ? Math.min(PR, 1.5) : PR)
  renderer.setClearColor(0x000000, 1)
  const canvasEl = renderer.domElement
  canvasEl.className = 'cb-canvas-inner'
  container.appendChild(canvasEl)

  const { pos: camPos, target: camTarget } = cameraRig()
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000)
  camera.position.copy(camPos)
  camera.lookAt(camTarget)

  if (props.interactive) {
    controls = new OrbitControls(camera, canvasEl)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.2 * props.speed
    controls.target.copy(camTarget)
    controls.minDistance = 3
    controls.maxDistance = 30
    controls.update()
  }

  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  orthoCamera.position.z = 1

  const spaceScene = new THREE.Scene()
  const finalScene = new THREE.Scene()
  const distortionScene = new THREE.Scene()

  const innerColor = new THREE.Color(props.innerColor)
  const outerColor = new THREE.Color(props.outerColor)
  const noiseTex = makeNoise(128)

  const BASE_VERT = `
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    in vec3 position;
    in vec2 uv;
    out vec2 vUv;
    void main(){
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      vUv=uv;
    }
  `

  // 1. Starfield
  if (props.stars) {
    const N = lowPower ? 16000 : 40000
    const pos = new Float32Array(N * 3)
    const sz = new Float32Array(N)
    const col = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const i3 = i * 3
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos[i3] = Math.cos(th) * Math.sin(ph) * 400
      pos[i3 + 1] = Math.sin(th) * Math.sin(ph) * 400
      pos[i3 + 2] = Math.cos(ph) * 400
      sz[i] = Math.random()
      const c = new THREE.Color()
      c.setHSL(Math.random(), 1.0, 0.8)
      col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sz, 1))
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3))

    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uViewHeight: { value: H * 2 * PR },
        uSize: { value: 0.001 }
      },
      vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform float uViewHeight;
        uniform float uSize;
        in vec3 position;
        in float aSize;
        in vec3 aColor;
        out vec3 vColor;
        void main(){
          vec4 mv=modelViewMatrix*vec4(position,1.0);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=aSize*uSize*uViewHeight;
          vColor=aColor;
        }
      `,
      fragmentShader: `
        precision highp float;
        layout(location=0) out vec4 fragColor;
        in vec3 vColor;
        void main(){
          float d=length(gl_PointCoord-vec2(0.5));
          if(d>0.5) discard;
          fragColor=vec4(vColor,1.0);
        }
      `
    })
    const pts = new THREE.Points(geo, mat)
    pts.frustumCulled = false
    spaceScene.add(pts)
  }

  // 2. Accretion disc cylinder
  let discMaterial: THREE.RawShaderMaterial
  {
    const geo = new THREE.CylinderGeometry(5, 1, 0, 64, 10, true)
    discMaterial = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uNoiseTexture: { value: noiseTex },
        uInnerColor: { value: innerColor },
        uOuterColor: { value: outerColor }
      },
      vertexShader: BASE_VERT,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform sampler2D uNoiseTexture;
        uniform vec3 uInnerColor;
        uniform vec3 uOuterColor;
        in vec2 vUv;
        layout(location=0) out vec4 fragColor;

        float invLerp(float v,float lo,float hi){return(v-lo)/(hi-lo);}
        vec3 bAdd(vec3 b,vec3 a){return min(b+a,vec3(1.0));}

        void main(){
          vec4 col=vec4(0.0,0.0,0.0,1.0);
          float its=3.0;
          for(float i=0.0;i<its;i++){
            float p=i/(its-1.0);
            float inten=1.0-((vUv.y-p)*its)*0.5;
            inten=smoothstep(0.0,1.0,inten);
            vec2 uv=vUv;
            uv.y*=2.0;
            uv.x+=uTime/((i*10.0)+1.0);
            vec3 rc=mix(uInnerColor,uOuterColor,p);
            float n=texture(uNoiseTexture,uv).r;
            rc=mix(vec3(0.0),rc,n*inten);
            col.rgb=bAdd(col.rgb,rc);
          }
          float e=min(invLerp(vUv.y,0.0,0.02),invLerp(vUv.y,1.0,0.5));
          col.rgb=mix(vec3(0.0),col.rgb,e);
          fragColor=col;
        }
      `
    })
    spaceScene.add(new THREE.Mesh(geo, discMaterial))
  }

  // 3. Differential-rotation particle vortex
  let particleMaterial: THREE.RawShaderMaterial
  {
    const N = lowPower ? 20000 : 50000
    const dist = new Float32Array(N)
    const szArr = new Float32Array(N)
    const rnd = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      dist[i] = Math.random()
      szArr[i] = Math.random()
      rnd[i] = Math.random()
    }
    const angles = new Float32Array(N)
    const radii = new Float32Array(N)
    const speeds = new Float32Array(N)
    const cols = new Float32Array(N * 3)
    const FT = 10004.0
    for (let i = 0; i < N; i++) {
      const conc = 0.05
      let oP = THREE.MathUtils.smoothstep(dist[i], 0, 1)
      oP = conc + (oP - conc) * Math.pow(rnd[i], 1.7)
      const r = 1.0 + oP * 5.0
      const ang = oP - FT * (1.0 - oP) * 3.0
      angles[i] = ang
      radii[i] = r
      speeds[i] = (1.0 - oP) * 3.2 + 0.2
      cols[i * 3] = innerColor.r + (outerColor.r - innerColor.r) * oP
      cols[i * 3 + 1] = innerColor.g + (outerColor.g - innerColor.g) * oP
      cols[i * 3 + 2] = innerColor.b + (outerColor.b - innerColor.b) * oP
    }
    const pGeo = new THREE.BufferGeometry()
    const pos3 = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      pos3[i * 3] = Math.sin(angles[i]) * radii[i]
      pos3[i * 3 + 1] = 0
      pos3[i * 3 + 2] = Math.cos(angles[i]) * radii[i]
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos3, 3))
    pGeo.setAttribute('aAngle', new THREE.Float32BufferAttribute(angles, 1))
    pGeo.setAttribute('aRadius', new THREE.Float32BufferAttribute(radii, 1))
    pGeo.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1))
    pGeo.setAttribute('aSize', new THREE.Float32BufferAttribute(szArr, 1))
    pGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(cols, 3))

    particleMaterial = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        uViewHeight: { value: H * 2 * PR },
        uSize: { value: 0.015 },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform float uViewHeight;
        uniform float uSize;
        uniform float uTime;
        in float aAngle;
        in float aRadius;
        in float aSpeed;
        in float aSize;
        in vec3 aColor;
        out vec3 vColor;
        void main(){
          float ang = aAngle - uTime * aSpeed;
          vec3 pos = vec3(sin(ang) * aRadius, 0.0, cos(ang) * aRadius);
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uSize * uViewHeight * (1.0 / -mv.z);
          vColor = aColor;
        }
      `,
      fragmentShader: `
        precision highp float;
        layout(location=0) out vec4 fragColor;
        in vec3 vColor;
        void main(){
          float d = length(gl_PointCoord - vec2(0.5));
          if(d > 0.5) discard;
          fragColor = vec4(vColor, 0.65);
        }
      `
    })
    const pts = new THREE.Points(pGeo, particleMaterial)
    pts.frustumCulled = false
    spaceScene.add(pts)
  }

  // 4. Multi-pass render targets (space + gravitational-lens distortion)
  const spaceTarget = new THREE.WebGLRenderTarget(W * 2, H * 2, {
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter
  })
  const distortionTarget = new THREE.WebGLRenderTarget(Math.floor(W * 0.5), Math.floor(H * 0.5), {
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
    format: THREE.RedFormat,
    type: THREE.FloatType
  })

  let distortionActiveMesh: THREE.Mesh
  {
    const geo = new THREE.PlaneGeometry(1, 1)
    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {},
      vertexShader: BASE_VERT,
      fragmentShader: `
        precision highp float;
        in vec2 vUv;
        layout(location=0) out vec4 fragColor;
        float invLerp(float v,float lo,float hi){return(v-lo)/(hi-lo);}
        float remap(float v,float a,float b,float c,float d){return mix(c,d,invLerp(v,a,b));}
        void main(){
          float d=length(vUv-0.5);
          float s=remap(d,0.0,0.15,1.0,0.0);
          s=smoothstep(0.0,1.0,s);
          fragColor=vec4(s,1.0,1.0,1.0);
        }
      `
    })
    distortionActiveMesh = new THREE.Mesh(geo, mat)
    distortionActiveMesh.scale.set(10, 10, 10)
    distortionScene.add(distortionActiveMesh)
  }

  {
    const geo = new THREE.PlaneGeometry(1, 1)
    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {},
      vertexShader: BASE_VERT,
      fragmentShader: `
        precision highp float;
        in vec2 vUv;
        layout(location=0) out vec4 fragColor;
        float invLerp(float v,float lo,float hi){return(v-lo)/(hi-lo);}
        float remap(float v,float a,float b,float c,float d){return mix(c,d,invLerp(v,a,b));}
        void main(){
          float d=length(vUv-0.5);
          float s=remap(d,0.0,0.15,1.0,0.0);
          s=smoothstep(0.0,1.0,s);
          float alpha=smoothstep(0.0,1.0,remap(d,0.4,0.5,1.0,0.0));
          fragColor=vec4(s,0.0,0.0,alpha);
        }
      `
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.scale.set(10, 10, 10)
    mesh.rotation.x = Math.PI * 0.5
    distortionScene.add(mesh)
  }

  // Final composite: gravitational lensing + RGB-shift dispersion
  let finalMaterial: THREE.RawShaderMaterial
  {
    finalMaterial = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uSpaceTexture: { value: spaceTarget.texture },
        uDistortionTexture: { value: distortionTarget.texture },
        uBlackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
        uRGBShiftRadius: { value: 0.00001 }
      },
      vertexShader: `
        in vec3 position;
        in vec2 uv;
        out vec2 vUv;
        void main(){
          vUv=uv;
          gl_Position=vec4(position,1.0);
        }
      `,
      fragmentShader: `
        #define PI 3.1415926538
        precision highp float;
        in vec2 vUv;
        uniform sampler2D uSpaceTexture;
        uniform sampler2D uDistortionTexture;
        uniform vec2 uBlackHolePosition;
        uniform float uRGBShiftRadius;
        layout(location=0) out vec4 fragColor;

        vec3 rgbShift(sampler2D tex,vec2 uv,float r){
          vec3 ang=vec3(PI*2.0/3.0,PI*4.0/3.0,0.0);
          vec3 c;
          c.r=texture(tex,uv+vec2(sin(ang.r)*r,cos(ang.r)*r)).r;
          c.g=texture(tex,uv+vec2(sin(ang.g)*r,cos(ang.g)*r)).g;
          c.b=texture(tex,uv+vec2(sin(ang.b)*r,cos(ang.b)*r)).b;
          return c;
        }

        void main(){
          float distortion=texture(uDistortionTexture,vUv).r;
          vec2 toward=vUv-uBlackHolePosition;
          toward*=-distortion*2.0;
          vec2 dUv=vUv+toward;
          vec3 col=rgbShift(uSpaceTexture,dUv,uRGBShiftRadius);
          fragColor=vec4(col,1.0);
        }
      `
    })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMaterial)
    plane.frustumCulled = false
    finalScene.add(plane)
  }

  const screenPos = new THREE.Vector3()
  let discTime = 0
  // Manual slow orbit when not interactive (no event listeners on the canvas).
  const orbitRadius = Math.hypot(camPos.x, camPos.z)
  let orbitAngle = Math.atan2(camPos.x, camPos.z)
  const orbitY = camPos.y

  function renderFrame() {
    if (controls) {
      controls.update()
    } else {
      orbitAngle += 0.0006 * props.speed
      camera.position.set(
        Math.sin(orbitAngle) * orbitRadius,
        orbitY,
        Math.cos(orbitAngle) * orbitRadius
      )
      camera.lookAt(camTarget)
    }

    discTime += 0.002 * props.speed
    discMaterial.uniforms.uTime.value = discTime
    particleMaterial.uniforms.uTime.value = discTime

    distortionActiveMesh.lookAt(camera.position)
    screenPos.set(0, 0, 0).project(camera)
    finalMaterial.uniforms.uBlackHolePosition.value.set(
      screenPos.x * 0.5 + 0.5,
      screenPos.y * 0.5 + 0.5
    )

    renderer!.setRenderTarget(spaceTarget)
    renderer!.render(spaceScene, camera)
    renderer!.setRenderTarget(distortionTarget)
    renderer!.render(distortionScene, camera)
    renderer!.setRenderTarget(null)
    renderer!.render(finalScene, orthoCamera)
  }

  // Render one frame synchronously so PDF export / static capture that
  // fires before the first animation tick still gets a lit scene.
  renderFrame()

  // Pause the loop when the slide is off-screen or the tab is hidden:
  // decks keep every layout mounted, so an unwatched cover would otherwise
  // burn GPU for the whole presentation.
  let visible = true
  const io = new IntersectionObserver(entries => {
    visible = entries.some(e => e.isIntersecting)
    if (visible && animId === null && !reducedMotion) animId = requestAnimationFrame(animate)
  })
  io.observe(container)

  function animate() {
    animId = null
    if (!visible || reducedMotion) return
    renderFrame()
    animId = requestAnimationFrame(animate)
  }
  if (!reducedMotion) animId = requestAnimationFrame(animate)

  function handleResize() {
    if (!container) return
    const newW = container.clientWidth || 980
    const newH = container.clientHeight || 552
    if (newW === 0 || newH === 0) return
    W = newW
    H = newH
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    renderer!.setSize(W, H)
    spaceTarget.setSize(W * 2, H * 2)
    distortionTarget.setSize(Math.floor(W * 0.5), Math.floor(H * 0.5))
    renderFrame()
  }

  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container)
  window.addEventListener('resize', handleResize)

  onUnmounted(() => {
    io.disconnect()
  })
})

onUnmounted(() => {
  if (animId !== null) cancelAnimationFrame(animId)
  if (cleanupFallback) cleanupFallback()
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', () => {})
  if (controls) controls.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
})
</script>

<style scoped>
.cosmic-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #06050a;
}

.cb-canvas-container {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
}

:deep(.cb-canvas-inner) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

/* Text-protection gradients, oriented by focus. */
.cb-overlay {
  position: absolute;
  z-index: 2;
  inset: 0;
  pointer-events: none;
}

.cb-focus-right .cb-overlay {
  background:
    radial-gradient(circle at 66% 47%, transparent 20%, rgba(4, 3, 10, 0.13) 49%, rgba(4, 3, 10, 0.48) 100%),
    linear-gradient(90deg, rgba(5, 4, 12, 0.80) 0%, rgba(5, 4, 12, 0.42) 34%, rgba(5, 4, 12, 0.06) 63%, transparent 78%),
    linear-gradient(180deg, rgba(4, 3, 8, 0.12) 0%, transparent 58%, rgba(4, 3, 9, 0.30) 100%);
}

.cb-focus-left .cb-overlay {
  background:
    radial-gradient(circle at 34% 47%, transparent 20%, rgba(4, 3, 10, 0.13) 49%, rgba(4, 3, 10, 0.48) 100%),
    linear-gradient(270deg, rgba(5, 4, 12, 0.80) 0%, rgba(5, 4, 12, 0.42) 34%, rgba(5, 4, 12, 0.06) 63%, transparent 78%),
    linear-gradient(180deg, rgba(4, 3, 8, 0.12) 0%, transparent 58%, rgba(4, 3, 9, 0.30) 100%);
}

.cb-focus-center .cb-overlay {
  background:
    radial-gradient(circle at 50% 47%, transparent 20%, rgba(4, 3, 10, 0.13) 49%, rgba(4, 3, 10, 0.48) 100%),
    linear-gradient(180deg, rgba(4, 3, 8, 0.12) 0%, transparent 58%, rgba(4, 3, 9, 0.30) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .cosmic-bg {
    /* Frame is already rendered synchronously; nothing animates. */
  }
}
</style>
