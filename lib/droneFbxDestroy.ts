import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

type Phase = "idle" | "shoot" | "destroy" | "pause" | "rebuild";

const T_SHOOT = 0.35;
const T_DESTROY = 4;
const T_PAUSE = 4.5;
const T_END = 8.5;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

interface BodyParticle {
  home: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  size: number;
  delay: number;
}

interface Spark {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
}

export interface DroneFbxHandle {
  dispose: () => void;
}

export function initDroneFbxDestroy(container: HTMLDivElement): DroneFbxHandle {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 35);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = "crosshair";

  scene.add(new THREE.AmbientLight(0xffffff, 5.5));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x112233, 3));
  const dirLight = new THREE.DirectionalLight(0xffffff, 10);
  dirLight.position.set(15, 45, 25);
  scene.add(dirLight);

  const droneGroup = new THREE.Group();
  scene.add(droneGroup);

  const meshes: THREE.Mesh[] = [];
  const propellers: THREE.Mesh[] = [];
  let fbxRoot: THREE.Group | null = null;

  let phase: Phase = "idle";
  let cycleT = 0;
  let hoverT = 0;
  let mouseX = 0;
  let mouseY = 0;
  let hitWorld = new THREE.Vector3();
  let hitDir = new THREE.Vector3(0, 0, -1);
  const frozenPos = new THREE.Vector3();
  const frozenRot = new THREE.Euler();

  const bodyParticles: BodyParticle[] = [];
  let debrisPoints: THREE.Points | null = null;
  let debrisGeo: THREE.BufferGeometry | null = null;

  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  );
  scene.add(flash);
  const flashLight = new THREE.PointLight(0xffaa66, 0, 8, 3);
  scene.add(flashLight);

  const sparkMax = 120;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkMax * 3);
  const sparkCol = new Float32Array(sparkMax * 3);
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3));
  scene.add(
    new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  const sparks: Spark[] = [];

  // Фоновые частицы и дым (как в оригинальном page.tsx)
  const bgGeo = new THREE.BufferGeometry();
  const bgCount = 2000;
  const bgPos = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount * 3; i++) bgPos[i] = (Math.random() - 0.5) * 60;
  bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
  const bgParticles = new THREE.Points(
    bgGeo,
    new THREE.PointsMaterial({ size: 0.03, color: 0xffffff, transparent: true, opacity: 0.4 })
  );
  scene.add(bgParticles);

  const ambientSmoke: THREE.Sprite[] = [];
  const smokeLoader = new THREE.TextureLoader();
  smokeLoader.load("https://threejs.org/examples/textures/sprites/smoke.png", (tex) => {
    for (let i = 0; i < 80; i++) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.05, depthWrite: false });
      const spr = new THREE.Sprite(mat);
      spr.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20);
      const sc = Math.random() * 8 + 4;
      spr.scale.set(sc, sc, sc);
      ambientSmoke.push(spr);
      scene.add(spr);
    }
  });

  const smokeGroup = new THREE.Group();
  scene.add(smokeGroup);
  const smokeSprites: THREE.Sprite[] = [];
  const smokeTex = (() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(200,200,200,0.55)");
    g.addColorStop(1, "rgba(60,60,60,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  let animId = 0;

  function isPropeller(name: string) {
    return (
      name.includes("prop") ||
      name.includes("rotor") ||
      name.includes("blade") ||
      name.includes("fan") ||
      name.includes("motor")
    );
  }

  function spawnSparks(origin: THREE.Vector3, count: number, spread = 1.8) {
    for (let i = 0; i < count; i++) {
      const dir = hitDir
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            Math.random() * spread * 0.6,
            (Math.random() - 0.5) * spread
          )
        )
        .normalize();
      sparks.push({
        pos: origin.clone(),
        vel: dir.multiplyScalar(2.5 + Math.random() * 2),
        life: 0.25 + Math.random() * 0.15,
      });
    }
  }

  function spawnSmoke(origin: THREE.Vector3) {
    for (let i = 0; i < 18; i++) {
      const mat = new THREE.SpriteMaterial({
        map: smokeTex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const spr = new THREE.Sprite(mat);
      spr.position.copy(origin).add(
        new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.6)
      );
      spr.scale.setScalar(0.6);
      spr.userData = { vel: new THREE.Vector3(0, 0.02, 0), grow: 0.015, life: 2.5, age: 0 };
      smokeGroup.add(spr);
      smokeSprites.push(spr);
    }
  }

  function sampleMeshesToParticles() {
    bodyParticles.length = 0;
    fbxRoot?.updateMatrixWorld(true);

    const allMeshes = [...meshes, ...propellers];
    const targetCount = 2800;
    const totalVerts = allMeshes.reduce((s, m) => s + m.geometry.attributes.position.count, 0);
    const stride = Math.max(1, Math.floor(totalVerts / targetCount));

    allMeshes.forEach((mesh) => {
      const posAttr = mesh.geometry.attributes.position as THREE.BufferAttribute;
      const col =
        mesh.material instanceof THREE.MeshBasicMaterial
          ? mesh.material.color
          : new THREE.Color(0xcccccc);

      for (let i = 0; i < posAttr.count; i += stride) {
        tmp.fromBufferAttribute(posAttr, i);
        tmp.applyMatrix4(mesh.matrixWorld);
        bodyParticles.push({
          home: tmp.clone(),
          pos: tmp.clone(),
          vel: new THREE.Vector3(),
          color: col.clone(),
          size: 0.06 + Math.random() * 0.05,
          delay: Math.random() * 0.45,
        });
      }
    });
  }

  function buildDebrisPoints() {
    if (debrisGeo) debrisGeo.dispose();
    debrisGeo = new THREE.BufferGeometry();
    const n = bodyParticles.length;
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const sizes = new Float32Array(n);

    bodyParticles.forEach((p, i) => {
      positions[i * 3] = p.pos.x;
      positions[i * 3 + 1] = p.pos.y;
      positions[i * 3 + 2] = p.pos.z;
      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
      sizes[i] = p.size;
    });

    debrisGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    debrisGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    debrisGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    if (debrisPoints) scene.remove(debrisPoints);
    debrisPoints = new THREE.Points(
      debrisGeo,
      new THREE.PointsMaterial({
        size: 0.11,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );
    scene.add(debrisPoints);
  }

  function syncDebrisBuffer() {
    if (!debrisGeo) return;
    const pos = debrisGeo.attributes.position as THREE.BufferAttribute;
    const col = debrisGeo.attributes.color as THREE.BufferAttribute;
    bodyParticles.forEach((p, i) => {
      pos.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
      col.setXYZ(i, p.color.r, p.color.g, p.color.b);
    });
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  function setMeshesVisible(v: boolean) {
    meshes.forEach((m) => (m.visible = v));
    propellers.forEach((m) => (m.visible = v));
  }

  function burstParticles() {
    sampleMeshesToParticles();
    buildDebrisPoints();
    setMeshesVisible(false);
    if (debrisPoints) debrisPoints.visible = true;

    bodyParticles.forEach((p) => {
      const away = p.pos.clone().sub(hitWorld);
      if (away.lengthSq() < 0.01) away.set(Math.random() - 0.5, Math.random(), Math.random() - 0.5);
      away.normalize();
      const ak = hitDir.clone().multiplyScalar(3 + Math.random() * 2);
      p.vel.copy(away.multiplyScalar(1.2 + Math.random())).add(ak);
      p.vel.y += 0.8 + Math.random() * 1.2;
    });
  }

  function startShot(cx: number, cy: number) {
    if (phase !== "idle" || !fbxRoot) return;

    pointer.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const targets = [...meshes, ...propellers];
    const hits = raycaster.intersectObjects(targets, false);
    if (!hits.length) return;

    hitWorld.copy(hits[0].point);
    if (hits[0].face) {
      hitDir.copy(hits[0].face.normal).transformDirection(hits[0].object.matrixWorld).normalize();
    } else {
      hitDir.set((Math.random() - 0.5) * 0.3, 0.1, -1).normalize();
    }

    phase = "shoot";
    cycleT = 0;
    frozenPos.copy(droneGroup.position);
    frozenRot.copy(droneGroup.rotation);

    flash.position.copy(hitWorld);
    if (flash.material instanceof THREE.MeshBasicMaterial) flash.material.opacity = 1;
    flashLight.position.copy(hitWorld);
    flashLight.intensity = 18;

    spawnSparks(hitWorld, 100, 2.2);
    spawnSmoke(hitWorld);
    spawnSparks(hitWorld, 40, 1.5);
  }

  new FBXLoader().load(
    "/models/drone.fbx",
    (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 15 / Math.max(size.x, size.y, size.z);

      object.scale.set(scale, scale, scale);
      object.position.sub(center.multiplyScalar(scale));
      object.position.y += 10;

      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const name = child.name.toLowerCase();

        if (isPropeller(name)) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x555555,
            side: THREE.DoubleSide,
          });
          child.geometry.computeBoundingSphere();
          const c = child.geometry.boundingSphere?.center;
          if (c) {
            child.geometry.translate(-c.x, -c.y, -c.z);
            child.position.y += 0.19;
            child.position.z -= 0.35;
          }
          propellers.push(child);
        } else {
          child.material = new THREE.MeshBasicMaterial({
            color: 0xf0f0f0,
            side: THREE.DoubleSide,
          });
          meshes.push(child);
        }
      });

      fbxRoot = object;
      droneGroup.add(object);
    },
    undefined,
    (e) => console.error("drone.fbx:", e)
  );

  function updateSparks(dt: number) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].life -= dt;
      sparks[i].pos.addScaledVector(sparks[i].vel, dt);
      sparks[i].vel.y -= 5 * dt;
      if (sparks[i].life <= 0) sparks.splice(i, 1);
    }
    const pos = sparkGeo.attributes.position as THREE.BufferAttribute;
    const col = sparkGeo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < sparkMax; i++) {
      if (i < sparks.length) {
        pos.setXYZ(i, sparks[i].pos.x, sparks[i].pos.y, sparks[i].pos.z);
        const t = sparks[i].life / 0.4;
        col.setXYZ(i, 1, 0.35 + t * 0.4, t * 0.08);
      } else pos.setXYZ(i, 0, -999, 0);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  function updateSmoke(dt: number) {
    for (let i = smokeSprites.length - 1; i >= 0; i--) {
      const s = smokeSprites[i];
      const d = s.userData;
      d.age += dt;
      s.position.addScaledVector(d.vel, dt * 50);
      const sc = s.scale.x + d.grow;
      s.scale.setScalar(sc);
      if (s.material instanceof THREE.SpriteMaterial) {
        s.material.opacity = 0.45 * (1 - d.age / d.life);
      }
      if (d.age > d.life) {
        smokeGroup.remove(s);
        (s.material as THREE.Material).dispose();
        smokeSprites.splice(i, 1);
      }
    }
  }

  function applyFrozenTransform() {
    droneGroup.position.copy(frozenPos);
    droneGroup.rotation.copy(frozenRot);
  }

  function tickIdle(dt: number) {
    cycleT = 0;
    droneGroup.position.x = mouseX * 5;
    droneGroup.position.y = 8 - mouseY * 4;
    droneGroup.rotation.y += 0.012;
    droneGroup.rotation.x = Math.sin(hoverT * 1.5) * 0.02;
    droneGroup.rotation.z = Math.sin(hoverT * 1.2) * 0.015;

    setMeshesVisible(true);
    if (debrisPoints) debrisPoints.visible = false;

    propellers.forEach((p) => {
      p.rotation.y += 0.1;
    });
  }

  function tickShoot() {
    applyFrozenTransform();
    const f = Math.min(1, cycleT / 0.1);
    if (flash.material instanceof THREE.MeshBasicMaterial) flash.material.opacity = 1 - f;
    flashLight.intensity = 18 * (1 - f);
    if (cycleT >= T_SHOOT) {
      burstParticles();
      phase = "destroy";
    }
  }

  function tickDestroy(dt: number) {
    applyFrozenTransform();
    const t = (cycleT - T_SHOOT) / (T_DESTROY - T_SHOOT);
    const shrink = easeInOutCubic(Math.min(1, t / 0.75));

    bodyParticles.forEach((p) => {
      const localT = Math.max(0, (t - p.delay) / (1 - p.delay * 0.5));
      if (localT <= 0) return;
      p.pos.addScaledVector(p.vel, dt);
      p.vel.y -= 1.4 * dt;
      p.vel.multiplyScalar(0.988);
    });

    if (debrisPoints?.material instanceof THREE.PointsMaterial) {
      debrisPoints.material.opacity = THREE.MathUtils.lerp(1, 0.25, shrink);
      debrisPoints.material.size = THREE.MathUtils.lerp(0.11, 0.04, shrink);
    }

    if (t > 0.1 && Math.random() < 0.08) spawnSparks(hitWorld, 2, 1);

    syncDebrisBuffer();
    if (cycleT >= T_DESTROY) phase = "pause";
  }

  function tickPause() {
    applyFrozenTransform();
    if (cycleT >= T_PAUSE) phase = "rebuild";
  }

  function tickRebuild() {
    applyFrozenTransform();
    const t = (cycleT - T_PAUSE) / (T_END - T_PAUSE);
    const e = easeOutBack(Math.min(1, t));

    bodyParticles.forEach((p, i) => {
      const stagger = (i / bodyParticles.length) * 0.25;
      const pt = easeInOutCubic(Math.max(0, Math.min(1, (t - stagger) / (1 - stagger))));
      p.pos.lerp(p.home, 0.08 + pt * 0.35);
      p.vel.set(0, 0, 0);
      const bounce = pt > 0.92 ? Math.sin((pt - 0.92) * 40) * 0.02 * (1 - pt) : 0;
      p.pos.y += bounce;
    });

    if (debrisPoints?.material instanceof THREE.PointsMaterial) {
      debrisPoints.material.opacity = THREE.MathUtils.lerp(0.25, 1, e);
      debrisPoints.material.size = THREE.MathUtils.lerp(0.04, 0.11, e);
    }

    syncDebrisBuffer();

    if (t >= 0.98) {
      setMeshesVisible(true);
      if (debrisPoints) debrisPoints.visible = false;
      phase = "idle";
      cycleT = 0;
      propellers.forEach((p) => {
        p.rotation.y = 0;
      });
    }
  }

  const onClick = (e: MouseEvent) => startShot(e.clientX, e.clientY);
  const onMove = (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  renderer.domElement.addEventListener("click", onClick);
  window.addEventListener("mousemove", onMove);

  function frame() {
    animId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    hoverT += dt;
    if (phase !== "idle") cycleT += dt;

    switch (phase) {
      case "idle":
        tickIdle(dt);
        break;
      case "shoot":
        tickShoot();
        break;
      case "destroy":
        tickDestroy(dt);
        break;
      case "pause":
        tickPause();
        break;
      case "rebuild":
        tickRebuild();
        break;
    }

    bgParticles.rotation.y += 0.0004;
    ambientSmoke.forEach((s, i) => {
      s.position.y += 0.01;
      if (s.position.y > 20) s.position.y = -20;
      s.position.x += Math.sin(Date.now() * 0.0003 + i) * 0.002;
      if (s.material instanceof THREE.SpriteMaterial) s.material.rotation += 0.0003;
    });

    updateSparks(dt);
    updateSmoke(dt);
    renderer.render(scene, camera);
  }

  frame();

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  return {
    dispose: () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      debrisGeo?.dispose();
      bgGeo.dispose();
      ambientSmoke.forEach((s) => (s.material as THREE.Material).dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    },
  };
}
