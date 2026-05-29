"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Reveal } from "@/components/Reveal";
import { Stagger } from "@/components/Stagger";
import { AnimatedMoney } from "@/components/AnimatedMoney";
import { DocumentCard } from "@/components/DocumentCard";
import { LeaderboardBar } from "@/components/LeaderboardBar";
import { PhoneLink } from "@/components/PhoneLink";
import { Modal } from "@/components/Modal";
import { PersonalDataContent } from "@/components/PersonalDataContent";

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
  const [openSupport, setOpenSupport] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openAgreement, setOpenAgreement] = useState(false);
  const [openPdn, setOpenPdn] = useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [faqOpen, setFaqOpen] = useState<
    string | null
  >(null);

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
    const mq = window.matchMedia(
      "(min-width: 1280px) and (hover: hover) and (pointer: fine)"
    );

    const moveCursor = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    };

    const sync = () => {
      if (mq.matches) {
        window.addEventListener("mousemove", moveCursor);
      } else {
        window.removeEventListener("mousemove", moveCursor);
      }
    };

    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("mousemove", moveCursor);
    };
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
    // DRONE NAV LIGHTS (red/blue aviation)
    // =========================================================

    const navRed = new THREE.PointLight(
      0xff2244,
      0,
      25,
      2.2
    );

    const navBlue = new THREE.PointLight(
      0x2b74ff,
      0,
      25,
      2.2
    );

    const navRedMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xff2244,
        transparent: true,
        opacity: 0,
      })
    );

    const navBlueMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x2b74ff,
        transparent: true,
        opacity: 0,
      })
    );

    navRed.add(navRedMesh);
    navBlue.add(navBlueMesh);

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

    for (let i = 0; i < 380; i++) {
      const smoke = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: smokeTexture,
          transparent: true,
          opacity:
            Math.random() * 0.08 +
            0.035,
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

    // Attach nav lights to drone group (positions set after model load)
    droneGroup.add(navRed);
    droneGroup.add(navBlue);

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

    // NAV lights placement (approx. on left/right arms)
    navRed.position.set(-4.2, 10.2, 0.8);
    navBlue.position.set(4.2, 10.2, 0.8);

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
      // NAV LIGHTS BLINK
      // =====================================================

      const blink =
        (Math.sin(frame * 6.2) + 1) * 0.5;

      const redOn = blink > 0.55 ? 1 : 0;
      const blueOn = blink < 0.45 ? 1 : 0;

      navRed.intensity = redOn ? 9 : 0;
      navBlue.intensity = blueOn ? 9 : 0;

      if (
        navRedMesh.material instanceof
        THREE.MeshBasicMaterial
      ) {
        navRedMesh.material.opacity =
          redOn ? 0.95 : 0;
      }

      if (
        navBlueMesh.material instanceof
        THREE.MeshBasicMaterial
      ) {
        navBlueMesh.material.opacity =
          blueOn ? 0.95 : 0;
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
    <main
      className="relative text-white min-h-screen xl:cursor-none select-none"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
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
        className="mil-custom-cursor fixed z-[9999] pointer-events-none hidden xl:block"
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

      <div className="relative z-10 pointer-events-none min-w-0 max-w-[100vw] overflow-x-clip mil-safe-text">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2 min-w-0">
          <motion.h1
            whileHover={{
              scale: 1.05,
            }}
            className="tracking-[2px] sm:tracking-[4px] font-bold text-sm sm:text-lg shrink-0"
          >
            CONTRACT
          </motion.h1>

          <nav className="hidden md:flex flex-1 min-w-0 justify-center gap-3 lg:gap-6 xl:gap-8 text-white/60 text-xs sm:text-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              "home",
              "conditions",
              "payments",
              "jobs",
              "regions",
              "documents",
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

                {id ===
                  "documents" &&
                  "Документы"}

                {id === "faq" &&
                  "Вопросы"}

                {id ===
                  "contacts" &&
                  "Контакты"}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <PhoneLink className="text-xs text-white/60" />
              <a
                href="https://t.me/FmSn5"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 bg-white text-black rounded-xl font-semibold hover:scale-105 transition whitespace-nowrap shrink-0"
              >
                Telegram
              </a>
            </div>

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
                ["Документы", "documents"],
                ["Вопросы", "faq"],
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
        className="relative scroll-mt-24 pt-24 sm:pt-32 px-4 sm:px-6 pb-20 sm:pb-24 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto min-w-0 grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
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
              CONTRACT CENTER
            </div>

           <h1 className="text-3xl leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 break-words">
  Контрактная
  <br />

  <span className="inline-flex items-center gap-4">
    служба РФ

    <img
      src="/textures/russia-flag.png"
      alt="Флаг РФ"
      className="w-14 h-14 object-contain"
      draggable={false}
    />
  </span>
</h1>

            <p className="text-white/50 mb-8 leading-relaxed text-base sm:text-lg max-w-xl break-words">
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

            <Reveal className={glass + " p-5 mt-12 max-w-xs"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-3xl font-black">
                    24/7
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    Поддержка
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenSupport(true)}
                  className="pointer-events-auto w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xl font-bold flex items-center justify-center transition"
                  aria-label="Открыть подробности поддержки"
                  data-ui-interactive
                >
                  +
                </button>
              </div>
            </Reveal>
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
              <h3 className="text-2xl font-bold mb-6">
                Быстрая заявка
              </h3>

              <ApplicationForm
                source="quick"
                onOpenPersonalData={() => setOpenPdn(true)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONDITIONS */}

      <section
        id="conditions"
        className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 pointer-events-none mil-divider"
      >
        <div className="max-w-6xl mx-auto min-w-0">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 break-words">
              Условия службы
            </h2>
          </Reveal>

          <Stagger className="grid md:grid-cols-2 gap-6 text-white/60">
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
                <Reveal
                  key={title}
                  className={
                    glass +
                    " p-8" +
                    (title === "Льготы"
                      ? " cursor-pointer pointer-events-auto hover:bg-white/10"
                      : "")
                  }
                  onClick={() => {
                    if (title === "Льготы") setOpenBenefits(true);
                  }}
                  data-ui-interactive={
                    title === "Льготы" ? true : undefined
                  }
                >
                  <h3 className="text-white text-xl font-semibold mb-3">
                    {title}
                  </h3>

                  <p>{text}</p>
                </Reveal>
              )
            )}
          </Stagger>
        </div>
      </section>

       {/* PAYMENTS */}
      <section id="payments" className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 pointer-events-none mil-divider">
        <div className="max-w-7xl mx-auto min-w-0">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 break-words">Выплаты</h2>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-6">
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
              <Reveal key={city} className={glass + " p-8"}>
                <h3 className="text-2xl font-bold mb-4">{city}</h3>
                <p className="text-white/60 text-lg">
                  <AnimatedMoney text={pay} />
                </p>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* JOBS */}
      <section id="jobs" className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 pointer-events-none mil-divider">
        <div className="max-w-7xl mx-auto min-w-0">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 break-words">Должности</h2>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ["Стрелок", "210 000 ₽"],
              ["Гранатометчик", "211 000 ₽"],
              ["Пулеметчик", "216 000 ₽"],
              ["Старший сапер", "216 000 ₽"],
              ["Старший телефонист", "224 000 ₽"],
              ["Командир отделения", "238 000 ₽"],
              ["Заместитель командира взвода", "250 000 ₽"],
            ].map(([job, salary]) => (
              <Reveal key={job} className={glass + " p-6"}>
                <h3 className="text-xl font-bold mb-3">{job}</h3>
                <p className="text-white/60 text-lg">
                  <AnimatedMoney text={salary} />
                </p>
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>

      {/* REGIONS */}
      <section id="regions" className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 pointer-events-none mil-divider">
        <div className="max-w-6xl mx-auto min-w-0">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 break-words">Регионы</h2>
          </Reveal>

          <Reveal className={glass + " p-4 sm:p-6 md:p-8"}>
            <Stagger className="space-y-3">
              {[
                ["Москва", "от 270 000 ₽", 100],
                ["Балашиха", "210 000 ₽", 86],
                ["Африка", "230 000 ₽", 82],
                ["Воронеж", "210 000 ₽", 78],
                ["Тверь", "210 000 ₽", 74],
                ["Саратов", "210 000 ₽", 72],
                ["Чебоксары", "210 000 ₽", 70],
                ["Нижнекамск", "210 000 ₽", 68],
                ["Нижний Новгород", "204 000 ₽", 63],
                ["Иваново", "204 000 ₽", 60],
              ].map(([city, price, score], idx) => (
                <Reveal
                  key={city}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <div className="font-bold break-words leading-snug">
                          {city}
                        </div>
                        <div className="text-white/60 text-sm break-words sm:text-right sm:shrink-0">
                          <AnimatedMoney text={String(price)} />
                        </div>
                      </div>
                      <LeaderboardBar
                        score={Number(score)}
                        delay={idx * 0.03}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </Stagger>
          </Reveal>
        </div>
      </section>
      
      {/* DOCUMENTS */}
      <section
        id="documents"
        className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 pointer-events-none mil-divider"
      >
        <div className="max-w-7xl mx-auto min-w-0">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 break-words">
              Какие документы понадобятся
            </h2>
          </Reveal>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {(
              [
                ["Паспорт", "/textures/passport.png", "xl"],
                ["Военный билет", "/textures/military-id.png", "large"],
                ["СНИЛС", "/textures/snils.png", "medium"],
                ["Реквизиты карты", "/textures/card.png", "smallMed"],
                ["ИНН", "/textures/inn.png", "xsmall"],
              ] as const
            ).map(([title, img, size]) => (
              <Reveal key={title} className="pointer-events-auto">
                <DocumentCard title={title} img={img} size={size} />
              </Reveal>
            ))}
          </Stagger>
        </div>
      </section>
{/* FAQ */}

      <section
        id="faq"
        className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 pointer-events-none mil-divider"
      >
        <div className="max-w-5xl mx-auto min-w-0">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10 break-words">
              Вопросы
            </h2>
          </Reveal>

          <div
            className="space-y-4 pointer-events-auto"
            data-ui-interactive
          >
            {[
              [
                "Можно ли без опыта?",
                "Да. Подберем должность и проведем по всем этапам оформления, расскажем, что и как делать.",
              ],
              [
                "Какие ограничения по возрасту?",
                "От 18 до 60 лет.",
              ],
              [
                "Сколько занимает оформление?",
                "В среднем от 1 до 7 дней — зависит от региона, готовности документов и прохождения медкомиссии.",
              ],
              [
                "Можно ли выбрать регион?",
                "Да. Поможем выбрать регион с нужными условиями и выплатами.",
              ],
              [
                "Есть ли обучение?",
                "Да, обучение и вводный инструктаж предусмотрены. Подскажем, что ожидать на месте.",
              ],
              [
                "Какие выплаты при подписании?",
                "Выплаты зависят от региона и условий. В разделе “Выплаты” показаны популярные варианты, а точную сумму уточним под ваш кейс.",
              ],
              [
                "Когда начисляется довольствие?",
                "Как правило, после оформления и зачисления по установленному порядку. Точные сроки зависят от подразделения/региона.",
              ],
              [
                "Можно ли после срочной службы?",
                "Да, можно. Поможем подготовиться и оформить контракт.",
              ],
              [
                "Нужен ли военный билет?",
                "Желательно. Если нет — подскажем, что делать и какие документы могут заменить на этапе подачи.",
              ],
              [
                "Как проходит медкомиссия?",
                "По стандартной процедуре: осмотр специалистов и обследования. Мы заранее объясним, какие этапы будут.",
              ],
            ].map(([q, a]) => {
              const isOpen = faqOpen === q;
              return (
                <div
                  key={q}
                  className={glass + " p-0 overflow-hidden"}
                >
                  <button
                    type="button"
                    className="w-full px-6 py-5 flex items-center justify-between gap-6 text-left"
                    onClick={() =>
                      setFaqOpen((cur) =>
                        cur === q ? null : q
                      )
                    }
                  >
                    <div className="text-lg md:text-xl font-bold">
                      {q}
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white/70 select-none"
                      aria-hidden
                    >
                      ⌄
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <div className="px-6 pb-6 text-white/65 leading-relaxed">
                          {a}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CONTACTS */}
      <section id="contacts" className="relative scroll-mt-24 px-4 sm:px-6 py-20 sm:py-24 border-t border-white/10 text-center pointer-events-none mil-divider">
        <div className="max-w-3xl mx-auto min-w-0 pointer-events-none">
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
              onOpenPersonalData={() => setOpenPdn(true)}
            />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 break-words">Связаться</h2>
          <p className="text-white/50 mb-8 text-sm sm:text-base break-words px-1">Telegram для консультации и подачи анкеты</p>
          <div className="flex flex-col items-center gap-4 pointer-events-auto">
            <PhoneLink
              className="text-white/70 text-lg touch-manipulation"
              iconClassName="w-4 h-4 shrink-0"
            />
            <a
              href="https://t.me/FmSn5"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 sm:px-10 py-4 sm:py-5 bg-white text-black rounded-2xl font-bold hover:scale-105 transition inline-block touch-manipulation max-w-full break-words text-center"
              data-ui-interactive
            >
              Написать в Telegram
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER LINKS */}
      <footer className="relative px-4 sm:px-6 pt-12 pb-14 border-t border-white/10 pointer-events-auto mil-divider">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between text-white/60">
          <div className="text-sm">
            © {new Date().getFullYear()} CONTRACT RF
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 min-w-0 w-full sm:w-auto">
            <button
              type="button"
              className="text-sm text-left break-words hover:text-white transition underline decoration-white/20 hover:decoration-white/60"
              onClick={() => setOpenPrivacy(true)}
            >
              Политика конфиденциальности
            </button>
            <button
              type="button"
              className="text-sm text-left break-words hover:text-white transition underline decoration-white/20 hover:decoration-white/60"
              onClick={() => setOpenPdn(true)}
            >
              Обработка персональных данных
            </button>
            <button
              type="button"
              className="text-sm text-left break-words hover:text-white transition underline decoration-white/20 hover:decoration-white/60"
              onClick={() => setOpenAgreement(true)}
            >
              Пользовательское соглашение
            </button>
          </div>
        </div>
      </footer>

      <Modal
        open={openGuide}
        onClose={() => setOpenGuide(false)}
        title="Инструкция"
        maxWidthClassName="max-w-2xl"
      >
        <ol className="space-y-6 list-none pl-0">
          <li>
            <div className="font-bold text-white text-lg mb-1">
              1. Оставьте заявку на сайте или напишите в Telegram
            </div>
            <p>
              Специалист свяжется с вами в течение нескольких минут и ответит на
              все вопросы.
            </p>
          </li>
          <li>
            <div className="font-bold text-white text-lg mb-1">
              2. Получите консультацию
            </div>
            <p>
              Подберём подходящий регион, расскажем о выплатах, условиях и
              доступных должностях.
            </p>
          </li>
          <li>
            <div className="font-bold text-white text-lg mb-1">
              3. Подготовьте документы
            </div>
            <p>
              Понадобятся: паспорт, военный билет (при наличии), ИНН и другие
              документы.
            </p>
          </li>
          <li>
            <div className="font-bold text-white text-lg mb-1">
              4. Пройдите оформление
            </div>
            <p>
              Организуем сопровождение на всех этапах: проверка документов,
              медкомиссия, подписание контракта.
            </p>
          </li>
          <li>
            <div className="font-bold text-white text-lg mb-1">
              5. Отправка и выплаты
            </div>
            <p>
              После заключения контракта назначаются выплаты и дальнейшее
              распределение.
            </p>
          </li>
        </ol>
      </Modal>

      <Modal
        open={openBenefits}
        onClose={() => setOpenBenefits(false)}
        title="Льготы и компенсации"
        maxWidthClassName="max-w-3xl"
      >
        <div className="space-y-5">
          <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
            <div className="text-white text-lg font-bold mb-2">
              Денежное довольствие
            </div>
            <div>
              При исполнении контракта военнослужащие каждый месяц получают денежное довольствие.
              <div className="mt-2">
                На сумму влияет звание, должность и выслуга лет.
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
            <div className="text-white text-lg font-bold mb-2">
              Выплата при непригодности к службе
            </div>
            <div>
              Сумма пособия составляет{" "}
              <span className="text-white font-bold">3 439 562 ₽</span>.
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-5 bg-white/5">
            <div className="text-white text-lg font-bold mb-2">
              Выплаты семье при гибели
            </div>
            <div>
              Размер составляет на 2026 год —{" "}
              <span className="text-white font-bold">5 000 000 ₽</span>.
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openSupport}
        onClose={() => setOpenSupport(false)}
        title="Полное сопровождение и поддержка 24/7"
        maxWidthClassName="max-w-3xl"
      >
        <div className="space-y-3">
          <div>Полное сопровождение и поддержка помощь с решениями по типу:</div>
          <ul className="list-disc pl-5 space-y-2">
            <li>Обеспечим трансфер из любой точки страны за наш счет</li>
            <li>Поможем в списании кредитов и задолженностей до 10 млн. рублей</li>
            <li>Восстановим документы и поможем решить проблемы с законом</li>
          </ul>
        </div>
      </Modal>

      <Modal
        open={openPrivacy}
        onClose={() => setOpenPrivacy(false)}
        title="Политика конфиденциальности"
        maxWidthClassName="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="text-white/85 font-semibold">
            Политика в отношении обработки персональных данных
          </div>
          <div>
            <div className="font-semibold text-white">1. Общие положения</div>
            <div className="mt-2">
              Настоящая Политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006 №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые владельцем сайта (далее — Оператор).
            </div>
            <div className="mt-2">
              Оператор осуществляет обработку персональных данных в соответствии с требованиями законодательства Российской Федерации.
            </div>
            <div className="mt-2">
              Настоящая Политика применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта:{" "}
              <span className="text-white">https://mil-contract-rf.vercel.app</span>
            </div>
            <div className="mt-2">
              Использование сайта Пользователем означает согласие с настоящей Политикой обработки персональных данных.
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">2. Основные понятия</div>
            <div className="mt-2">
              <div className="font-semibold text-white/90">2.1. Персональные данные</div>
              <div>Любая информация, относящаяся прямо или косвенно к определенному Пользователю сайта.</div>
            </div>
            <div className="mt-2">
              <div className="font-semibold text-white/90">2.2. Обработка персональных данных</div>
              <div>Любое действие с персональными данными, включая сбор, хранение, использование, передачу, удаление и уничтожение.</div>
            </div>
            <div className="mt-2">
              <div className="font-semibold text-white/90">2.3. Пользователь</div>
              <div>Любой посетитель веб-сайта.</div>
            </div>
            <div className="mt-2">
              <div className="font-semibold text-white/90">2.4. Оператор</div>
              <div>Лицо, осуществляющее обработку персональных данных Пользователей сайта.</div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">3. Какие данные обрабатываются</div>
            <div className="mt-2">
              Оператор может обрабатывать следующие персональные данные Пользователя:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>ФИО</li>
                <li>Номер телефона</li>
                <li>Telegram username</li>
                <li>Регион проживания</li>
                <li>Информация, указанная Пользователем в комментарии заявки</li>
              </ul>
              <div className="mt-2">
                Также сайт может автоматически получать техническую информацию:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>IP-адрес</li>
                  <li>cookie-файлы</li>
                  <li>тип устройства</li>
                  <li>данные браузера</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">4. Цели обработки персональных данных</div>
            <div className="mt-2">
              Персональные данные Пользователя обрабатываются в следующих целях:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>обработка заявок;</li>
                <li>обратная связь с Пользователем;</li>
                <li>консультирование по вопросам оформления контракта;</li>
                <li>предоставление информации о выплатах, должностях и условиях оформления;</li>
                <li>сопровождение Пользователя на этапах оформления;</li>
                <li>улучшение работы сайта.</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">5. Правовые основания обработки</div>
            <div className="mt-2">
              Обработка персональных данных осуществляется на основании:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>добровольного согласия Пользователя;</li>
                <li>Федерального закона №152-ФЗ «О персональных данных»;</li>
                <li>иных нормативных актов Российской Федерации.</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">6. Порядок обработки и хранения данных</div>
            <div className="mt-2">
              Оператор обеспечивает сохранность персональных данных и принимает необходимые меры для защиты данных от неправомерного доступа, изменения, распространения или уничтожения.
              <div className="mt-2">
                Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством Российской Федерации.
              </div>
              <div className="mt-2">
                Срок хранения персональных данных определяется достижением целей обработки либо требованиями законодательства РФ.
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">7. Права Пользователя</div>
            <div className="mt-2">
              Пользователь имеет право:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>получать информацию о своих персональных данных;</li>
                <li>требовать уточнения, блокировки или удаления данных;</li>
                <li>отозвать согласие на обработку персональных данных;</li>
                <li>направлять обращения по вопросам обработки персональных данных.</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">8. Отзыв согласия</div>
            <div className="mt-2">
              Пользователь может в любой момент отозвать согласие на обработку персональных данных, направив обращение Оператору в Telegram:{" "}
              <a
                href="https://t.me/FmSn5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline decoration-white/30 hover:decoration-white/70"
              >
                https://t.me/FmSn5
              </a>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">9. Использование cookie</div>
            <div className="mt-2">
              Сайт может использовать cookie-файлы для корректной работы сервисов, аналитики и повышения удобства использования сайта.
              <div className="mt-2">
                Продолжая использовать сайт, Пользователь соглашается на использование cookie.
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-white">10. Заключительные положения</div>
            <div className="mt-2">
              Оператор вправе вносить изменения в настоящую Политику без предварительного уведомления Пользователей.
              <div className="mt-2">
                Актуальная версия Политики размещается по адресу:{" "}
                <span className="text-white">https://mil-contract-rf.vercel.app/privacy</span>
              </div>
              <div className="mt-2">
                Политика действует бессрочно до замены новой редакцией.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openAgreement}
        onClose={() => setOpenAgreement(false)}
        title="Пользовательское соглашение"
        maxWidthClassName="max-w-4xl"
      >
        <div className="space-y-4">
          <div>
            Настоящее Пользовательское соглашение регулирует условия использования сайта и отправки заявок через формы обратной связи.
          </div>
          <div>
            <div className="font-semibold text-white">1. Общие условия</div>
            <div className="mt-2">
              Пользователь, используя сайт, подтверждает, что ознакомился с условиями настоящего Соглашения и принимает их в полном объеме.
            </div>
          </div>
          <div>
            <div className="font-semibold text-white">2. Отправка заявок</div>
            <div className="mt-2">
              Пользователь соглашается предоставлять достоверные данные при заполнении форм. Оператор использует предоставленные сведения исключительно для обработки заявки и связи с Пользователем.
            </div>
          </div>
          <div>
            <div className="font-semibold text-white">3. Ограничение ответственности</div>
            <div className="mt-2">
              Оператор принимает разумные меры для корректной работы сайта, но не гарантирует бесперебойную доступность сервисов и отсутствие технических ошибок.
            </div>
          </div>
          <div>
            <div className="font-semibold text-white">4. Изменения</div>
            <div className="mt-2">
              Оператор вправе изменять Соглашение без предварительного уведомления. Продолжение использования сайта означает согласие с новой редакцией.
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openPdn}
        onClose={() => setOpenPdn(false)}
        title="Обработка персональных данных"
        maxWidthClassName="max-w-4xl"
      >
        <PersonalDataContent />
      </Modal>

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
