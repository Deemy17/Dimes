import React, { useEffect, useRef, useState } from "react";

function ThreeDimes() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer, coins = [], animId;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      const THREE = window.THREE;
      const W = mount.offsetWidth, H = mount.offsetHeight;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
      camera.position.set(0, 0, 9);

      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const key = new THREE.DirectionalLight(0xffffff, 3.0);
      key.position.set(-5, 8, 6); key.castShadow = true; scene.add(key);
      const rim = new THREE.DirectionalLight(0xddeeff, 1.2);
      rim.position.set(6, -4, 3); scene.add(rim);
      const fill = new THREE.PointLight(0xffffff, 2.0, 24);
      fill.position.set(0, 2, 5); scene.add(fill);

      const faceMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.98, roughness: 0.10 });
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, metalness: 0.99, roughness: 0.06 });

      function makeCoin(layer) {
        const group = new THREE.Group();
        const R = 0.52, T = 0.06;
        const face = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 72), faceMat.clone());
        face.castShadow = true; group.add(face);
        group.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(R, T*0.5, 8, 72), edgeMat), { rotation: { x: Math.PI/2 } }));
        const relief = new THREE.Mesh(new THREE.TorusGeometry(R*0.76, T*0.15, 6, 64), edgeMat);
        relief.rotation.x = Math.PI/2; relief.position.y = T*0.42; group.add(relief);
        const sizes=[0.5,0.82,1.18], speeds=[0.003,0.007,0.014], opacs=[0.28,0.65,1.0], zR=[[-6,-3],[-3,-1],[-1,1]];
        const s = sizes[layer]; group.scale.set(s, s, s);
        if (layer < 2) { const m = face.material; m.transparent = true; m.opacity = opacs[layer]; }
        group.position.set((Math.random()-0.5)*10, 4+Math.random()*14, zR[layer][0]+Math.random()*(zR[layer][1]-zR[layer][0]));
        group.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
        return { mesh: group, speed: speeds[layer]+Math.random()*0.004, rotX: (Math.random()-0.5)*0.014, rotZ: (Math.random()-0.5)*0.010, driftX: (Math.random()-0.5)*0.002, layer };
      }

      [0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,2].forEach(layer => {
        const c = makeCoin(layer); coins.push(c); scene.add(c.mesh);
      });

      const clock = new THREE.Clock();
      function animate() {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        fill.intensity = 1.8 + Math.sin(t * 0.6) * 0.4;
        coins.forEach(c => {
          c.mesh.position.y -= c.speed; c.mesh.position.x += c.driftX;
          c.mesh.rotation.x += c.rotX; c.mesh.rotation.z += c.rotZ;
          const floor = c.layer === 0 ? -8 : c.layer === 1 ? -7 : -6;
          if (c.mesh.position.y < floor) { c.mesh.position.y = 5+Math.random()*8; c.mesh.position.x = (Math.random()-0.5)*10; }
        });
        renderer.render(scene, camera);
      }
      animate();
      window.addEventListener("resize", () => {
        const W2=mount.offsetWidth, H2=mount.offsetHeight;
        camera.aspect=W2/H2; camera.updateProjectionMatrix(); renderer.setSize(W2, H2);
      });
    };
    document.head.appendChild(script);
    return () => { cancelAnimationFrame(animId); if (renderer && mount.contains(renderer.domElement)) { mount.removeChild(renderer.domElement); renderer.dispose(); } };
  }, []);

  return <div ref={mountRef} className="three-mount" />;
}

export default function HomeScreen({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div className={`home-screen ${visible ? "home-visible" : ""}`}>
      <div className="home-hero">
        <ThreeDimes />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <div className="home-eyebrow">
            <span className="eyebrow-line" />
            Basketball Shoe Finder
          </div>
          <h1 className="home-title">
            <span className="home-title-line">FIND YOUR</span>
            <span className="home-title-line"><span className="accent-block">PERFECT</span></span>
            <span className="home-title-line">SHOE.</span>
          </h1>
          <button className="btn-hero" onClick={onStart}>
            <span>Find My Shoe</span>
            <span className="btn-arrow">→</span>
          </button>
          <p className="home-sub">Free · 7 questions · 60 seconds</p>
        </div>
      </div>
    </div>
  );
}
