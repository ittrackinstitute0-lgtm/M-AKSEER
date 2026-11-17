/**
 * AL KABEER ABBASI - 3D Three.js Interactive Engine
 * Procedural 3D dry fruit models, studio lighting, mouse parallax, and orbit interaction.
 */

const DryFruit3D = {
    heroScene: null,
    heroCamera: null,
    heroRenderer: null,
    heroGroup: null,
    activeMesh: null,
    orbitParticles: null,
    isHeroRotating: true,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    targetRotation: { x: 0.2, y: 0 },
    currentModel: 'pistachio',
    modalScene: null,
    modalCamera: null,
    modalRenderer: null,
    modalMesh: null,
    modalAnimFrame: null,

    initHero: function() {
        const container = document.getElementById('hero-3d-canvas-container');
        if (!container || typeof THREE === 'undefined') {
            console.warn("Three.js not loaded or container not found. Using CSS 3D fallback.");
            this.activateCssFallback(container);
            return;
        }

        try {
            const width = container.clientWidth || 550;
            const height = container.clientHeight || 550;

            // Scene
            this.heroScene = new THREE.Scene();

            // Camera
            this.heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.heroCamera.position.set(0, 1.5, 5.5);

            // Renderer
            this.heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
            this.heroRenderer.setSize(width, height);
            this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.heroRenderer.shadowMap.enabled = true;
            this.heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Clear container and append canvas
            container.innerHTML = '';
            container.appendChild(this.heroRenderer.domElement);

            // Lighting Setup (Luxury Studio Lighting)
            const ambientLight = new THREE.AmbientLight(0xfff7e6, 0.9);
            this.heroScene.add(ambientLight);

            const goldKeyLight = new THREE.DirectionalLight(0xffdf88, 1.8);
            goldKeyLight.position.set(5, 8, 6);
            goldKeyLight.castShadow = true;
            this.heroScene.add(goldKeyLight);

            const rimLight = new THREE.PointLight(0x42ffae, 0.8, 10);
            rimLight.position.set(-4, -2, -3);
            this.heroScene.add(rimLight);

            const warmFill = new THREE.DirectionalLight(0xffb86c, 0.6);
            warmFill.position.set(-5, 3, 2);
            this.heroScene.add(warmFill);

            // Master Group
            this.heroGroup = new THREE.Group();
            this.heroScene.add(this.heroGroup);

            // Base Showcase Pedestal
            this.createPedestal();

            // Initial Fruit Model
            this.switchModel('pistachio');

            // Floating Golden Dust Particles
            this.createDustParticles();

            // Orbiting Mini Dry Fruits
            this.createOrbitingElements();

            // Event Listeners
            this.setupHeroInteractions(container);

            // Window Resize
            window.addEventListener('resize', () => {
                if (!container || !this.heroRenderer || !this.heroCamera) return;
                const newW = container.clientWidth;
                const newH = container.clientHeight;
                this.heroCamera.aspect = newW / newH;
                this.heroCamera.updateProjectionMatrix();
                this.heroRenderer.setSize(newW, newH);
            });

            // Start Animation Loop
            this.animateHero();
        } catch (err) {
            console.error("Three.js initialization failed:", err);
            this.activateCssFallback(container);
        }
    },

    createPedestal: function() {
        const pedGroup = new THREE.Group();

        // Metallic Gold Ring / Base
        const baseGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.25, 48);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x1b3b2b,
            metalness: 0.85,
            roughness: 0.25
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = -1.6;
        baseMesh.receiveShadow = true;
        pedGroup.add(baseMesh);

        // Gold Bevel Ring
        const ringGeo = new THREE.TorusGeometry(2.3, 0.08, 16, 64);
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.15
        });
        const ringMesh = new THREE.Mesh(ringGeo, goldMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = -1.48;
        pedGroup.add(ringMesh);

        this.heroGroup.add(pedGroup);
    },

    createDustParticles: function() {
        const particleCount = 75;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
            scales[i] = Math.random() * 0.08 + 0.03;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create canvas texture for soft glow dot
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 235, 170, 1)');
        grad.addColorStop(0.4, 'rgba(212, 175, 55, 0.8)');
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(16, 16, 16, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.PointsMaterial({
            size: 0.15,
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.orbitParticles = new THREE.Points(geometry, mat);
        this.heroScene.add(this.orbitParticles);
    },

    createOrbitingElements: function() {
        this.orbitGroup = new THREE.Group();

        // 3 mini floating nuts orbiting around the center
        const miniAlmond = this.buildAlmondMesh(0.45);
        miniAlmond.position.set(2.4, 0.8, 0.5);
        this.orbitGroup.add(miniAlmond);

        const miniPistachio = this.buildPistachioMesh(0.4);
        miniPistachio.position.set(-2.2, -0.4, 1.2);
        this.orbitGroup.add(miniPistachio);

        const miniCashew = this.buildCashewMesh(0.45);
        miniCashew.position.set(0.8, -1.0, -1.8);
        this.orbitGroup.add(miniCashew);

        this.heroGroup.add(this.orbitGroup);
    },

    switchModel: function(modelKey) {
        this.currentModel = modelKey;
        if (this.activeMesh) {
            this.heroGroup.remove(this.activeMesh);
        }

        let newMesh;
        switch (modelKey) {
            case 'pistachio':
                newMesh = this.buildPistachioMesh(1.35);
                break;
            case 'almond':
                newMesh = this.buildAlmondMesh(1.4);
                break;
            case 'cashew':
                newMesh = this.buildCashewMesh(1.4);
                break;
            case 'walnut':
                newMesh = this.buildWalnutMesh(1.35);
                break;
            case 'date':
                newMesh = this.buildDateMesh(1.35);
                break;
            case 'saffron':
                newMesh = this.buildSaffronJarMesh(1.2);
                break;
            case 'giftbox':
                newMesh = this.buildGiftBoxMesh(1.2);
                break;
            default:
                newMesh = this.buildPistachioMesh(1.35);
        }

        newMesh.position.y = 0.1;
        this.activeMesh = newMesh;
        this.heroGroup.add(this.activeMesh);

        // Update active button state
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === modelKey);
        });
    },

    /* ================= PROCEDURAL 3D MESH GENERATORS ================= */

    buildPistachioMesh: function(scale = 1) {
        const group = new THREE.Group();

        // Outer shell material (organic beige with fine texture)
        const shellMat = new THREE.MeshStandardMaterial({
            color: 0xdec69a,
            roughness: 0.65,
            metalness: 0.05
        });

        // Left Shell Half
        const shellGeo1 = new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 0.95, 0, Math.PI);
        // Morph into elongated pistachio shell
        const pos1 = shellGeo1.attributes.position;
        for (let i = 0; i < pos1.count; i++) {
            let x = pos1.getX(i);
            let y = pos1.getY(i);
            let z = pos1.getZ(i);
            y *= 1.45; // elongated
            if (y > 0) {
                x *= 1 - (y * 0.18); // pointed tip
                z *= 1 - (y * 0.18);
            }
            pos1.setXYZ(i, x, y, z);
        }
        shellGeo1.computeVertexNormals();
        const shellMesh1 = new THREE.Mesh(shellGeo1, shellMat);
        shellMesh1.rotation.z = 0.12;
        shellMesh1.position.x = -0.22;
        group.add(shellMesh1);

        // Right Shell Half (slightly open)
        const shellGeo2 = shellGeo1.clone();
        const shellMesh2 = new THREE.Mesh(shellGeo2, shellMat);
        shellMesh2.rotation.y = Math.PI;
        shellMesh2.rotation.z = -0.12;
        shellMesh2.position.x = 0.22;
        group.add(shellMesh2);

        // Inner Pistachio Kernel (Vivid Emerald Green with purple/brown skin blush)
        const kernelGeo = new THREE.SphereGeometry(0.72, 32, 24);
        const kPos = kernelGeo.attributes.position;
        for (let i = 0; i < kPos.count; i++) {
            let x = kPos.getX(i);
            let y = kPos.getY(i);
            let z = kPos.getZ(i);
            y *= 1.35;
            x *= 0.85;
            kPos.setXYZ(i, x, y, z);
        }
        kernelGeo.computeVertexNormals();

        const kernelMat = new THREE.MeshStandardMaterial({
            color: 0x5fa838, // Rich fresh pistachio green
            roughness: 0.4,
            metalness: 0.1
        });
        const kernelMesh = new THREE.Mesh(kernelGeo, kernelMat);
        kernelMesh.position.set(0, 0, 0.05);
        group.add(kernelMesh);

        group.scale.set(scale, scale, scale);
        return group;
    },

    buildAlmondMesh: function(scale = 1) {
        const group = new THREE.Group();
        const geo = new THREE.SphereGeometry(1, 36, 28);
        const pos = geo.attributes.position;

        // Sculpt into teardrop almond shape with flattened profile
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            // Elongate along Y
            y *= 1.55;
            // Flatten along Z
            z *= 0.58;

            // Almond teardrop: pointed upper tip
            if (y > 0) {
                const taper = Math.max(0.1, 1 - (y / 1.55) * 0.75);
                x *= taper;
                z *= taper;
            } else {
                // Rounded bottom
                x *= 1.05;
            }

            // Organic surface wrinkles
            const wave = Math.sin(y * 8) * Math.cos(x * 6) * 0.035;
            pos.setXYZ(i, x + wave, y, z + wave);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            color: 0x9e5b27, // Golden amber almond kernel skin
            roughness: 0.55,
            metalness: 0.12
        });

        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        group.scale.set(scale, scale, scale);
        return group;
    },

    buildCashewMesh: function(scale = 1) {
        const group = new THREE.Group();

        // Curve path for cashew crescent
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.9, -0.6, 0),
            new THREE.Vector3(-0.7, 0.4, 0),
            new THREE.Vector3(0.0, 0.95, 0),
            new THREE.Vector3(0.8, 0.5, 0),
            new THREE.Vector3(0.65, -0.3, 0),
            new THREE.Vector3(0.2, -0.6, 0)
        ]);

        const geo = new THREE.TubeGeometry(curve, 40, 0.38, 20, false);
        // Scale ends
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            // Slight organic flattening
            z *= 0.85;
            pos.setXYZ(i, x, y, z);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
            color: 0xf5eedc, // Creamy ivory king cashew
            roughness: 0.35,
            metalness: 0.08
        });

        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        group.scale.set(scale, scale, scale);
        return group;
    },

    buildWalnutMesh: function(scale = 1) {
        const group = new THREE.Group();

        // 2 symmetrical convoluted walnut halves
        const mat = new THREE.MeshStandardMaterial({
            color: 0xb57c3d, // Amber golden walnut
            roughness: 0.7,
            metalness: 0.1
        });

        const buildLobe = (isLeft) => {
            const geo = new THREE.SphereGeometry(0.85, 32, 28);
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                let x = pos.getX(i);
                let y = pos.getY(i);
                let z = pos.getZ(i);

                y *= 1.25;
                z *= 0.8;
                // Deep brain-like grooves
                const groove = Math.sin(y * 10) * Math.cos(z * 9) * 0.09;
                x += groove;
                pos.setXYZ(i, x, y, z);
            }
            geo.computeVertexNormals();
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.x = isLeft ? -0.35 : 0.35;
            return mesh;
        };

        group.add(buildLobe(true));
        group.add(buildLobe(false));

        group.scale.set(scale, scale, scale);
        return group;
    },

    buildDateMesh: function(scale = 1) {
        const group = new THREE.Group();
        const geo = new THREE.SphereGeometry(0.9, 32, 28);
        const pos = geo.attributes.position;

        // Plump elongated Ajwa/Medjool Date
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            y *= 1.85; // elongated
            // Slight organic curvature
            x += Math.sin(y) * 0.12;

            // Date skin folds
            const fold = Math.sin(y * 12 + x * 4) * 0.04;
            pos.setXYZ(i, x + fold, y, z + fold);
        }
        geo.computeVertexNormals();

        // Glossy dark mahogany date skin
        const mat = new THREE.MeshStandardMaterial({
            color: 0x3d170f, // Deep dark Ajwa date brown
            roughness: 0.28,
            metalness: 0.2
        });

        const body = new THREE.Mesh(geo, mat);
        group.add(body);

        // Date Stem Cap (calyx)
        const capGeo = new THREE.ConeGeometry(0.35, 0.2, 8);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x7c603b, roughness: 0.8 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 1.65;
        group.add(cap);

        group.scale.set(scale, scale, scale);
        return group;
    },

    buildSaffronJarMesh: function(scale = 1) {
        const group = new THREE.Group();

        // Glass jar body
        const jarGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.6, 32);
        const jarMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.88,
            opacity: 0.95,
            transparent: true,
            roughness: 0.1,
            ior: 1.5
        });
        const jar = new THREE.Mesh(jarGeo, jarMat);
        group.add(jar);

        // Luxury Gold Lid
        const lidGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.35, 32);
        const lidMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.2
        });
        const lid = new THREE.Mesh(lidGeo, lidMat);
        lid.position.y = 0.95;
        group.add(lid);

        // Saffron Stigmas inside (Glowing Red/Crimson Particles & Strands)
        const strandCount = 28;
        const saffronGroup = new THREE.Group();
        const strandMat = new THREE.MeshStandardMaterial({
            color: 0xd11a1a,
            emissive: 0x700000,
            roughness: 0.4
        });

        for (let i = 0; i < strandCount; i++) {
            const strandGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.75 + Math.random() * 0.4, 6);
            const strand = new THREE.Mesh(strandGeo, strandMat);
            strand.position.set((Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 1.1);
            strand.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
            saffronGroup.add(strand);
        }
        group.add(saffronGroup);

        group.scale.set(scale, scale, scale);
        return group;
    },

    buildGiftBoxMesh: function(scale = 1) {
        const group = new THREE.Group();

        // Royal Emerald & Gold Box
        const boxGeo = new THREE.BoxGeometry(1.9, 0.9, 1.9);
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0x0e2f1f, // Royal Deep Forest Green
            metalness: 0.4,
            roughness: 0.3
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);

        // Gold Ribbon Cross
        const rib1Geo = new THREE.BoxGeometry(2.0, 0.94, 0.3);
        const rib2Geo = new THREE.BoxGeometry(0.3, 0.94, 2.0);
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.95,
            roughness: 0.15
        });

        const rib1 = new THREE.Mesh(rib1Geo, goldMat);
        const rib2 = new THREE.Mesh(rib2Geo, goldMat);
        group.add(rib1);
        group.add(rib2);

        // Gold Bow Knot on top
        const bowGeo = new THREE.TorusGeometry(0.25, 0.08, 12, 24);
        const bow1 = new THREE.Mesh(bowGeo, goldMat);
        bow1.rotation.y = Math.PI / 4;
        bow1.position.y = 0.55;
        group.add(bow1);

        const bow2 = new THREE.Mesh(bowGeo, goldMat);
        bow2.rotation.y = -Math.PI / 4;
        bow2.position.y = 0.55;
        group.add(bow2);

        group.scale.set(scale, scale, scale);
        return group;
    },

    /* ================= INTERACTION HANDLERS ================= */

    setupHeroInteractions: function(container) {
        let mouseX = 0;
        let mouseY = 0;

        // Mouse Parallax on canvas & window
        window.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            // Check if mouse inside or near canvas
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            mouseX = (e.clientX - centerX) / (rect.width / 2);
            mouseY = (e.clientY - centerY) / (rect.height / 2);

            if (!this.isDragging) {
                this.targetRotation.y = mouseX * 0.6;
                this.targetRotation.x = 0.2 + mouseY * 0.4;
            }
        });

        // Click and Drag rotation on canvas
        const canvas = this.heroRenderer.domElement;

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.isHeroRotating = false;
            this.prevMousePos = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                canvas.style.cursor = 'grab';
                // Resume auto-rotation after short delay
                setTimeout(() => {
                    const toggleBtn = document.getElementById('toggle-rotation-btn');
                    if (toggleBtn && toggleBtn.dataset.state !== 'off') {
                        this.isHeroRotating = true;
                    }
                }, 1200);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.activeMesh) return;
            const deltaX = e.clientX - this.prevMousePos.x;
            const deltaY = e.clientY - this.prevMousePos.y;

            this.activeMesh.rotation.y += deltaX * 0.015;
            this.activeMesh.rotation.x += deltaY * 0.015;

            this.prevMousePos = { x: e.clientX, y: e.clientY };
        });

        // Touch support for mobile devices
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.isHeroRotating = false;
                this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.isHeroRotating = true;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging || !this.activeMesh || e.touches.length !== 1) return;
            const deltaX = e.touches[0].clientX - this.prevMousePos.x;
            const deltaY = e.touches[0].clientY - this.prevMousePos.y;

            this.activeMesh.rotation.y += deltaX * 0.015;
            this.activeMesh.rotation.x += deltaY * 0.015;

            this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: true });

        canvas.style.cursor = 'grab';
    },

    animateHero: function() {
        requestAnimationFrame(() => this.animateHero());

        const time = performance.now() * 0.001;

        if (this.activeMesh) {
            if (this.isHeroRotating) {
                this.activeMesh.rotation.y += 0.012;
                this.activeMesh.position.y = 0.1 + Math.sin(time * 2.5) * 0.08;
            } else {
                // Smooth damping towards target
                this.activeMesh.rotation.y += (this.targetRotation.y - this.activeMesh.rotation.y) * 0.05;
                this.activeMesh.rotation.x += (this.targetRotation.x - this.activeMesh.rotation.x) * 0.05;
            }
        }

        // Orbit mini dry fruits
        if (this.orbitGroup) {
            this.orbitGroup.rotation.y = time * 0.4;
            this.orbitGroup.children.forEach((child, idx) => {
                child.rotation.x = time * 0.8 + idx;
                child.rotation.y = time * 0.6 + idx;
            });
        }

        // Floating dust particles animation
        if (this.orbitParticles) {
            this.orbitParticles.rotation.y = time * 0.08;
            this.orbitParticles.rotation.x = Math.sin(time * 0.1) * 0.1;
        }

        if (this.heroRenderer && this.heroScene && this.heroCamera) {
            this.heroRenderer.render(this.heroScene, this.heroCamera);
        }
    },

    /* ================= 3D MODAL INSPECTOR ================= */

    openModal3D: function(modelType, productName) {
        const modalContainer = document.getElementById('modal-3d-canvas-container');
        if (!modalContainer || typeof THREE === 'undefined') return;

        modalContainer.innerHTML = '';

        try {
            const width = modalContainer.clientWidth || 400;
            const height = modalContainer.clientHeight || 360;

            this.modalScene = new THREE.Scene();
            this.modalCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            this.modalCamera.position.set(0, 0, 4.2);

            this.modalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.modalRenderer.setSize(width, height);
            this.modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            modalContainer.appendChild(this.modalRenderer.domElement);

            // Lighting
            const amb = new THREE.AmbientLight(0xfff7e6, 1.2);
            this.modalScene.add(amb);

            const direct = new THREE.DirectionalLight(0xffdf88, 1.8);
            direct.position.set(4, 5, 4);
            this.modalScene.add(direct);

            // Mesh
            let mesh;
            switch (modelType) {
                case 'pistachio': mesh = this.buildPistachioMesh(1.4); break;
                case 'almond': mesh = this.buildAlmondMesh(1.45); break;
                case 'cashew': mesh = this.buildCashewMesh(1.45); break;
                case 'walnut': mesh = this.buildWalnutMesh(1.4); break;
                case 'date': mesh = this.buildDateMesh(1.4); break;
                case 'saffron': mesh = this.buildSaffronJarMesh(1.25); break;
                case 'giftbox': mesh = this.buildGiftBoxMesh(1.25); break;
                default: mesh = this.buildPistachioMesh(1.4);
            }

            this.modalMesh = mesh;
            this.modalScene.add(mesh);

            // Interactive Drag for Modal
            let isModalDragging = false;
            let lastPos = { x: 0, y: 0 };
            const mCanvas = this.modalRenderer.domElement;
            mCanvas.style.cursor = 'grab';

            mCanvas.addEventListener('mousedown', (e) => {
                isModalDragging = true;
                lastPos = { x: e.clientX, y: e.clientY };
                mCanvas.style.cursor = 'grabbing';
            });

            window.addEventListener('mouseup', () => {
                isModalDragging = false;
                mCanvas.style.cursor = 'grab';
            });

            mCanvas.addEventListener('mousemove', (e) => {
                if (!isModalDragging || !this.modalMesh) return;
                const dx = e.clientX - lastPos.x;
                const dy = e.clientY - lastPos.y;
                this.modalMesh.rotation.y += dx * 0.015;
                this.modalMesh.rotation.x += dy * 0.015;
                lastPos = { x: e.clientX, y: e.clientY };
            });

            // Touch
            mCanvas.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    isModalDragging = true;
                    lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
            }, { passive: true });

            mCanvas.addEventListener('touchmove', (e) => {
                if (!isModalDragging || !this.modalMesh || e.touches.length !== 1) return;
                const dx = e.touches[0].clientX - lastPos.x;
                const dy = e.touches[0].clientY - lastPos.y;
                this.modalMesh.rotation.y += dx * 0.015;
                this.modalMesh.rotation.x += dy * 0.015;
                lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }, { passive: true });

            const animateModal = () => {
                if (!this.modalRenderer) return;
                this.modalAnimFrame = requestAnimationFrame(animateModal);
                if (this.modalMesh && !isModalDragging) {
                    this.modalMesh.rotation.y += 0.01;
                }
                this.modalRenderer.render(this.modalScene, this.modalCamera);
            };

            cancelAnimationFrame(this.modalAnimFrame);
            animateModal();
        } catch (err) {
            console.error("Modal 3D viewer error:", err);
        }
    },

    closeModal3D: function() {
        if (this.modalAnimFrame) {
            cancelAnimationFrame(this.modalAnimFrame);
        }
        if (this.modalRenderer && this.modalRenderer.domElement) {
            this.modalRenderer.dispose();
            this.modalRenderer.domElement.remove();
            this.modalRenderer = null;
        }
    },

    activateCssFallback: function(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="css-3d-card-stage">
                <div class="css-3d-floating-nut pistachio-stage">
                    <img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" alt="Al Kabeer Abbasi 3D Showcase" class="hero-fallback-img">
                    <div class="css-3d-glow-ring"></div>
                </div>
            </div>
        `;
    }
};

// Auto initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    DryFruit3D.initHero();
});
