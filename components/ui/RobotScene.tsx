"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type RobotAction = "wave" | "success" | "error" | "idle";

export default function RobotScene({ 
  accentHex = 0x00d4aa, 
  currentAction = "wave" 
}: { 
  accentHex?: number;
  currentAction?: RobotAction;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  const currentActionRef = useRef<RobotAction>(currentAction);

  const playAnim = (name: string, loopOnce = false) => {
    if (!mixerRef.current || !actionsRef.current[name]) return;
    const nextAction = actionsRef.current[name];
    
    if (activeActionRef.current && activeActionRef.current !== nextAction) {
      activeActionRef.current.fadeOut(0.5);
    }
    
    nextAction.reset().fadeIn(0.5);
    if (loopOnce) {
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
    } else {
      nextAction.setLoop(THREE.LoopRepeat, Infinity);
      nextAction.clampWhenFinished = false;
    }
    nextAction.play();
    activeActionRef.current = nextAction;
  };

  useEffect(() => {
    currentActionRef.current = currentAction;
    switch (currentAction) {
      case "wave":
        playAnim("Wave", true);
        break;
      case "success":
        playAnim("ThumbsUp", true);
        break;
      case "error":
        playAnim("No", true);
        break;
      case "idle":
        playAnim("Idle", false);
        break;
    }
  }, [currentAction]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const W = () => container.clientWidth || window.innerWidth * 0.56;
    const H = () => container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.8;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, W() / H(), 0.1, 100);
    cam.position.set(-0.4, -1.4, 5.5);
    cam.lookAt(-0.2, -1.2, 0);

    const kL = new THREE.DirectionalLight(0xddeeff, 9.0);
    kL.position.set(-2, 4, 6); scene.add(kL);

    const tL = new THREE.DirectionalLight(0xffffff, 5.5);
    tL.position.set(0, 8, 3); scene.add(tL);

    const rL = new THREE.DirectionalLight(0xaabbdd, 4.0);
    rL.position.set(5, 2, 3); scene.add(rL);

    // Strong blue frontal specular light
    const fL = new THREE.PointLight(0x4466aa, 25.0, 30);
    fL.position.set(0, 2, 6); scene.add(fL);

    // A much stronger teal rim light to catch the metallic edges
    const rimLight = new THREE.PointLight(accentHex, 20.0, 25);
    rimLight.position.set(-3, 0, 4);
    scene.add(rimLight);

    // Opposite purple rim light for extra specular reflections
    const rimLight2 = new THREE.PointLight(0x7c6af5, 18.0, 25);
    rimLight2.position.set(3, -2, 4);
    scene.add(rimLight2);

    scene.add(new THREE.AmbientLight(0x334455, 12));

    const aL = new THREE.PointLight(accentHex, 3.5, 12);
    aL.position.set(0, -3, 3); scene.add(aL);

    // Restored the original highly metallic materials for the sleek shadow look
    const blackChrome = new THREE.MeshStandardMaterial({ color: 0x040608, metalness: 1.0, roughness: 0.02 });
    const darkPanel = new THREE.MeshStandardMaterial({ color: 0x07090e, metalness: 0.98, roughness: 0.05 });
    const redEye = new THREE.MeshStandardMaterial({ color: 0xff1200, emissive: 0xff1200, emissiveIntensity: 14, metalness: 0, roughness: 0 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x020305, metalness: 0.95, roughness: 0.15 });

    let robot: THREE.Group | null = null;
    let headBone: THREE.Object3D | null = null;
    let floatT = 0;
    let tRotY = 0;
    let tRotX = 0;
    let currentHeadY = 0;
    let currentHeadX = 0;
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
      (gltf) => {
        robot = gltf.scene;
        robot.traverse((child) => {
          if (child.name === 'Head') {
            headBone = child;
          }
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            const n = (child.name || '').toLowerCase();
            if (n.includes('eye') || n.includes('visor')) {
              m.material = redEye;
            } else if (n.includes('joint') || n.includes('socket')) {
              m.material = jointMat;
            } else {
              m.material = darkPanel.clone();
            }
          }
        });

        const box = new THREE.Box3().setFromObject(robot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 2.6 / Math.max(size.x, size.y, size.z);
        robot.scale.setScalar(scale);
        robot.position.set(-center.x * scale - 0.2, -center.y * scale - 2.6, -center.z * scale);
        robot.rotation.y = 0;
        scene.add(robot);

        if (gltf.animations.length) {
          mixerRef.current = new THREE.AnimationMixer(robot);
          
          mixerRef.current.addEventListener('finished', (e) => {
            // When Wave finishes, automatically return to Idle so he stays alive
            if (e.action === actionsRef.current['Wave']) {
              playAnim("Idle", false);
            }
          });

          gltf.animations.forEach(clip => {
            actionsRef.current[clip.name] = mixerRef.current!.clipAction(clip);
          });

          // Play initial action
          const initialActionName = currentActionRef.current === "wave" ? "Wave" : 
                                   currentActionRef.current === "success" ? "ThumbsUp" : 
                                   currentActionRef.current === "error" ? "No" : "Idle";
          playAnim(initialActionName, currentActionRef.current !== "idle");
        }
      },
      undefined,
      (err) => console.warn('GLB load failed:', err)
    );

    const onMouseMove = (e: MouseEvent) => {
      tRotY = ((e.clientX / innerWidth) * 2 - 1) * 0.7;
      tRotX = -((e.clientY / innerHeight) * 2 - 1) * 0.14;
    };
    document.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      floatT += 0.007;

      if (mixerRef.current) mixerRef.current.update(dt);
      
      if (headBone && currentActionRef.current !== "error") {
        // Interpolate our virtual head state
        currentHeadY += (tRotY - currentHeadY) * 0.1;
        currentHeadX += (tRotX - currentHeadX) * 0.1;
        
        // Force the head bone to our virtual state, overriding the jittery Idle animation track
        headBone.rotation.y = currentHeadY;
        headBone.rotation.x = currentHeadX;
      } else if (headBone && currentActionRef.current === "error") {
        // Sync our virtual state with the animation while the error head-shake plays
        // so it smoothly transitions back to mouse tracking when finished
        currentHeadY = headBone.rotation.y;
        currentHeadX = headBone.rotation.x;
      }

      if (robot) {
        // Keep the subtle floating animation for the whole body
        robot.position.y += (Math.sin(floatT) * 0.06 - robot.position.y - 2.6) * 0.03;
      }
      aL.intensity = 2.2 + Math.sin(floatT * 2) * 0.7;
      renderer.render(scene, cam);
    };
    animate();

    const handleResize = () => {
      cam.aspect = W() / H();
      cam.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [accentHex]);

  return <div ref={containerRef} className="w-full h-full" />;
}
