"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
<<<<<<< HEAD
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
=======
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
>>>>>>> 77a6ac9c345543452ab32f5e41841ae457b43a27
import { ApplicationForm } from "@/components/ApplicationForm";

type FragmentData = {
  mesh: THREE.Mesh;

  originalPosition: THREE.Vector3;
  currentPosition: THREE.Vector3;
  explodedPosition: THREE.Vector3;

  velocity: THREE.Vector3;
  rotationVelocity: THREE.Vector3;

  originalRotation: THREE.Euler;

  offset: number;
};

export default function Home() {
  const [showTop, setShowTop] = useState(false);

  const [openGuide, setOpenGuide] = useState(false);
  const [openBenefits, setOpenBenefits] = useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const mountRef =
    useRef<HTMLDivElement | null>(null);

  const cursorRef =
    useRef<HTMLDivElement | null>(null);

  // =========================
  // THREE REFS
  // =========================

  const droneGroupRef = useRef(
    new THREE.Group()
  );

  const propellersRef = useRef<
    THREE.Mesh[]
  >([]);

  const fragmentsRef = useRef<
    FragmentData[]
  >([]);

  const bulletsRef = useRef<
    THREE.Mesh[]
  >([]);

  const hitSparksRef = useRef<
    THREE.Points[]
  >([]);

  const animationStateRef = useRef<
    "idle" | "explode" | "rebuild"
  >("idle");

  const transitionRef = useRef(0);

  const mobileMenuRef = useRef(false);

  useEffect(() => {
    mobileMenuRef.current = mobileMenu;
  }, [mobileMenu]);

  // =========================
  // SCROLL
  // =========================

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
    };

    window.addEventListener(
      "scroll",
      onScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

  // =========================
  // CURSOR
  // =========================

  useEffect(() => {
    const moveCursor = (
      e: MouseEvent
    ) => {
      if (!cursorRef.current) return;

      cursorRef.current.style.left =
        `${e.clientX}px`;

      cursorRef.current.style.top =
        `${e.clientY}px`;
    };

    window.addEventListener(
      "mousemove",
      moveCursor
    );

    return () =>
      window.removeEventListener(
        "mousemove",
        moveCursor
      );
  }, []);

  // =========================
  // THREE
  // =========================

  useEffect(() => {
    if (!mountRef.current) return;

    const loadFallback = window.setTimeout(
      () => setLoading(false),
      10000
    );

    // =========================================================
    // SCENE
    // =========================================================

    const scene = new THREE.Scene();

    scene.fog = new THREE.FogExp2(
      0x040404,
      0.011
    );

    // =========================================================
    // CAMERA
    // =========================================================

    const camera =
      new THREE.PerspectiveCamera(
        50,
        window.innerWidth /
          window.innerHeight,
        0.1,
        2000
      );

    camera.position.set(0, 20, 35);

    // =========================================================
    // RENDERER
    // =========================================================

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference:
          "high-performance",
      });

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.5
      )
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.4;

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    mountRef.current.appendChild(
      renderer.domElement
    );

    // Не перехватывать тачи/клики: иначе canvas перекрывает весь экран и
    // мобильное меню и кнопки под фоном не нажимаются.
    renderer.domElement.style.pointerEvents =
      "none";
    renderer.domElement.style.touchAction =
      "none";
    renderer.domElement.style.userSelect =
      "none";

    // =========================================================
    // LIGHTS
    // =========================================================

    scene.add(
      new THREE.AmbientLight(
        0xffffff,
        2.5
      )
    );

    const hemi =
      new THREE.HemisphereLight(
        0xffffff,
        0x0b1020,
        3
      );

    scene.add(hemi);

    const dirLight =
      new THREE.DirectionalLight(
        0xffffff,
        7
      );

    dirLight.position.set(
      20,
      35,
      15
    );

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width =
      2048;

    dirLight.shadow.mapSize.height =
      2048;

    scene.add(dirLight);

    const rim = new THREE.PointLight(
      0x88ccff,
      45,
      120
    );

    rim.position.set(-20, 18, -20);

    scene.add(rim);

    // =========================================================
    // PARTICLES
    // =========================================================

    const bgGeometry =
      new THREE.BufferGeometry();

    const bgCount = 2400;

    const bgPositions =
      new Float32Array(bgCount * 3);

    for (
      let i = 0;
      i < bgCount * 3;
      i++
    ) {
      bgPositions[i] =
        (Math.random() - 0.5) * 120;
    }

    bgGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        bgPositions,
        3
      )
    );

    const bgMaterial =
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      });

    const bgParticles =
      new THREE.Points(
        bgGeometry,
        bgMaterial
      );

    scene.add(bgParticles);

    // =========================================================
    // FOG SMOKE
    // =========================================================

    const smokeTexture =
      new THREE.TextureLoader().load(
        "https://threejs.org/examples/textures/sprites/smoke.png"
      );

    const fogParticles: THREE.Sprite[] =
      [];

    for (let i = 0; i < 160; i++) {
      const smoke = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: smokeTexture,
          transparent: true,
          opacity:
            Math.random() * 0.06 +
            0.025,
          color: new THREE.Color(
            0xdde7ff
          ),
        })
      );

      smoke.position.set(
        (Math.random() - 0.5) * 90,
        Math.random() * 40 - 15,
        (Math.random() - 0.5) * 90
      );

      const scale =
        Math.random() * 16 + 14;

      smoke.scale.set(scale, scale, 1);

      (smoke as any).speed =
        Math.random() * 0.01 +
        0.002;

      (smoke as any).drift =
        Math.random() * 0.002 +
        0.0005;

      fogParticles.push(smoke);

      scene.add(smoke);
    }

    // =========================================================
    // DRONE GROUP
    // =========================================================

    const droneGroup =
      droneGroupRef.current;

    scene.add(droneGroup);

    // =========================================================
    // CREATE FRAGMENTS
    // =========================================================

    const createFragments = (
      object: THREE.Group
    ) => {
      const fragments: FragmentData[] =
        [];

      object.traverse((child) => {
        if (
          !(child instanceof THREE.Mesh)
        )
          return;

        const geometry =
          child.geometry.clone();

        const position =
          geometry.attributes.position;

        for (
          let i = 0;
          i < position.count;
          i += 42
        ) {
          const vertex =
            new THREE.Vector3(
              position.getX(i),
              position.getY(i),
              position.getZ(i)
            );

          vertex.applyMatrix4(
            child.matrixWorld
          );

          const rand = Math.random();

          let geo: THREE.BufferGeometry;

          if (rand > 0.66) {
            geo = new THREE.BoxGeometry(
              Math.random() * 1 + 0.45,
              Math.random() * 0.35 +
                0.16,
              Math.random() * 1 + 0.45
            );
          } else if (rand > 0.33) {
            geo =
              new THREE.OctahedronGeometry(
                Math.random() * 0.35 +
                  0.22
              );
          } else {
            geo =
              new THREE.TetrahedronGeometry(
                Math.random() * 0.35 +
                  0.22
              );
          }

          const mat =
            new THREE.MeshPhysicalMaterial(
              {
                color:
                  Math.random() > 0.85
                    ? 0x777777
                    : 0xf5f5f5,

                metalness: 1,

                roughness: 0.12,

                clearcoat: 1,

                clearcoatRoughness:
                  0.03,

                envMapIntensity: 3,
              }
            );

          const mesh =
            new THREE.Mesh(
              geo,
              mat
            );

          mesh.castShadow = true;
          mesh.receiveShadow = true;

          mesh.position.copy(vertex);

          mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );

          mesh.visible = false;

          scene.add(mesh);

          fragments.push({
            mesh,

            originalPosition:
              vertex.clone(),

            currentPosition:
              vertex.clone(),

            explodedPosition:
              vertex.clone(),

            velocity:
              new THREE.Vector3(),

            rotationVelocity:
              new THREE.Vector3(),

            originalRotation:
              mesh.rotation.clone(),

            offset:
              Math.random() *
              Math.PI *
              2,
          });
        }
      });

      fragmentsRef.current =
        fragments;
    };

    // =========================================================
    // =========================================================
// LOAD DRONE
// =========================================================

const loader = new FBXLoader();

loader.load(
  "/models/drone.fbx",

  (object) => {
    console.log("✅ Модель дрона загружена!");

    const box =
      new THREE.Box3().setFromObject(
        object
      );

    const center =
      box.getCenter(
        new THREE.Vector3()
      );

    const size = box.getSize(
      new THREE.Vector3()
    );

    // КРУПНЕЕ ДРОН
    const scale =
      15 /
      Math.max(
        size.x,
        size.y,
        size.z
      );

    object.scale.set(
      scale,
      scale,
      scale
    );

    // ЦЕНТРОВКА
    object.position.sub(
      center.multiplyScalar(scale)
    );

    // ВЫШЕ НА ЭКРАНЕ
    object.position.y += 10;

    object.updateMatrixWorld(true);

    object.traverse((child) => {
      if (
        child instanceof THREE.Mesh
      ) {
        const name =
          child.name.toLowerCase();

        // ПРОПЕЛЛЕРЫ
        if (
          name.includes("prop") ||
          name.includes("rotor") ||
          name.includes("blade") ||
          name.includes("fan") ||
          name.includes("motor")
        ) {
          child.material =
            new THREE.MeshBasicMaterial({
              color: 0x555555,
              side: THREE.DoubleSide,
            });

          // ЦЕНТРОВКА ЛОПАСТЕЙ
          child.geometry.computeBoundingSphere();

          const c =
            child.geometry
              .boundingSphere?.center;

          if (c) {
            child.geometry.translate(
              -c.x,
              -c.y,
              -c.z
            );

            child.position.y += 0.19;
            child.position.z -= 0.35;
          }

          propellersRef.current.push(
            child
          );
        } else {
          // ОСНОВНОЙ КОРПУС
          child.material =
            new THREE.MeshBasicMaterial({
              color: 0xf0f0f0,
              side: THREE.DoubleSide,
            });
        }

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    droneGroup.add(object);

    object.updateMatrixWorld(
      true
    );

    createFragments(object);

    window.clearTimeout(loadFallback);
    setLoading(false);
  },

  undefined,

  (err) => {
    console.error(
      "❌ Ошибка загрузки FBX:",
      err
    );
    window.clearTimeout(loadFallback);
    setLoading(false);
  }
);

    // =========================================================
    // MOUSE
    // =========================================================

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (
      e: MouseEvent
    ) => {
      mouseX =
        (e.clientX /
          window.innerWidth -
          0.5) *
        2;

      mouseY =
        (e.clientY /
          window.innerHeight -
          0.5) *
        2;
    };

    window.addEventListener(
      "mousemove",
      onMouseMove
    );

    // =========================================================
    // DESTROY
    // =========================================================

    const destroyDrone = () => {
      if (
        animationStateRef.current !==
        "idle"
      )
        return;

      animationStateRef.current =
        "explode";

      transitionRef.current = 0;

      droneGroup.visible = false;

      const fragments =
        fragmentsRef.current;

      fragments.forEach((f) => {
        f.mesh.visible = true;

        f.currentPosition.copy(
          f.originalPosition
        );

        const direction =
          new THREE.Vector3(
            (Math.random() - 0.5) *
              2,
            (Math.random() - 0.5) *
              2,
            (Math.random() - 0.5) *
              2
          ).normalize();

        const force =
          0.5 +
          Math.random() * 0.9;

        f.velocity.copy(
          direction.multiplyScalar(
            force
          )
        );

        f.rotationVelocity.set(
          (Math.random() - 0.5) *
            0.05,
          (Math.random() - 0.5) *
            0.05,
          (Math.random() - 0.5) *
            0.05
        );
      });
    };

    // =========================================================
    // SHOOT
    // =========================================================

    const raycaster =
      new THREE.Raycaster();

    const mouse =
      new THREE.Vector2();

    const shoot = (
      clientX: number,
      clientY: number
    ) => {
      if (
        animationStateRef.current !==
        "idle"
      )
        return;

      mouse.x =
        (clientX /
          window.innerWidth) *
          2 -
        1;

      mouse.y =
        -(clientY /
          window.innerHeight) *
          2 +
        1;

      raycaster.setFromCamera(
        mouse,
        camera
      );

      const intersects =
        raycaster.intersectObject(
          droneGroup,
          true
        );

      if (intersects.length > 0) {
        const hitPoint =
          intersects[0].point;

        const startPos =
          new THREE.Vector3();

        raycaster.ray.at(
          8,
          startPos
        );

        const bulletGeo =
          new THREE.SphereGeometry(
            0.13,
            8,
            8
          );

        const bulletMat =
          new THREE.MeshBasicMaterial(
            {
              color: 0xff2222,
            }
          );

        const bullet =
          new THREE.Mesh(
            bulletGeo,
            bulletMat
          );

        bullet.position.copy(startPos);

        scene.add(bullet);

        bulletsRef.current.push(
          bullet
        );

        const distance =
          startPos.distanceTo(
            hitPoint
          );

        let travel = 0;

        const speed = 60;

        const bulletInterval =
          setInterval(() => {
            travel += 0.016;

            const progress =
              Math.min(
                (travel * speed) /
                  distance,
                1
              );

            bullet.position.lerpVectors(
              startPos,
              hitPoint,
              progress
            );

            if (progress >= 1) {
              clearInterval(
                bulletInterval
              );

              const sparksCount = 30;

              const sparksPos =
                new Float32Array(
                  sparksCount * 3
                );

              const sparksCol =
                new Float32Array(
                  sparksCount * 3
                );

              for (
                let i = 0;
                i < sparksCount * 3;
                i += 3
              ) {
                sparksPos[i] =
                  hitPoint.x +
                  (Math.random() - 0.5) *
                    2.2;

                sparksPos[i + 1] =
                  hitPoint.y +
                  (Math.random() - 0.5) *
                    2.2;

                sparksPos[i + 2] =
                  hitPoint.z +
                  (Math.random() - 0.5) *
                    1.8;

                const c =
                  Math.random() * 0.6 +
                  0.4;

                sparksCol[i] = 1;
                sparksCol[i + 1] = c;
                sparksCol[i + 2] = 0;
              }

              const sparksGeo =
                new THREE.BufferGeometry();

              sparksGeo.setAttribute(
                "position",
                new THREE.BufferAttribute(
                  sparksPos,
                  3
                )
              );

              sparksGeo.setAttribute(
                "color",
                new THREE.BufferAttribute(
                  sparksCol,
                  3
                )
              );

              const sparks =
                new THREE.Points(
                  sparksGeo,
                  new THREE.PointsMaterial(
                    {
                      size: 0.5,
                      vertexColors: true,
                      transparent: true,
                      opacity: 1,
                    }
                  )
                );

              scene.add(sparks);

              hitSparksRef.current.push(
                sparks
              );

              scene.remove(bullet);

              bulletsRef.current =
                bulletsRef.current.filter(
                  (b) => b !== bullet
                );

              destroyDrone();
            }
          }, 16);
      }
    };

    const onShoot = (
      clientX: number,
      clientY: number
    ) => {
      shoot(clientX, clientY);
    };

    const isInteractiveTarget = (
      target: EventTarget | null
    ) => {
      const el = target as
        | HTMLElement
        | null;

      return Boolean(
        el?.closest(
          "button, a, input, textarea, select, label, header, nav, [role='button'], [data-ui-interactive], .glass-card"
        )
      );
    };

    const onClick = (e: MouseEvent) => {
      if (
        window.matchMedia(
          "(max-width: 767px)"
        ).matches
      ) {
        return;
      }

      if (isInteractiveTarget(e.target)) {
        return;
      }

      onShoot(e.clientX, e.clientY);
    };

    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (
        window.matchMedia(
          "(min-width: 768px)"
        ).matches
      ) {
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (
        window.matchMedia(
          "(min-width: 768px)"
        ).matches
      ) {
        return;
      }

      if (mobileMenuRef.current) {
        return;
      }

      if (isInteractiveTarget(e.target)) {
        return;
      }

      const touch =
        e.changedTouches[0];

      if (!touch) return;

      const moved = Math.hypot(
        touch.clientX - touchStartX,
        touch.clientY - touchStartY
      );

      if (moved > 14) return;

      onShoot(
        touch.clientX,
        touch.clientY
      );
    };

    window.addEventListener(
      "click",
      onClick
    );

    document.addEventListener(
      "touchstart",
      onTouchStart,
      { passive: true }
    );

    document.addEventListener(
      "touchend",
      onTouchEnd,
      { passive: true }
    );

    // =========================================================
    // ANIMATE
    // =========================================================

    let frame = 0;

    let animationFrameId: number;

    const animate = () => {
      animationFrameId =
        requestAnimationFrame(
          animate
        );

      frame += 0.01;

      // =====================================================
      // DRONE FLOATING
      // =====================================================

      if (
        animationStateRef.current ===
        "idle"
      ) {
        droneGroup.position.x +=
          (mouseX * 4 -
            droneGroup.position.x) *
          0.03;

        droneGroup.position.y +=
          (8 -
            mouseY * 2.5 -
            droneGroup.position.y) *
          0.03;

        droneGroup.rotation.y +=
          0.003;

        droneGroup.rotation.x =
          Math.sin(frame) * 0.035;

        droneGroup.rotation.z =
          Math.sin(frame * 0.7) *
          0.025;
      }

      // =====================================================
      // EXPLOSION
      // =====================================================

      const fragments =
        fragmentsRef.current;

      if (
        animationStateRef.current ===
        "explode"
      ) {
        transitionRef.current +=
          0.008;

        fragments.forEach((f) => {
          f.currentPosition.add(
            f.velocity
          );

          f.velocity.multiplyScalar(
            0.993
          );

          f.currentPosition.x +=
            Math.sin(
              transitionRef.current *
                3 +
                f.offset
            ) * 0.018;

          f.currentPosition.y +=
            Math.cos(
              transitionRef.current *
                2.5 +
                f.offset
            ) * 0.014;

          f.currentPosition.z +=
            Math.cos(
              transitionRef.current *
                3 +
                f.offset
            ) * 0.018;

          f.mesh.position.copy(
            f.currentPosition
          );

          f.mesh.rotation.x +=
            f.rotationVelocity.x;

          f.mesh.rotation.y +=
            f.rotationVelocity.y;

          f.mesh.rotation.z +=
            f.rotationVelocity.z;
        });

        if (
          transitionRef.current >
          1.8
        ) {
          fragments.forEach((f) => {
            f.explodedPosition.copy(
              f.currentPosition
            );
          });

          animationStateRef.current =
            "rebuild";

          transitionRef.current = 0;
        }
      }

      // =====================================================
      // REBUILD
      // =====================================================

      if (
        animationStateRef.current ===
        "rebuild"
      ) {
        transitionRef.current +=
          0.01;

        const t = Math.min(
          transitionRef.current,
          1
        );

        const ease =
          1 -
          Math.pow(1 - t, 4);

        fragments.forEach(
          (f, i) => {
            f.currentPosition.lerpVectors(
              f.explodedPosition,
              f.originalPosition,
              ease
            );

            const spiralStrength =
              (1 - ease) * 4;

            const spiralX =
              Math.cos(
                i * 0.22 + t * 6
              ) * spiralStrength;

            const spiralY =
              Math.sin(
                i * 0.18 + t * 5
              ) *
              spiralStrength *
              0.3;

            const spiralZ =
              Math.sin(
                i * 0.22 + t * 6
              ) * spiralStrength;

            f.mesh.position.set(
              f.currentPosition.x +
                spiralX,

              f.currentPosition.y +
                spiralY,

              f.currentPosition.z +
                spiralZ
            );

            f.mesh.rotation.x +=
              (f.originalRotation.x -
                f.mesh.rotation.x) *
              0.05;

            f.mesh.rotation.y +=
              (f.originalRotation.y -
                f.mesh.rotation.y) *
              0.05;

            f.mesh.rotation.z +=
              (f.originalRotation.z -
                f.mesh.rotation.z) *
              0.05;
          }
        );

        if (t >= 1) {
          fragments.forEach((f) => {
            f.mesh.visible = false;

            f.mesh.position.copy(
              f.originalPosition
            );
          });

          droneGroup.visible = true;

          animationStateRef.current =
            "idle";
        }
      }

      // =====================================================
      // PROPELLERS
      // =====================================================

      propellersRef.current.forEach(
        (prop) => {
          prop.rotation.y += 0.42;
        }
      );

      // =====================================================
      // BACKGROUND
      // =====================================================

      bgParticles.rotation.y +=
        0.00012;

      fogParticles.forEach(
        (s, i) => {
          s.position.y +=
            (s as any).speed;

          if (s.position.y > 30)
            s.position.y = -20;

          s.position.x +=
            Math.sin(
              frame * 0.8 + i
            ) *
            (s as any).drift;

          if (
            s.material instanceof
            THREE.SpriteMaterial
          ) {
            s.material.rotation +=
              0.0003;
          }
        }
      );

      hitSparksRef.current.forEach(
        (s, i) => {
          if (
            s.material instanceof
            THREE.PointsMaterial
          ) {
            s.material.opacity -=
              0.045;

            s.scale.setScalar(
              s.scale.x * 0.94
            );

            if (
              s.material.opacity <= 0
            ) {
              scene.remove(s);

              hitSparksRef.current.splice(
                i,
                1
              );
            }
          }
        }
      );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // =========================================================
    // RESIZE
    // =========================================================

    const onResize = () => {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener(
      "resize",
      onResize
    );

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      window.clearTimeout(loadFallback);

      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      window.removeEventListener(
        "click",
        onClick
      );

      document.removeEventListener(
        "touchstart",
        onTouchStart
      );

      document.removeEventListener(
        "touchend",
        onTouchEnd
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      renderer.dispose();

      bgGeometry.dispose();

      bgMaterial.dispose();

      fogParticles.forEach((s) => {
        if (
          s.material instanceof
          THREE.Material
        ) {
          s.material.dispose();
        }
      });

      fragmentsRef.current.forEach(
        (f) => {
          f.mesh.geometry.dispose();

          if (
            Array.isArray(
              f.mesh.material
            )
          ) {
            f.mesh.material.forEach(
              (m) => m.dispose()
            );
          } else {
            f.mesh.material.dispose();
          }
        }
      );

      if (
        mountRef.current?.contains(
          renderer.domElement
        )
      ) {
        mountRef.current.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  // =========================
  // HELPERS
  // =========================

  const HEADER_OFFSET = 88;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    setMobileMenu(false);

    const top =
      el.getBoundingClientRect().top +
      window.scrollY -
      HEADER_OFFSET;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  };

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // STYLES
  // =========================

  const glass =
    "glass-card pointer-events-auto relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:bg-white/10 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-120%] hover:before:translate-x-[120%] before:transition before:duration-700";

  return (
    <main className="relative text-white min-h-screen md:cursor-none selection:bg-white selection:text-black">
      {/* LOADER — без exit-анимации: иначе невидимый слой блокирует тачи на iOS */}

      {loading && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />

          <div className="mt-8 tracking-[8px] text-white/60 text-sm">
            LOADING
          </div>
        </div>
      )}

      {/* Слой 0: Three.js — дрон и анимации (виден, не перехватывает клики) */}

      <div
        ref={mountRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden
      />

      {/* Слой 1: виньетки поверх дрона */}

      <div className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,0.84))]" />

      <div className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

      {/* CUSTOM CURSOR */}

      <div
        ref={cursorRef}
        className="fixed z-[9999] pointer-events-none hidden md:block"
        style={{
          transform:
            "translate(-50%, -50%)",
        }}
      >
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.7)]" />

          <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/90 -translate-x-1/2" />

          <div className="absolute top-1/2 left-0 h-[1px] w-full bg-white/90 -translate-y-1/2" />

          <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Слой 2: весь UI поверх — клики только по кнопкам/формам */}

      <div className="relative z-10 pointer-events-none">
      {/* Мобильное меню открыто — шторка поверх дрона, тачи в меню, не в дрон */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-[180] md:hidden pointer-events-auto bg-black/40"
          aria-hidden
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* NAV */}

      <header className="fixed top-0 left-0 right-0 w-full z-[200] pointer-events-auto backdrop-blur-xl bg-black/40 border-b border-white/10 touch-manipulation">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.h1
            whileHover={{
              scale: 1.05,
            }}
            className="tracking-[4px] font-bold text-lg"
          >
            CONTRACT
          </motion.h1>

          <nav className="hidden md:flex gap-8 text-white/60">
            {[
              "home",
              "conditions",
              "payments",
              "jobs",
              "regions",
              "faq",
              "contacts",
            ].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  scrollTo(id)
                }
                className="hover:text-white transition relative after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all cursor-pointer touch-manipulation"
              >
                {id === "home" &&
                  "Главная"}

                {id ===
                  "conditions" &&
                  "Условия"}

                {id ===
                  "payments" &&
                  "Выплаты"}

                {id === "jobs" &&
                  "Должности"}

                {id ===
                  "regions" &&
                  "Регионы"}

                {id === "faq" &&
                  "FAQ"}

                {id ===
                  "contacts" &&
                  "Контакты"}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://t.me/FmSn5"
              target="_blank"
              className="hidden md:flex px-5 py-2 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
            >
              Telegram
            </a>

            <button
              type="button"
              aria-label={
                mobileMenu
                  ? "Закрыть меню"
                  : "Открыть меню"
              }
              aria-expanded={mobileMenu}
              onClick={() =>
                setMobileMenu(
                  (open) => !open
                )
              }
              className="md:hidden relative z-[210] min-h-12 min-w-12 flex items-center justify-center text-3xl cursor-pointer touch-manipulation select-none"
            >
              {mobileMenu ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <nav className="md:hidden relative z-[210] border-t border-white/10 bg-black/95 backdrop-blur-xl pointer-events-auto">
            <div className="flex flex-col p-6 gap-2">
              {[
                ["Главная", "home"],
                ["Условия", "conditions"],
                ["Выплаты", "payments"],
                ["Должности", "jobs"],
                ["Регионы", "regions"],
                ["FAQ", "faq"],
                ["Контакты", "contacts"],
              ].map(([title, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    scrollTo(id)
                  }
                  className="text-left py-3 px-2 text-lg text-white/80 active:text-white cursor-pointer touch-manipulation min-h-12"
                >
                  {title}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}

      <section
        id="home"
        className="relative scroll-mt-24 pt-32 px-6 pb-24 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="pointer-events-none"
            initial={{
              opacity: 0,
              x: -60,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            <div className="mb-4 text-sm tracking-[6px] text-white/40">
              PREMIUM CONTRACT CENTER
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none">
              Контрактная
              <br />
              служба РФ
            </h1>

            <p className="text-white/50 mb-8 leading-relaxed text-lg max-w-xl">
              Консультации,
              оформление,
              сопровождение
              кандидатов, выплаты,
              должности и помощь на
              всех этапах.
            </p>

            <div
              className="flex gap-4 flex-wrap pointer-events-auto"
              data-ui-interactive
            >
              <motion.button
                type="button"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() =>
                  scrollTo(
                    "contacts"
                  )
                }
                className="px-7 py-4 bg-white text-black rounded-2xl font-bold touch-manipulation"
              >
                Оставить заявку
              </motion.button>

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() =>
                  setOpenGuide(
                    true
                  )
                }
                className="px-7 py-4 border border-white/20 rounded-2xl hover:bg-white/10 transition touch-manipulation"
              >
                Инструкция
              </motion.button>
            </div>

            {/* STATS */}

            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                [
                  "24/7",
                  "Поддержка",
                ],
                [
                  "1000+",
                  "Заявок",
                ],
                [
                  "Привет Женечка",
                  " ♥ ♥ ♥ ♥ ♥ ♥ ♥",
                ],
              ].map(
                ([num, text]) => (
                  <div
                    key={num}
                  className={glass + " p-5"}
                  >
                    <div className="text-3xl font-black">
                      {num}
                    </div>

                    <div className="text-white/50 text-sm mt-1">
                      {text}
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* QUICK FORM */}

          <motion.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className={
              glass +
              " pointer-events-auto touch-manipulation"
            }
            data-ui-interactive
          >
            <div className="p-8 relative z-10">
              <div className="mb-4 text-sm text-white/40 tracking-[3px]">
                QUICK FORM
              </div>

              <h3 className="text-2xl font-bold mb-6">
                Быстрая заявка
              </h3>

              <ApplicationForm source="quick" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONDITIONS */}

      <section
        id="conditions"
        className="relative scroll-mt-24 px-6 py-24 border-t border-white/10 pointer-events-none"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10">
            Условия службы
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-white/60">
            {[
              [
                "Этапы оформления",
                "Подача заявления → проверка документов → медкомиссия → контракт.",
              ],

              [
                "Контракт",
                "Контракт подписывается минимум на полгода.",
              ],

              [
                "Стаж",
                "Начисление стажа производится в соотношении 1 день за 2.",
              ],

              [
                "Льготы",
                "Нажмите чтобы узнать подробнее о выплатах.",
              ],
            ].map(
              ([title, text]) => (
                <motion.div
                  whileHover={{
                    y: -5,
                  }}
                  key={title}
                  className={
                    glass +
                    " p-8 cursor-pointer"
                  }
                  onClick={() =>
                    title ===
                      "Льготы" &&
                    setOpenBenefits(
                      true
                    )
                  }
                >
                  <h3 className="text-white text-xl font-semibold mb-3">
                    {title}
                  </h3>

                  <p>{text}</p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

       {/* PAYMENTS */}
      <section id="payments" className="relative scroll-mt-24 px-6 py-24 border-t border-white/10 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-10">Выплаты</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              ["Москва", "3 000 000 ₽"],
              ["Балашиха", "3 000 000 ₽"],
              ["Тверь", "2 400 000 ₽"],
              ["Воронеж", "2 500 000 ₽"],
              ["Иваново", "1 400 000 ₽ + участок"],
              ["Чебоксары", "2 500 000 ₽"],
              ["Набережные Челны", "2 900 000 ₽"],
              ["Саратов", "2 600 000 ₽"],
              ["Нижнекамск", "2 700 000 ₽"],
              ["Африка", "3 000 000 ₽"],
            ].map(([city, pay]) => (
              <div key={city} className={glass + " p-8"}>
                <h3 className="text-2xl font-bold mb-4">{city}</h3>
                <p className="text-white/60">{pay}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOBS */}
      <section id="jobs" className="relative scroll-mt-24 px-6 py-24 border-t border-white/10 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-10">Должности</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["Стрелок", "210 000 ₽"],
              ["Гранатометчик", "211 000 ₽"],
              ["Пулеметчик", "216 000 ₽"],
              ["Старший сапер", "216 000 ₽"],
              ["Старший телефонист", "224 000 ₽"],
              ["Командир отделения", "238 000 ₽"],
              ["Заместитель командира взвода", "250 000 ₽"],
            ].map(([job, salary]) => (
              <div key={job} className={glass + " p-6"}>
                <h3 className="text-xl font-bold mb-3">{job}</h3>
                <p className="text-white/60">{salary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGIONS */}
      <section id="regions" className="relative scroll-mt-24 px-6 py-24 border-t border-white/10 pointer-events-none">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10">Регионы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["Москва", "от 270 000 ₽"],
              ["Балашиха", "210 000 ₽"],
              ["Тверь", "210 000 ₽"],
              ["Нижний Новгород", "204 000 ₽"],
              ["Иваново", "204 000 ₽"],
              ["Воронеж", "210 000 ₽"],
              ["Нижнекамск", "210 000 ₽"],
              ["Чебоксары", "210 000 ₽"],
              ["Саратов", "210 000 ₽"],
              ["Африка", "230 000 ₽"],
            ].map(([city, price]) => (
              <div key={city} className={glass + " p-6"}>
                <h3 className="text-xl font-bold mb-3">{city}</h3>
                <p className="text-white/60">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* FAQ */}

      <section
        id="faq"
        className="relative scroll-mt-24 px-6 py-24 border-t border-white/10 pointer-events-none"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-10">
            FAQ
          </h2>

          <div className="space-y-5">
            {[
              [
                "Какие документы нужны?",
                "Паспорт, военный билет, ИНН и другие документы.",
              ],
              [
                "Сколько занимает оформление?",
                "В среднем от 1 до 7 дней.",
              ],
              [
                "Есть ли сопровождение?",
                "Да, консультант сопровождает на всех этапах.",
              ],
            ].map(
              ([q, a]) => (
                <div
                  key={q}
                  className={
                    glass + " p-6"
                  }
                >
                  <h3 className="text-xl font-bold mb-3">
                    {q}
                  </h3>

                  <p className="text-white/60">
                    {a}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>
      
      {/* CONTACTS */}
      <section id="contacts" className="relative scroll-mt-24 px-6 py-24 border-t border-white/10 text-center pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-none">
          <div
            className={
              glass +
              " p-10 mb-12 pointer-events-auto touch-manipulation"
            }
            data-ui-interactive
          >
            <h3 className="text-3xl font-bold mb-6">Оставить заявку</h3>
            <ApplicationForm
              source="contacts"
              showComment
            />
          </div>

          <h2 className="text-5xl font-black mb-6">Связаться</h2>
          <p className="text-white/50 mb-8">Telegram для консультации и подачи анкеты</p>
          <a
            href="https://t.me/FmSn5"
            target="_blank"
            className="px-10 py-5 bg-white text-black rounded-2xl font-bold hover:scale-105 transition inline-block pointer-events-auto touch-manipulation"
            data-ui-interactive
          >
            Написать в Telegram
          </a>
        </div>
      </section>

      {/* GUIDE MODAL */}
      <AnimatePresence>
        {openGuide && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[300] pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-2xl w-full pointer-events-auto"
            >
              <h2 className="text-2xl font-bold mb-4">Инструкция</h2>
              <p className="text-white/60 leading-relaxed">
                Подготовка документов → медкомиссия → подписание контракта → распределение.
              </p>
              <button
                onClick={() => setOpenGuide(false)}
                className="mt-6 px-6 py-3 bg-white text-black rounded-xl"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BENEFITS MODAL */}
      <AnimatePresence>
        {openBenefits && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[300] pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-3xl w-full pointer-events-auto"
            >
              <h2 className="text-2xl font-bold mb-6">Льготы и компенсации</h2>
              <div className="space-y-5 text-white/70 leading-relaxed">
                <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
                  <h3 className="text-white text-lg font-bold mb-2">Денежное довольствие</h3>
                  <p>При исполнении контракта военнослужащие каждый месяц получают денежное довольствие.</p>
                  <p className="mt-2">На сумму влияет звание, должность и выслуга лет.</p>
                </div>

                <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
                  <h3 className="text-white text-lg font-bold mb-2">Выплата при непригодности к службе</h3>
                  <p>Сумма пособия составляет <span className="text-white font-bold">3 439 562 ₽</span>.</p>
                </div>

                <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
                  <h3 className="text-white text-lg font-bold mb-2">Выплаты семье при гибели</h3>
                  <p>Размер составляет на 2026 год — <span className="text-white font-bold">5 000 000 ₽</span>.</p>
                </div>
              </div>

              <button
                onClick={() => setOpenBenefits(false)}
                className="mt-8 px-6 py-3 bg-white text-black rounded-xl"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BUTTON */}
      {showTop && (
        <button
          type="button"
          onClick={scrollTop}
          className="fixed z-[250] bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full hover:scale-110 transition flex items-center justify-center text-2xl pointer-events-auto touch-manipulation"
        >
          ↑
        </button>
      )}

      </div>
    </main>
  );
}
