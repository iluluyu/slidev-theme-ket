<template>
  <div class="cosmic-bg" :class="`cb-focus-${focus}`">
    <div ref="containerRef" class="cb-canvas-container" />
    <div class="cb-overlay" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, unref, watch, onMounted, onUnmounted } from 'vue'
import { useSlideContext } from '@slidev/client'
import { createFrameLoop, motionEnabled, renderProfile, renderResolution } from '../utils/cosmic-motion.mjs'
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
  /** Rendering budget; low keeps a light profile even on CPU-rendered WebGL. */
  quality?: 'auto' | 'low' | 'high'
  /** auto respects OS preferences; always explicitly opts into motion. */
  motion?: 'auto' | 'always' | 'never'
  /** Upper frame-rate bound, also limited by the quality budget. */
  maxFps?: number
  /** Extra pause control for embedding outside a live slide. */
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  innerColor: '#a0b3ff',
  outerColor: '#5a42cc',
  focus: 'right',
  speed: 1,
  interactive: false,
  stars: true,
  quality: 'auto',
  motion: 'auto',
  maxFps: 30,
  active: true,
})

const containerRef = ref<HTMLElement | null>(null)
const { $nav, $page, $renderContext, $scale, $zoom } = useSlideContext()
const slideActive = computed(() =>
  ['slide', 'presenter'].includes($renderContext.value)
  && unref($nav.value.currentPage) === $page.value
  && !unref($nav.value.isPrintMode)
)
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let frameLoop: ReturnType<typeof createFrameLoop> | null = null
const disposers: Array<() => void> = []

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
  const octs = [{ f: 8, a: 0.44 }, { f: 16, a: 0.27 }, { f: 32, a: 0.16 }, { f: 64, a: 0.09 }, { f: 128, a: 0.04 }]
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

// Canvas fallback shares exactly the same pause / motion / frame-rate policy.
function start2DFallback(container: HTMLElement) {
  const canvas = document.createElement('canvas')
  canvas.className = 'cb-canvas-inner'
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  let w = (canvas.width = container.clientWidth || 980)
  let h = (canvas.height = container.clientHeight || 552)
  const particles = Array.from({ length: 160 }, () => ({
    r: 30 + Math.random() * 260,
    angle: Math.random() * Math.PI * 2,
    speed: 0.005 + (1 - Math.random() * 0.8) * 0.02,
    size: 1 + Math.random() * 2.2,
    color: Math.random() > 0.4 ? props.innerColor : props.outerColor,
  }))

  function draw(dt: number) {
    if (!ctx) return
    ctx.fillStyle = 'rgba(5, 3, 15, 0.22)'
    ctx.fillRect(0, 0, w, h)
    const cx = w * (props.focus === 'left' ? 0.35 : props.focus === 'center' ? 0.5 : 0.65)
    const cy = h * 0.5
    for (const p of particles) {
      p.angle -= p.speed * props.speed * dt * 60
      p.r -= 0.15 * Math.abs(props.speed) * dt * 60
      if (p.r < 25) p.r = 280
      ctx.beginPath()
      ctx.arc(cx + Math.cos(p.angle) * p.r * 1.5, cy + Math.sin(p.angle) * p.r * 0.7, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }
  }
  return {
    draw,
    resize() {
      const newW = container.clientWidth, newH = container.clientHeight
      if (!newW || !newH || (newW === w && newH === h)) return
      w = canvas.width = newW
      h = canvas.height = newH
      draw(0)
    },
    dispose() { canvas.remove() },
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
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const reducedMotion = ref(media.matches)
  const visible = ref(false)
  const canRender = () => props.active && slideActive.value && visible.value && !document.hidden
  const canAnimate = () => motionEnabled(props.motion, reducedMotion.value, props.speed)
  const onMotionChange = (event: MediaQueryListEvent) => { reducedMotion.value = event.matches }
  const onVisibility = () => frameLoop?.sync({ redraw: true })
  media.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', onVisibility)
  disposers.push(
    () => media.removeEventListener('change', onMotionChange),
    () => document.removeEventListener('visibilitychange', onVisibility),
    watch([slideActive, visible, reducedMotion, () => props.motion, () => props.speed, () => props.active, () => props.maxFps],
      () => frameLoop?.sync({ redraw: true })),
  )
  const io = new IntersectionObserver(entries => {
    visible.value = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0)
  })
  io.observe(container)
  disposers.push(() => io.disconnect())
  const observeResize = (handleResize: () => void) => {
    const observer = new ResizeObserver(handleResize)
    observer.observe(container)
    window.addEventListener('resize', handleResize)
    disposers.push(() => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    })
  }

  let W = container.clientWidth || 980
  let H = container.clientHeight || 552
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: props.quality === 'high' ? 'high-performance' : 'low-power',
    })
  } catch {
    const fallback = start2DFallback(container)
    container.dataset.cosmicRenderer = 'canvas'
    frameLoop = createFrameLoop({
      draw: fallback.draw, canRender, canAnimate,
      fps: () => Math.min(24, Math.max(1, props.maxFps)),
    })
    fallback.draw(0)
    observeResize(fallback.resize)
    disposers.push(fallback.dispose)
    frameLoop.sync()
    return
  }

  const gl = renderer.getContext()
  const debug = gl.getExtension('WEBGL_debug_renderer_info')
  const rendererName = String(gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER))
  const budget = renderProfile(props.quality, rendererName)
  const maxDimension = Math.min(renderer.capabilities.maxTextureSize, ...gl.getParameter(gl.MAX_VIEWPORT_DIMS))
  const getResolution = (width: number, height: number) => renderResolution(
    budget, ($scale.value || 1) * ($zoom.value || 1), window.devicePixelRatio || 1,
    width, height, maxDimension,
  )
  let resolution = getResolution(W, H)
  container.dataset.cosmicRenderer = 'webgl'
  container.dataset.cosmicSoftware = String(budget.software)
  renderer.setPixelRatio(resolution.output)
  renderer.setSize(W, H)
  renderer.setClearColor(0x000000, 1)
  const canvasEl = renderer.domElement
  canvasEl.className = 'cb-canvas-inner'
  container.appendChild(canvasEl)

  const fps = () => Math.min(budget.fps, Number.isFinite(props.maxFps) ? Math.max(1, props.maxFps) : 30)

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
  const noiseTex = makeNoise(256)

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
  let starMaterial: THREE.RawShaderMaterial | null = null
  if (props.stars) {
    const N = budget.stars
    const pos = new Float32Array(N * 3)
    const sz = new Float32Array(N)
    const col = new Float32Array(N * 3)
    // Fixed sky across slides, reloads, and static exports.
    let seed = 1458
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296)
    for (let i = 0; i < N; i++) {
      const i3 = i * 3
      const th = random() * Math.PI * 2
      const ph = Math.acos(2 * random() - 1)
      pos[i3] = Math.cos(th) * Math.sin(ph) * 400
      pos[i3 + 1] = Math.sin(th) * Math.sin(ph) * 400
      pos[i3 + 2] = Math.cos(ph) * 400
      sz[i] = random()
      const brightness = 0.012 + 0.18 * sz[i] ** 6
      const warmth = random()
      col[i3] = brightness * (0.65 + 0.35 * warmth)
      col[i3 + 1] = brightness * 0.86
      col[i3 + 2] = brightness * (1 - 0.15 * warmth)
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
        uViewHeight: { value: Math.round(H * resolution.scene) },
        uSize: { value: 0.0027 }
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
          gl_PointSize=max(1.5,(0.32+0.68*aSize)*uSize*uViewHeight);
          vColor=aColor;
        }
      `,
      fragmentShader: `
        precision highp float;
        layout(location=0) out vec4 fragColor;
        in vec3 vColor;
        void main(){
          float d=length(gl_PointCoord-vec2(0.5));
          fragColor=vec4(vColor*(1.0-smoothstep(0.08,0.50,d)),1.0);
        }
      `
    })
    starMaterial = mat
    const pts = new THREE.Points(geo, mat)
    pts.frustumCulled = false
    spaceScene.add(pts)
  }

  // 2. Render the sparse sky and lens displacement into separate targets.
  const spaceTarget = new THREE.WebGLRenderTarget(Math.round(W * resolution.scene), Math.round(H * resolution.scene), {
    depthBuffer: false,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter
  })
  const distortionTarget = new THREE.WebGLRenderTarget(Math.max(1, Math.round(W * resolution.lens)), Math.max(1, Math.round(H * resolution.lens)), {
    // Keep depth for the upper arc; the foreground plane blends into it at the join.
    depthBuffer: true,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
    format: THREE.RedFormat,
    type: THREE.FloatType
  })

  const lensNormal = new THREE.Vector3()
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
      depthTest: false,
      depthWrite: false,
      uniforms: { uLensNormal: { value: lensNormal } },
      vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        in vec3 position;
        in vec2 uv;
        out vec2 vUv;
        out vec3 vWorld;
        void main(){
          vec4 world=modelMatrix*vec4(position,1.0);
          vWorld=world.xyz;
          vUv=uv;
          gl_Position=projectionMatrix*viewMatrix*world;
        }
      `,
      fragmentShader: `
        precision highp float;
        in vec2 vUv;
        in vec3 vWorld;
        uniform vec3 uLensNormal;
        layout(location=0) out vec4 fragColor;
        void main(){
          float d=length(vUv-0.5);
          float s=1.0-smoothstep(0.0,0.15,d);
          float alpha=1.0-smoothstep(0.4,0.5,d);
          // Replace the depth-test cutoff with a continuous transition in world space.
          // A positive distance is the part of the disc in front of the upper lens.
          float front=smoothstep(-0.80,1.15,dot(vWorld,uLensNormal));
          fragColor=vec4(s,0.0,0.0,alpha*front);
        }
      `
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.scale.set(10, 10, 10)
    mesh.rotation.x = Math.PI * 0.5
    mesh.renderOrder = 1 // Composite after the camera-facing lens, regardless of sort order.
    distortionScene.add(mesh)
  }

  // 3. Evaluate the disc at the lensed output pixel, not in the space texture.
  // The lens magnifies parts of the disc: upsampling a pre-rendered disc here
  // would also magnify its texels and soften the bright edge of the shadow.
  let finalMaterial: THREE.RawShaderMaterial
  const outputSize = new THREE.Vector2()
  {
    finalMaterial = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uSpaceTexture: { value: spaceTarget.texture },
        uDistortionTexture: { value: distortionTarget.texture },
        uBlackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
        uInvOutput: { value: new THREE.Vector2() },
        uSupersample: { value: false },
        uClipToWorld: { value: new THREE.Matrix4() },
        uEye: { value: camera.position },
        uTime: { value: 0 },
        uNoiseTexture: { value: noiseTex },
        uInnerColor: { value: innerColor },
        uOuterColor: { value: outerColor }
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
        precision highp float;
        in vec2 vUv;
        uniform sampler2D uSpaceTexture;
        uniform sampler2D uDistortionTexture;
        uniform vec2 uBlackHolePosition;
        uniform vec2 uInvOutput;
        uniform bool uSupersample;
        uniform mat4 uClipToWorld;
        uniform vec3 uEye;
        uniform float uTime;
        uniform sampler2D uNoiseTexture;
        uniform vec3 uInnerColor;
        uniform vec3 uOuterColor;
        layout(location=0) out vec4 fragColor;

        float discNoise(vec2 uv,float radialFrequency,vec2 angleSlope,vec2 radialSlope){
          return textureGrad(uNoiseTexture,uv,
            vec2(angleSlope.x,radialSlope.x*radialFrequency),
            vec2(angleSlope.y,radialSlope.y*radialFrequency)).r;
        }

        vec2 lensedUv(vec2 uv){
          float distortion=textureLod(uDistortionTexture,uv,0.0).r;
          return uv-2.0*distortion*(uv-uBlackHolePosition);
        }

        vec2 discPosition(vec2 uv,out bool hitsDisc){
          // Unproject onto the flat annulus (world Y=0, radii 1 to 5).
          vec4 nearPoint=uClipToWorld*vec4(uv*2.0-1.0,-1.0,1.0);
          vec3 ray=nearPoint.xyz-uEye*nearPoint.w;
          float vertical=ray.y<0.0 ? min(ray.y,-0.00001) : max(ray.y,0.00001);
          hitsDisc=ray.y*uEye.y<0.0;
          return uEye.xz-ray.xz*(uEye.y/vertical);
        }

        float shadowDistance(vec2 uv){
          bool hit;
          vec2 pos=discPosition(lensedUv(uv),hit);
          return hit ? (length(pos)-1.0)*0.25 : 1.0;
        }

        float edgeTap(vec2 uv,float width,float offset){
          return smoothstep(-width,width,shadowDistance(uv)+offset);
        }

        float shadowCoverage(vec2 uv,float r,float pixel,float footprint){
          if(abs(r)>5.735*pixel) return step(0.0,r);

          // Regularize the signed distance where the two lensed arcs meet.
          vec2 x=vec2(3.5*uInvOutput.x,0.0);
          vec2 y=vec2(0.0,3.5*uInvOutput.y);
          float xp=shadowDistance(uv+x), xm=shadowDistance(uv-x);
          float yp=shadowDistance(uv+y), ym=shadowDistance(uv-y);
          float nearby=(xp+xm+yp+ym)*0.25;
          // Symmetric differences keep the coverage width steadier as the
          // moving rim crosses the GPU's 2x2 derivative groups.
          float localPixel=0.5*footprint*length(vec2(xp-xm,yp-ym))/7.0;
          float width=clamp(max(2.9*localPixel,2.05*pixel),0.00001,0.042);
          float offset=clamp(0.82*(nearby-r),-1.45*pixel,1.45*pixel);

          // Re-evaluate the lensed geometry at eight subpixel positions near
          // the silhouette. Texture filtering still uses the original footprint.
          vec2 dx=uInvOutput*footprint;
          vec2 a=dx*vec2(0.4375,0.1875);
          vec2 b=dx*vec2(-0.1875,0.4375);
          vec2 c=dx*vec2(0.3125,-0.3125);
          vec2 d=dx*vec2(0.0625,0.0625);
          float w=0.74*width;
          return (edgeTap(uv+a,w,offset)+edgeTap(uv-a,w,offset)+edgeTap(uv+b,w,offset)+edgeTap(uv-b,w,offset)
                + edgeTap(uv+c,w,offset)+edgeTap(uv-c,w,offset)+edgeTap(uv+d,w,offset)+edgeTap(uv-d,w,offset))*0.125;
        }

        vec3 accretionDisc(vec2 screenUv,vec2 uv,out float skyVisibility){
          bool hitsDisc;
          vec2 pos=discPosition(uv,hitsDisc);
          float radius=length(pos);
          float r=(radius-1.0)*0.25;
          vec2 radialSlope=vec2(dFdx(r),dFdy(r));
          vec2 tangent=vec2(pos.y,-pos.x)*(0.15915494/max(dot(pos,pos),0.00001));
          // Differentiate position, not atan: its wrap would create a blurred seam.
          vec2 angleSlope=vec2(dot(tangent,dFdx(pos)),dot(tangent,dFdy(pos)));
          float footprint=uSupersample ? 0.5 : 1.0;
          angleSlope*=footprint;
          radialSlope*=footprint;
          float pixel=clamp(0.5*(abs(radialSlope.x)+abs(radialSlope.y)),0.00001,0.024);
          skyVisibility=hitsDisc ? shadowCoverage(screenUv,r,pixel,footprint) : 1.0;
          if(!hitsDisc || skyVisibility<=0.0 || r > 1.0+pixel) return vec3(0.0);

          // Coherent filaments shear at different rates instead of scattering
          // bright point sprites over the disc. The mapping repeats at 2π.
          float a=atan(pos.x,pos.y)*0.15915494;
          float falloff=exp(-2.65*max(0.0,r));
          // Keep shear bounded in long-running decks so fine detail stays readable.
          float shear=0.29*sin(1.6*uTime);
          float flow=a+0.58*uTime+shear*falloff+0.18*r;
          vec2 flowSlope=angleSlope+(0.18-2.65*shear*falloff)*radialSlope;
          float broad=discNoise(vec2(flow,r*1.45),1.45,flowSlope,radialSlope);
          float threads=discNoise(vec2(flow+0.17,r*7.0),7.0,flowSlope,radialSlope);
          float grain=discNoise(vec2(flow+0.39,r*17.0),17.0,flowSlope,radialSlope);
          float fineWeight=1.0-smoothstep(0.0008,0.0045,pixel);
          float textureLight=0.10+0.64*smoothstep(0.20,0.76,broad)
                                 +0.34*smoothstep(0.26,0.74,threads);
          textureLight*=1.0+0.42*fineWeight*(2.0*grain-1.0);

          // A single directional highlight separates the bright crescent from
          // the dark side. The broad blue-violet skirt fades to space.
          vec2 view=uEye.xz/max(length(uEye.xz),0.001);
          float facing=dot(vec2(-pos.y,pos.x)/max(radius,0.001),view);
          float key=smoothstep(-0.62,0.96,facing);
          float density=falloff*(1.0-smoothstep(0.54,1.0,r));
          vec3 tint=mix(uInnerColor,uOuterColor,smoothstep(0.0,0.56,r));
          float lane=(1.0-smoothstep(0.012,0.080,abs(r-0.15+(broad-0.5)*0.055)));
          vec3 disc=tint*density*(textureLight+0.46*key*lane)*mix(0.32,2.62,key);

          // Put the brightest part just outside the silhouette, not at the join.
          float rim=mix(0.76,1.0,smoothstep(0.0,0.013,r))*(1.0-smoothstep(0.010,0.032+pixel,r));
          float sheen=0.65+0.35*threads;
          vec3 metal=mix(uInnerColor,vec3(dot(uInnerColor,vec3(0.2126,0.7152,0.0722))),0.30);
          return disc + metal*rim*sheen*mix(0.16,4.12,key*key);
        }

        vec3 shade(vec2 uv){
          vec2 dUv=lensedUv(uv);
          float skyVisibility;
          vec3 disc=accretionDisc(uv,dUv,skyVisibility);
          vec3 light=disc+texture(uSpaceTexture,dUv).rgb;
          vec3 color=1.0-exp(-light*1.24);
          vec3 srgb=mix(12.92*color,1.055*pow(color,vec3(1.0/2.4))-0.055,step(0.0031308,color));
          // The display-space silhouette ramp stays even when the bright rim
          // hits the tone map's shoulder; the nearby disc texture is untouched.
          return srgb*skyVisibility;
        }

        void main(){
          vec3 color;
          if (uSupersample) {
            // Rotated four-sample grid resolves diagonal edges and thin strands.
            vec2 a=uInvOutput*vec2(0.375,0.125);
            vec2 b=uInvOutput*vec2(-0.125,0.375);
            color=(shade(vUv+a)+shade(vUv-a)+shade(vUv+b)+shade(vUv-b))*0.25;
          } else {
            color=shade(vUv);
          }
          fragColor=vec4(color,1.0);
        }
      `
    })
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMaterial)
    plane.frustumCulled = false
    finalScene.add(plane)
  }

  function updateOutputSampling() {
    renderer!.getDrawingBufferSize(outputSize)
    finalMaterial.uniforms.uInvOutput.value.set(1 / outputSize.x, 1 / outputSize.y)
    finalMaterial.uniforms.uSupersample.value = resolution.supersample
  }
  updateOutputSampling()

  const screenPos = new THREE.Vector3()
  let elapsed = 0
  const orbitRadius = Math.hypot(camPos.x, camPos.z)
  const heroAngle = Math.atan2(camPos.x, camPos.z)
  const orbitY = camPos.y

  function renderFrame(dt = 0) {
    elapsed += props.speed * dt
    if (controls) {
      controls.autoRotate = canAnimate()
      controls.autoRotateSpeed = 0.2 * props.speed
      controls.update(dt)
    } else {
      const orbitAngle = heroAngle + 0.07 * Math.sin(elapsed * 0.32)
      camera.position.set(Math.sin(orbitAngle) * orbitRadius, orbitY, Math.cos(orbitAngle) * orbitRadius)
      camera.lookAt(camTarget)
    }
    finalMaterial.uniforms.uTime.value = elapsed * 0.12
    camera.updateMatrixWorld()
    finalMaterial.uniforms.uClipToWorld.value.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse)
    distortionActiveMesh.lookAt(camera.position)
    lensNormal.copy(camera.position).normalize()
    screenPos.set(0, 0, 0).project(camera)
    finalMaterial.uniforms.uBlackHolePosition.value.set(screenPos.x * 0.5 + 0.5, screenPos.y * 0.5 + 0.5)
    renderer!.setRenderTarget(spaceTarget)
    renderer!.render(spaceScene, camera)
    renderer!.setRenderTarget(distortionTarget)
    renderer!.render(distortionScene, camera)
    renderer!.setRenderTarget(null)
    renderer!.render(finalScene, orthoCamera)
  }

  // Static first frame for export / overview, but never autoplay those contexts.
  renderFrame(0)
  frameLoop = createFrameLoop({
    draw: renderFrame, canRender, canAnimate,
    fps,
  })
  frameLoop.sync()
  if (controls) {
    const onControlChange = () => frameLoop?.sync({ redraw: true })
    controls.addEventListener('change', onControlChange)
    disposers.push(() => controls?.removeEventListener('change', onControlChange))
  }

  function handleResize() {
    const newW = container!.clientWidth, newH = container!.clientHeight
    if (!newW || !newH) return
    const next = getResolution(newW, newH)
    if (newW === W && newH === H && next.output === resolution.output) return
    W = newW
    H = newH
    if (next.output !== resolution.output) renderer!.setPixelRatio(next.output)
    resolution = next
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    renderer!.setSize(W, H)
    updateOutputSampling()
    spaceTarget.setSize(Math.round(W * resolution.scene), Math.round(H * resolution.scene))
    distortionTarget.setSize(Math.max(1, Math.round(W * resolution.lens)), Math.max(1, Math.round(H * resolution.lens)))
    if (starMaterial) starMaterial.uniforms.uViewHeight.value = spaceTarget.height
    renderFrame(0)
  }
  observeResize(handleResize)
  disposers.push(watch([$scale, $zoom], handleResize, { flush: 'post' }))

  disposers.push(() => {
    const geometries = new Set<THREE.BufferGeometry>()
    const materials = new Set<THREE.Material>()
    for (const scene of [spaceScene, distortionScene, finalScene]) {
      scene.traverse(object => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) geometries.add(mesh.geometry)
        if (mesh.material) {
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material)
        }
      })
    }
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    noiseTex.dispose()
    spaceTarget.dispose()
    distortionTarget.dispose()
  })
})

onUnmounted(() => {
  frameLoop?.dispose()
  for (const dispose of disposers.reverse()) dispose()
  controls?.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
    renderer = null
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
    radial-gradient(circle at 66% 47%, transparent 20%, rgba(4, 3, 10, 0.08) 49%, rgba(4, 3, 10, 0.32) 100%),
    linear-gradient(90deg, rgba(5, 4, 12, 0.80) 0%, rgba(5, 4, 12, 0.42) 34%, rgba(5, 4, 12, 0.06) 63%, transparent 78%),
    linear-gradient(180deg, rgba(4, 3, 8, 0.12) 0%, transparent 58%, rgba(4, 3, 9, 0.22) 100%);
}

.cb-focus-left .cb-overlay {
  background:
    radial-gradient(circle at 34% 47%, transparent 20%, rgba(4, 3, 10, 0.08) 49%, rgba(4, 3, 10, 0.32) 100%),
    linear-gradient(270deg, rgba(5, 4, 12, 0.80) 0%, rgba(5, 4, 12, 0.42) 34%, rgba(5, 4, 12, 0.06) 63%, transparent 78%),
    linear-gradient(180deg, rgba(4, 3, 8, 0.12) 0%, transparent 58%, rgba(4, 3, 9, 0.22) 100%);
}

.cb-focus-center .cb-overlay {
  background:
    radial-gradient(circle at 50% 47%, transparent 20%, rgba(4, 3, 10, 0.08) 49%, rgba(4, 3, 10, 0.32) 100%),
    linear-gradient(180deg, rgba(4, 3, 8, 0.12) 0%, transparent 58%, rgba(4, 3, 9, 0.22) 100%);
}

</style>
