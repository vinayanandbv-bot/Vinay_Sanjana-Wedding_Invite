/**
 * PALACE-3D.JS - CINEMATIC THREE.JS WEBGL PALACE DOORS & SHADER ENGINE
 * - Physically Based Rendering (PBR) Materials with Procedural Teak Wood, 24K Gold Foil, and Marble
 * - Dynamic Interactive Specular Lighting (tracks mouse / touch coordinates)
 * - 3D Rajputana Scalloped Archway, Fluted Columns, and Swaying Brass Temple Bells
 * - Heavy Double Doors with 3D Carved Panels, Brass Studs, Ring Knockers & Ruby Wax Monogram Seal (P & V)
 * - Smooth 3D Door Swing & Volumetric Light Spill with GSAP
 */

window.Palace3D = (function () {
  'use strict';

  let container, canvas, renderer, scene, camera;
  let leftDoorGroup, rightDoorGroup, sealMesh, backLight, lanternLight;
  let bells = [];
  let particlesMesh;
  let isOpen = false;
  let isAnimating = false;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let raycaster, pointer;
  let onOpenCallback = null;
  let onCloseCallback = null;

  // Door Dimensions in 3D Units
  const DOOR_W = 2.4;
  const DOOR_H = 7.0;
  const DOOR_D = 0.22;
  const ARCH_H = 2.0;

  /* ==========================================================================
     1. PROCEDURAL TEXTURE GENERATORS (HIGH-FIDELITY PBR MAPS)
     ========================================================================== */

  // 1A. Organic Teak Wood Texture (Diffuse + Bump)
  function createTeakWoodTextures() {
    const w = 1024;
    const h = 2048;

    // Diffuse Canvas
    const dCanvas = document.createElement('canvas');
    dCanvas.width = w;
    dCanvas.height = h;
    const dCtx = dCanvas.getContext('2d');

    // Rich Dark Teak Base
    const grad = dCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#220e06');
    grad.addColorStop(0.3, '#35180c');
    grad.addColorStop(0.7, '#2b1309');
    grad.addColorStop(1, '#1e0c05');
    dCtx.fillStyle = grad;
    dCtx.fillRect(0, 0, w, h);

    // Wood Grain Fibers
    dCtx.fillStyle = 'rgba(15, 6, 2, 0.25)';
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * w;
      const lineWidth = Math.random() * 3 + 1;
      const alpha = Math.random() * 0.18 + 0.05;
      dCtx.strokeStyle = `rgba(18, 7, 3, ${alpha})`;
      dCtx.lineWidth = lineWidth;
      dCtx.beginPath();
      dCtx.moveTo(x, 0);
      dCtx.bezierCurveTo(
        x + (Math.random() - 0.5) * 40,
        h * 0.33,
        x + (Math.random() - 0.5) * 40,
        h * 0.66,
        x + (Math.random() - 0.5) * 30,
        h
      );
      dCtx.stroke();
    }

    // Warm Gold/Amber Highlights in Wood Pores
    dCtx.fillStyle = 'rgba(92, 48, 22, 0.18)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      dCtx.fillRect(x, Math.random() * h, Math.random() * 2 + 1, Math.random() * 40 + 10);
    }

    const diffuseTex = new THREE.CanvasTexture(dCanvas);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.wrapT = THREE.RepeatWrapping;

    // Bump Map Canvas
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 1024;
    const bCtx = bCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 1024);

    for (let i = 0; i < 450; i++) {
      const x = Math.random() * 512;
      const shade = Math.random() > 0.5 ? 255 : 0;
      bCtx.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, 0.12)`;
      bCtx.lineWidth = Math.random() * 2 + 0.8;
      bCtx.beginPath();
      bCtx.moveTo(x, 0);
      bCtx.lineTo(x + (Math.random() - 0.5) * 15, 1024);
      bCtx.stroke();
    }

    const bumpTex = new THREE.CanvasTexture(bCanvas);
    bumpTex.wrapS = THREE.RepeatWrapping;
    bumpTex.wrapT = THREE.RepeatWrapping;

    return { diffuse: diffuseTex, bump: bumpTex };
  }

  // 1B. 24K Gold Foil Shimmer Texture
  function createGoldFoilTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#c99e32');
    grad.addColorStop(0.25, '#fff0bd');
    grad.addColorStop(0.5, '#b88828');
    grad.addColorStop(0.75, '#fae196');
    grad.addColorStop(1, '#8c6114');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle micro leaf flecks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let i = 0; i < 300; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // 1C. Royal Ruby Red Wax Monogram Medallion (P & V) Texture
  function createWaxSealTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rich deep ruby red wax with radial lighting
    const grad = ctx.createRadialGradient(size * 0.38, size * 0.35, 10, size * 0.5, size * 0.5, size * 0.48);
    grad.addColorStop(0, '#f22e56');
    grad.addColorStop(0.35, '#c01538');
    grad.addColorStop(0.75, '#780a1e');
    grad.addColorStop(1, '#44040e');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Wax Edge Drips / Irregularities
    ctx.fillStyle = '#8a0d24';
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const r = size * 0.46 + Math.sin(i * 3) * 8;
      const x = size / 2 + Math.cos(angle) * r;
      const y = size / 2 + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Concentric Inner Gilded Beveled Rim
    ctx.strokeStyle = 'rgba(255, 225, 150, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(60, 4, 12, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.37, 0, Math.PI * 2);
    ctx.stroke();

    // Royal Crown Glyphs
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffeb99';
    ctx.shadowColor = 'rgba(40, 2, 8, 0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.fillText('♕', size / 2, size * 0.28);

    // Monogram Initials "P & V"
    ctx.font = 'bold 58px "Cinzel", Georgia, serif';
    ctx.fillText('P & V', size / 2, size * 0.52);

    // Bottom Decorative Flourish
    ctx.font = '22px Georgia, serif';
    ctx.fillStyle = '#ffd666';
    ctx.fillText('❖', size / 2, size * 0.73);

    return new THREE.CanvasTexture(canvas);
  }

  /* ==========================================================================
     2. MATERIALS SETUP (PHYSICALLY BASED RENDERING)
     ========================================================================== */
  let woodMaterial, goldMaterial, brassMaterial, sealMaterial, stoneMaterial, archMaterial;

  function initMaterials() {
    const woodTextures = createTeakWoodTextures();
    const goldTexture = createGoldFoilTexture();
    const sealTexture = createWaxSealTexture();

    // Teak Wood with PBR roughness & normal bump
    woodMaterial = new THREE.MeshStandardMaterial({
      map: woodTextures.diffuse,
      bumpMap: woodTextures.bump,
      bumpScale: 0.05,
      roughness: 0.55,
      metalness: 0.12,
    });

    // 24K Gold Foil (High metalness, reflective specular)
    goldMaterial = new THREE.MeshStandardMaterial({
      map: goldTexture,
      color: 0xffe285,
      roughness: 0.22,
      metalness: 0.88,
    });

    // Antique Brass (for studs and knockers)
    brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfab39,
      roughness: 0.25,
      metalness: 0.92,
    });

    // Ruby Wax Seal (Subsurface sheen, clearcoat finish)
    sealMaterial = new THREE.MeshPhysicalMaterial({
      map: sealTexture,
      roughness: 0.32,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
    });

    // White Heritage Marble for Pillars and Pediments
    stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdfaf5,
      roughness: 0.75,
      metalness: 0.05,
    });

    // Gilded Arch Material
    archMaterial = new THREE.MeshStandardMaterial({
      color: 0xecd078,
      roughness: 0.35,
      metalness: 0.75,
    });
  }

  /* ==========================================================================
     3. 3D ARCHWAY, PILLARS, AND HANGING BELLS
     ========================================================================== */
  function buildRajputanaArchway() {
    const archGroup = new THREE.Group();

    // 3A. Left & Right Fluted Stone Columns
    const colGeo = new THREE.CylinderGeometry(0.24, 0.28, DOOR_H + 0.6, 24);
    const colLeft = new THREE.Mesh(colGeo, stoneMaterial);
    colLeft.position.set(-DOOR_W - 0.24, (DOOR_H + 0.6) / 2 - 0.3, 0.1);
    archGroup.add(colLeft);

    const colRight = new THREE.Mesh(colGeo, stoneMaterial);
    colRight.position.set(DOOR_W + 0.24, (DOOR_H + 0.6) / 2 - 0.3, 0.1);
    archGroup.add(colRight);

    // Column Bases & Capitals
    const capGeo = new THREE.BoxGeometry(0.68, 0.26, 0.68);
    const capLeftTop = new THREE.Mesh(capGeo, goldMaterial);
    capLeftTop.position.set(-DOOR_W - 0.24, DOOR_H + 0.1, 0.1);
    archGroup.add(capLeftTop);

    const capRightTop = new THREE.Mesh(capGeo, goldMaterial);
    capRightTop.position.set(DOOR_W + 0.24, DOOR_H + 0.1, 0.1);
    archGroup.add(capRightTop);

    // 3B. Scalloped Cusped Arch Crown (Extruded Rajputana Curve)
    const archShape = new THREE.Shape();
    const span = DOOR_W * 2 + 0.8;
    const halfSpan = span / 2;

    // Outer profile
    archShape.moveTo(-halfSpan, 0);
    archShape.lineTo(-halfSpan, ARCH_H * 0.9);

    // Multi-cusped scalloped arch curve
    archShape.bezierCurveTo(-halfSpan * 0.75, ARCH_H * 0.95, -halfSpan * 0.5, ARCH_H * 0.6, -halfSpan * 0.3, ARCH_H * 0.9);
    archShape.bezierCurveTo(-halfSpan * 0.15, ARCH_H * 1.1, 0, ARCH_H * 1.25, 0, ARCH_H * 1.35);
    archShape.bezierCurveTo(0, ARCH_H * 1.25, halfSpan * 0.15, ARCH_H * 1.1, halfSpan * 0.3, ARCH_H * 0.9);
    archShape.bezierCurveTo(halfSpan * 0.5, ARCH_H * 0.6, halfSpan * 0.75, ARCH_H * 0.95, halfSpan, ARCH_H * 0.9);
    archShape.lineTo(halfSpan, 0);

    // Inner arch cutout line
    archShape.lineTo(halfSpan - 0.25, 0);
    archShape.bezierCurveTo(halfSpan * 0.7, ARCH_H * 0.75, halfSpan * 0.45, ARCH_H * 0.45, halfSpan * 0.25, ARCH_H * 0.7);
    archShape.bezierCurveTo(halfSpan * 0.1, ARCH_H * 0.85, 0, ARCH_H * 0.95, 0, ARCH_H * 1.05);
    archShape.bezierCurveTo(0, ARCH_H * 0.95, -halfSpan * 0.1, ARCH_H * 0.85, -halfSpan * 0.25, ARCH_H * 0.7);
    archShape.bezierCurveTo(-halfSpan * 0.45, ARCH_H * 0.45, -halfSpan * 0.7, ARCH_H * 0.75, -halfSpan + 0.25, 0);
    archShape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const archGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
    const archMesh = new THREE.Mesh(archGeo, archMaterial);
    archMesh.position.set(0, DOOR_H - 0.05, -0.05);
    archGroup.add(archMesh);

    // Arch Central Gold Kalash Emblem
    const kalashGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const kalashMesh = new THREE.Mesh(kalashGeo, goldMaterial);
    kalashMesh.position.set(0, DOOR_H + ARCH_H * 1.35, 0.1);
    archGroup.add(kalashMesh);

    // 3C. Hanging 3D Temple Bells with Brass Chains
    const bellPositions = [-1.6, -0.8, 0.8, 1.6];
    bellPositions.forEach((xPos, idx) => {
      const bellGroup = new THREE.Group();
      bellGroup.position.set(xPos, DOOR_H + 0.4, 0.2);

      // Chain
      const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8);
      const chainMesh = new THREE.Mesh(chainGeo, brassMaterial);
      chainMesh.position.y = -0.325;
      bellGroup.add(chainMesh);

      // Bell Dome
      const bellGeo = new THREE.ConeGeometry(0.12, 0.22, 16, 1, true);
      const bellMesh = new THREE.Mesh(bellGeo, brassMaterial);
      bellMesh.position.y = -0.7;
      bellMesh.rotation.x = Math.PI;
      bellGroup.add(bellMesh);

      // Bell Clapper
      const clapperGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const clapperMesh = new THREE.Mesh(clapperGeo, goldMaterial);
      clapperMesh.position.y = -0.78;
      bellGroup.add(clapperMesh);

      archGroup.add(bellGroup);
      bells.push({ group: bellGroup, speed: 1.5 + idx * 0.3, offset: idx * 0.8 });
    });

    scene.add(archGroup);
  }

  /* ==========================================================================
     4. 3D CARVED DOORS, STUDS, KNOCKERS & MONOGRAM SEAL
     ========================================================================== */
  function buildDoorLeaf(isRight) {
    const doorGroup = new THREE.Group();

    // Pivot placement:
    // Left door rotates around x = -DOOR_W
    // Right door rotates around x = +DOOR_W
    const pivotX = isRight ? DOOR_W : -DOOR_W;
    doorGroup.position.set(pivotX, 0, 0);

    const leafInner = new THREE.Group();
    // Offset so the inner edge is at x=0
    leafInner.position.set(isRight ? -DOOR_W / 2 : DOOR_W / 2, DOOR_H / 2, 0);

    // Main Wood Door Leaf Slab
    const slabGeo = new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_D);
    const doorSlab = new THREE.Mesh(slabGeo, woodMaterial);
    leafInner.add(doorSlab);

    // Gilded Frame Borders (Outer bevel)
    const frameGeo = new THREE.BoxGeometry(DOOR_W - 0.1, DOOR_H - 0.1, DOOR_D + 0.02);
    const frameMesh = new THREE.Mesh(frameGeo, goldMaterial);
    leafInner.add(frameMesh);

    // Re-insert inner wood slab recessed panel
    const innerWoodGeo = new THREE.BoxGeometry(DOOR_W - 0.24, DOOR_H - 0.24, DOOR_D + 0.04);
    const innerWood = new THREE.Mesh(innerWoodGeo, woodMaterial);
    leafInner.add(innerWood);

    // 4 Recessed Carved Jharokha Panels per door
    const panelCount = 4;
    const panelHeight = (DOOR_H - 1.2) / panelCount;
    for (let p = 0; p < panelCount; p++) {
      const yOffset = (p - 1.5) * (panelHeight + 0.18);

      // Gold Beveled Panel Rim
      const pFrameGeo = new THREE.BoxGeometry(DOOR_W - 0.5, panelHeight, 0.06);
      const pFrame = new THREE.Mesh(pFrameGeo, goldMaterial);
      pFrame.position.set(0, yOffset, DOOR_D / 2 + 0.02);
      leafInner.add(pFrame);

      // Recessed Wood Center
      const pWoodGeo = new THREE.BoxGeometry(DOOR_W - 0.65, panelHeight - 0.15, 0.07);
      const pWood = new THREE.Mesh(pWoodGeo, woodMaterial);
      pWood.position.set(0, yOffset, DOOR_D / 2 + 0.03);
      leafInner.add(pWood);

      // Central Floral Brass Rosette
      const rosetteGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 12);
      const rosette = new THREE.Mesh(rosetteGeo, brassMaterial);
      rosette.rotation.x = Math.PI / 2;
      rosette.position.set(0, yOffset, DOOR_D / 2 + 0.06);
      leafInner.add(rosette);
    }

    // Antique Brass Studs (along the seam edge)
    const studCount = 7;
    const studGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const studEdgeX = isRight ? -DOOR_W / 2 + 0.12 : DOOR_W / 2 - 0.12;

    for (let s = 0; s < studCount; s++) {
      const studY = (s - 3) * (DOOR_H / 8);
      const stud = new THREE.Mesh(studGeo, brassMaterial);
      stud.position.set(studEdgeX, studY, DOOR_D / 2 + 0.03);
      leafInner.add(stud);
    }

    // Heavy Brass Ring Knocker
    const knockerMountGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16);
    const knockerMount = new THREE.Mesh(knockerMountGeo, brassMaterial);
    knockerMount.rotation.x = Math.PI / 2;
    const knockerX = isRight ? -0.4 : 0.4;
    knockerMount.position.set(knockerX, 0.1, DOOR_D / 2 + 0.04);
    leafInner.add(knockerMount);

    const ringGeo = new THREE.TorusGeometry(0.16, 0.032, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeo, brassMaterial);
    ringMesh.position.set(knockerX, -0.1, DOOR_D / 2 + 0.07);
    leafInner.add(ringMesh);

    // If Right Door: Mount Central Royal Ruby Wax Monogram Medallion (P & V)
    if (isRight) {
      const sealCylGeo = new THREE.CylinderGeometry(0.55, 0.58, 0.08, 36);
      sealMesh = new THREE.Mesh(sealCylGeo, sealMaterial);
      sealMesh.rotation.x = Math.PI / 2;
      // Position right at the center seam (x = -DOOR_W/2)
      sealMesh.position.set(-DOOR_W / 2, 0.1, DOOR_D / 2 + 0.08);
      sealMesh.name = 'centralSeal';
      leafInner.add(sealMesh);
    }

    doorGroup.add(leafInner);
    return doorGroup;
  }

  /* ==========================================================================
     5. LIGHTING ARCHITECTURE (CINEMATIC & SHADERS)
     ========================================================================== */
  function setupLighting() {
    // Warm Palace Ambient Glow
    const ambient = new THREE.AmbientLight(0xffedd8, 0.75);
    scene.add(ambient);

    // Key Directional Sunbeam (casts rich specular highlights across gold & brass)
    const sunLight = new THREE.DirectionalLight(0xfff6e0, 1.35);
    sunLight.position.set(-4, 9, 8);
    scene.add(sunLight);

    // Secondary Warm Fill Light from lower right
    const fillLight = new THREE.DirectionalLight(0xcc9a50, 0.65);
    fillLight.position.set(5, 2, 6);
    scene.add(fillLight);

    // Interactive Golden Lantern Light (Tracks Cursor/Touch)
    lanternLight = new THREE.PointLight(0xffd57a, 2.2, 12);
    lanternLight.position.set(0, DOOR_H / 2, 4.5);
    scene.add(lanternLight);

    // Courtyard Backlight (Spills through the door seam when opening)
    backLight = new THREE.PointLight(0xfff3c4, 0.1, 18);
    backLight.position.set(0, DOOR_H / 2, -2.0);
    scene.add(backLight);
  }

  /* ==========================================================================
     6. ATMOSPHERIC 3D FLOATING GOLD LEAF PARTICLES
     ========================================================================== */
  function setupParticles() {
    const particleCount = 70;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1.5;
      scales[i] = Math.random() * 0.12 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle Material with Soft Golden Shimmer
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    pGrad.addColorStop(0, 'rgba(255, 245, 200, 1)');
    pGrad.addColorStop(0.4, 'rgba(212, 175, 55, 0.8)');
    pGrad.addColorStop(1, 'rgba(180, 130, 30, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);

    const pTex = new THREE.CanvasTexture(pCanvas);
    const pMaterial = new THREE.PointsMaterial({
      size: 0.35,
      map: pTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    particlesMesh = new THREE.Points(geometry, pMaterial);
    scene.add(particlesMesh);
  }

  /* ==========================================================================
     7. 3D OPEN & CLOSE ANIMATIONS (GSAP POWERED)
     ========================================================================== */
  function openGates() {
    if (isOpen || isAnimating) return;
    isAnimating = true;
    isOpen = true;

    if (window.gsap) {
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
          if (onOpenCallback) onOpenCallback();
        },
      });

      // 1. Double Doors swing smoothly outwards in 3D
      tl.to(
        leftDoorGroup.rotation,
        {
          y: -Math.PI * 0.62, // -112 degrees
          duration: 2.2,
          ease: 'power3.inOut',
        },
        0
      );

      tl.to(
        rightDoorGroup.rotation,
        {
          y: Math.PI * 0.62, // +112 degrees
          duration: 2.2,
          ease: 'power3.inOut',
        },
        0
      );

      // 2. Volumetric Courtyard Light Blooms
      tl.to(
        backLight,
        {
          intensity: 4.8,
          duration: 1.8,
          ease: 'power2.out',
        },
        0.3
      );

      // 3. Cinematic Camera Push Forward (Step inside palace portal)
      tl.to(
        camera.position,
        {
          z: 7.2,
          y: DOOR_H * 0.48,
          duration: 2.4,
          ease: 'power2.inOut',
        },
        0.2
      );
    } else {
      // Fallback without GSAP
      leftDoorGroup.rotation.y = -Math.PI * 0.62;
      rightDoorGroup.rotation.y = Math.PI * 0.62;
      backLight.intensity = 4.8;
      isAnimating = false;
      if (onOpenCallback) onOpenCallback();
    }
  }

  function closeGates() {
    if (!isOpen || isAnimating) return;
    isAnimating = true;

    if (window.gsap) {
      const tl = gsap.timeline({
        onComplete: () => {
          isOpen = false;
          isAnimating = false;
          if (onCloseCallback) onCloseCallback();
        },
      });

      // Doors swing shut with heavy wooden latch damping
      tl.to(
        leftDoorGroup.rotation,
        {
          y: 0,
          duration: 1.8,
          ease: 'power3.inOut',
        },
        0
      );

      tl.to(
        rightDoorGroup.rotation,
        {
          y: 0,
          duration: 1.8,
          ease: 'power3.inOut',
        },
        0
      );

      tl.to(
        backLight,
        {
          intensity: 0.1,
          duration: 1.2,
        },
        0
      );

      tl.to(
        camera.position,
        {
          z: 9.2,
          y: DOOR_H * 0.5,
          duration: 1.8,
          ease: 'power2.inOut',
        },
        0
      );
    } else {
      leftDoorGroup.rotation.y = 0;
      rightDoorGroup.rotation.y = 0;
      backLight.intensity = 0.1;
      isOpen = false;
      isAnimating = false;
      if (onCloseCallback) onCloseCallback();
    }
  }

  /* ==========================================================================
     8. INTERACTION & RAYCASTING
     ========================================================================== */
  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const rect = canvas.getBoundingClientRect();
    mouse.targetX = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.targetY = -(((clientY - rect.top) / rect.height) * 2 - 1);
  }

  function onPointerDown(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      if (!isOpen) {
        openGates();
      }
    }
  }

  /* ==========================================================================
     9. ANIMATION LOOP & RESIZE
     ========================================================================== */
  let clock;
  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth cursor interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    // Move Dynamic Specular Lantern Light with cursor
    if (lanternLight) {
      lanternLight.position.x = mouse.x * 3.5;
      lanternLight.position.y = DOOR_H / 2 + mouse.y * 2.5;
    }

    // Subtle 3D Portal Tilting Parallax
    if (!isOpen) {
      scene.rotation.y = mouse.x * 0.06;
      scene.rotation.x = -mouse.y * 0.04;
    }

    // Sway Hanging Temple Bells
    bells.forEach((bell) => {
      bell.group.rotation.z = Math.sin(elapsedTime * bell.speed + bell.offset) * 0.08;
    });

    // Drift Golden Particles
    if (particlesMesh) {
      const positions = particlesMesh.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.008;
        if (positions[i] < 0) positions[i] = 9.5;
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true;
      particlesMesh.rotation.y = elapsedTime * 0.02;
    }

    renderer.render(scene, camera);
  }

  function handleResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 580;

    camera.aspect = width / height;
    // Adjust FOV for mobile tall screens to ensure entire majestic arch fits
    if (width < 600) {
      camera.fov = 52;
      camera.position.z = 10.4;
    } else {
      camera.fov = 42;
      camera.position.z = 9.2;
    }
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /* ==========================================================================
     10. INITIALIZATION
     ========================================================================== */
  function init(options = {}) {
    container = document.getElementById(options.containerId || 'palace-webgl-container');
    if (!container) return;

    onOpenCallback = options.onOpen || null;
    onCloseCallback = options.onClose || null;

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 580;

    // WebGL Renderer with High-Performance Filmic Tone Mapping
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    canvas = renderer.domElement;
    canvas.id = 'palace-3d-canvas';
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'pointer';
    container.appendChild(canvas);

    // Scene & Perspective Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(width < 600 ? 52 : 42, width / height, 0.1, 100);
    camera.position.set(0, DOOR_H * 0.5, width < 600 ? 10.4 : 9.2);

    // Build Scene Graph
    initMaterials();
    buildRajputanaArchway();

    leftDoorGroup = buildDoorLeaf(false);
    scene.add(leftDoorGroup);

    rightDoorGroup = buildDoorLeaf(true);
    scene.add(rightDoorGroup);

    setupLighting();
    setupParticles();

    // Event Listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    canvas.addEventListener('click', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });

    handleResize();
    animate();
  }

  return {
    init: init,
    openGates: openGates,
    closeGates: closeGates,
    isOpen: () => isOpen,
  };
})();
