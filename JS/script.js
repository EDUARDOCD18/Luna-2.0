document.addEventListener('DOMContentLoaded', () => {
    const moon = document.querySelector('.moon');
    const sky = document.querySelector('.sky');
    const scene = document.querySelector('.scene');
    const ground = document.querySelector('.ground');
    const grassContainer = document.querySelector('.grass-blades');
    const svgLinesContainer = document.getElementById('constellation-lines-svg');
    const svgNS = "http://www.w3.org/2000/svg";

    const groundHeight = ground.offsetHeight;
    const sceneHeight = scene.offsetHeight;
    const sceneWidth = scene.offsetWidth;

    let starsCreated = false;
    let grassCreated = false;
    let moonriseAnimationId = null;
    let secondConstellationTimeoutId = null; // ID para el timeout de la segunda constelación

    // --- Fragmento de script.js ---

    // --- Datos de las Constelaciones ---
    const constellationsData = {
        teAmo: {
            name: "Te amo,",
            coords: { // Posición más arriba
                'T': [ {x: 25, y: 15}, {x: 35, y: 15}, {x: 30, y: 15}, {x: 30, y: 25} ], // Coordenadas para T (sin cambios)
                // --- 'E' Corregida según la imagen ---
                // Puntos: 1(TR), 2(TL), 3(BL), 4(BR), 5(Mid)
                'e': [
                    {x: 42, y: 15}, // 1. Top-Right
                    {x: 38, y: 15}, // 2. Top-Left
                    {x: 38, y: 25}, // 3. Bottom-Left
                    {x: 42, y: 25}, // 4. Bottom-Right
                    {x: 39, y: 20}  // 5. Middle-Leftish (Punto de conexión)
                    // Líneas que se dibujarán: 1->2, 2->3, 3->4, 4->5
                ],
                // ------------------------------------
                'a': [ {x: 48, y: 25}, {x: 50, y: 15}, {x: 52, y: 25}, {x: 51, y: 20}, {x: 49, y: 20} ], // 'a' simplificada
                'm': [ {x: 56, y: 25}, {x: 56, y: 15}, {x: 58, y: 20}, {x: 60, y: 15}, {x: 60, y: 25} ],
                'o': [ {x: 64, y: 15}, {x: 66, y: 15}, {x: 66, y: 25}, {x: 64, y: 25}, {x: 64, y: 15} ],
                ',': [ {x: 68, y: 27}, {x: 67, y: 30} ] // Coma simple
            },
            order: ['T', 'e', 'a', 'm', 'o', ','], // Orden de letras
            stars: [],
            activationThresholds: [5, 10, 17, 24, 31, 36],
            id: 'teAmo'
        },
        wilianni: { // Datos de Wilianni (sin cambios aquí)
            name: "Wilianni",
            coords: {
                'W': [ {x: 15, y: 55}, {x: 17, y: 70}, {x: 20, y: 63}, {x: 23, y: 70}, {x: 25, y: 55} ],
                'i1': [ {x: 29, y: 61}, {x: 29, y: 70} ],
                'l': [ {x: 33, y: 55}, {x: 33, y: 70} ],
                'i2': [ {x: 37, y: 61}, {x: 37, y: 70} ],
                'a': [ {x: 42, y: 55}, {x: 40, y: 70}, {x: 41, y: 63}, {x: 43, y: 63}, {x: 44, y: 70} ],
                'n1': [ {x: 48, y: 55}, {x: 48, y: 70}, {x: 52, y: 55}, {x: 52, y: 70} ],
                'n2': [ {x: 56, y: 55}, {x: 56, y: 70}, {x: 60, y: 55}, {x: 60, y: 70} ],
                'i3': [ {x: 64, y: 61}, {x: 64, y: 70} ]
            },
            order: ['W', 'i1', 'l', 'i2', 'a', 'n1', 'n2', 'i3'],
            stars: [],
            activationDelay: 2500,
            letterAppearanceDelay: 400,
            id: 'wilianni'
        }
    };

    // ... resto del código JavaScript (setupNightScene, startMoonrise, checkMoonPositionForTeAmo, etc.) ...
    // --- No se necesitan más cambios en el resto del JS ---

// --- Fin del fragmento ---
    let currentTeAmoIndex = 0;

    function setupNightScene() {
        if (!starsCreated) {
            createNormalStars(80);
            createConstellationSets();
            starsCreated = true;
        }
        if (!grassCreated) {
            createGrass(80);
            grassCreated = true;
        }

        // Aparecer estrellas normales
        document.querySelectorAll('.star:not(.constellation-star)').forEach(star => {
            setTimeout(() => {
                star.style.opacity = Math.random() * 0.3 + 0.1;
                const duration = Math.random() * 2 + 1.5;
                const delay = Math.random() * 3;
                star.style.animationDuration = `${duration}s`;
                star.style.animationDelay = `${delay}s`;
            }, Math.random() * 4000);
        });

        // Reiniciar estado y empezar
        currentTeAmoIndex = 0;
        clearTimeout(secondConstellationTimeoutId); // Limpiar timeout previo si existe
        setTimeout(startMoonrise, 1500);
    }

    function startMoonrise() {
        const targetBottom = '40%';
        moon.style.bottom = targetBottom;
        moonriseAnimationId = requestAnimationFrame(checkMoonPositionForTeAmo);
    }

    // Chequea la luna SÓLO para activar "Te amo,"
    function checkMoonPositionForTeAmo() {
        const moonRect = moon.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        const moonBottomEdge = sceneRect.bottom - moonRect.bottom;
        const moonBottomPercent = (moonBottomEdge / sceneHeight) * 100;
        const data = constellationsData.teAmo;

        if (currentTeAmoIndex < data.order.length && moonBottomPercent >= data.activationThresholds[currentTeAmoIndex]) {
            const letterToActivate = data.order[currentTeAmoIndex];
            activateLetter(data.id, letterToActivate); // Pasa el ID
            currentTeAmoIndex++;

            // Si acabamos de activar la última letra de "Te amo,"
            if (currentTeAmoIndex === data.order.length) {
                console.log("Constelación 'Te amo,' completa. Esperando para 'Wilianni'.");
                 // Esperamos un poco más después de que la última letra termine de dibujarse sus líneas
                 const lastLetterDrawTime = (data.coords[letterToActivate]?.length || 1 -1) * 200 + 100; // Estimación del tiempo de dibujo de líneas
                secondConstellationTimeoutId = setTimeout(
                    startSecondConstellation,
                    constellationsData.wilianni.activationDelay + lastLetterDrawTime
                 );
                cancelAnimationFrame(moonriseAnimationId); // Detenemos este chequeo
                return; // Salimos para no volver a pedir frame
            }
        }

        // Continuar si quedan letras y la luna no ha subido demasiado
        if (currentTeAmoIndex < data.order.length && moonBottomPercent < 45) {
             moonriseAnimationId = requestAnimationFrame(checkMoonPositionForTeAmo);
        } else {
             // Si la luna sube demasiado y no se completó, igual paramos
             cancelAnimationFrame(moonriseAnimationId);
             console.log("Ascenso de luna terminado (o constelación 'Te amo,' incompleta).");
              // Podríamos forzar el inicio de la segunda aquí si quisiéramos
              // if (currentTeAmoIndex === data.order.length) { // Si se completó justo al final
              //     secondConstellationTimeoutId = setTimeout(startSecondConstellation, constellationsData.wilianni.activationDelay);
              // }
        }
    }

    // Inicia la aparición secuencial de "Wilianni"
    function startSecondConstellation() {
        console.log("Iniciando constelación 'Wilianni'.");
        const data = constellationsData.wilianni;
        let letterIndex = 0;

        function showNextLetter() {
            if (letterIndex < data.order.length) {
                const letterKey = data.order[letterIndex];
                activateLetter(data.id, letterKey); // Pasa el ID 'wilianni'
                letterIndex++;
                setTimeout(showNextLetter, data.letterAppearanceDelay); // Espera para la siguiente
            } else {
                console.log("Constelación 'Wilianni' completa.");
            }
        }
        showNextLetter(); // Inicia la secuencia
    }

    // Activa estrellas y luego dibuja líneas para una letra de una constelación específica
    function activateLetter(constellationId, letterKey) {
        const data = constellationsData[constellationId];
        const starsToActivate = data.stars.filter(starData => starData.letter === letterKey);
        let maxDelay = 0;

        console.log(`Activando ${constellationId} - Letra: ${letterKey}`);

        starsToActivate.forEach((starData, index) => {
            const delay = index * 150;
            setTimeout(() => {
                 starData.element.classList.add('active');
            }, delay);
            if (delay > maxDelay) maxDelay = delay;
        });

        // Dibuja líneas después de activar la última estrella de la letra
        setTimeout(() => {
            drawLinesForLetter(constellationId, letterKey);
        }, maxDelay + 100);
    }

    // Dibuja líneas para una letra de una constelación específica
    function drawLinesForLetter(constellationId, letterKey) {
        const data = constellationsData[constellationId];
        const coords = data.coords[letterKey];
        if (!coords || coords.length < 2) return;

        console.log(`Dibujando líneas ${constellationId} - Letra: ${letterKey}`);

        for (let i = 1; i < coords.length; i++) {
            const p1 = coords[i-1];
            const p2 = coords[i];
            const x1 = (p1.x / 100) * sceneWidth;
            const y1 = (p1.y / 100) * sceneHeight;
            const x2 = (p2.x / 100) * sceneWidth;
            const y2 = (p2.y / 100) * sceneHeight;

            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', x1); line.setAttribute('y1', y1);
            line.setAttribute('x2', x2); line.setAttribute('y2', y2);
            // Opcional: añadir clase específica si es necesario
            // line.classList.add(`line-${constellationId}`);

            const lineDelay = (i - 1) * 150; // Delay reducido entre líneas
            setTimeout(() => {
                svgLinesContainer.appendChild(line);
                void line.offsetWidth;
                line.style.opacity = 1;
            }, lineDelay);
        }
    }

    // Crea estrellas normales
    function createNormalStars(numberOfStars) {
         const skyHeight = sceneHeight - groundHeight;
         document.querySelectorAll('.star:not(.constellation-star)').forEach(s => s.remove()); // Limpiar previas
        for (let i = 0; i < numberOfStars; i++) {
            // ... (código igual que antes) ...
            const star = document.createElement('div');
            star.classList.add('star');
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * (skyHeight / sceneHeight) * 90}%`;
            const size = Math.random() > 0.7 ? 2 : 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            sky.appendChild(star);
        }
    }

    // Crea AMBOS conjuntos de estrellas de constelación
    function createConstellationSets() {
        // Limpiar SVG y estrellas de constelaciones previas
        while (svgLinesContainer.firstChild) { svgLinesContainer.removeChild(svgLinesContainer.firstChild); }
        document.querySelectorAll('.constellation-star').forEach(s => s.remove());
        constellationsData.teAmo.stars = []; // Vaciar arrays
        constellationsData.wilianni.stars = [];

        // Iterar sobre los datos de las dos constelaciones
        Object.values(constellationsData).forEach(data => {
            data.order.forEach(letterKey => {
                const coords = data.coords[letterKey];
                 if (!coords) {
                    console.warn(`Coordenadas no encontradas para letra '${letterKey}' en constelación '${data.name}'`);
                    return;
                 }
                coords.forEach((coord, index) => {
                    const star = document.createElement('div');
                    star.classList.add('star', 'constellation-star');
                     // Opcional: añadir clase específica
                     // star.classList.add(`star-${data.id}`);
                    star.setAttribute('data-constellation', data.id); // Atributo para identificar
                    star.style.left = `${coord.x}%`;
                    star.style.top = `${coord.y}%`;
                    // Guardar en el array correspondiente dentro de constellationsData
                    data.stars.push({ element: star, letter: letterKey, index: index });
                    sky.appendChild(star);
                });
            });
             console.log(`Estrellas para '${data.name}' creadas: ${data.stars.length}`);
        });
    }

    // Crea hierba
    function createGrass(numberOfBlades) {
        while (grassContainer.firstChild) { grassContainer.removeChild(grassContainer.firstChild); }
        for (let i = 0; i < numberOfBlades; i++) {
             // ... (código igual que antes) ...
            const blade = document.createElement('div');
            blade.classList.add('grass-blade');
            blade.style.left = `${Math.random() * 100}%`;
            blade.style.height = `${Math.random() * 4 + 6}px`;
            const duration = Math.random() * 2 + 2.5;
            const delay = Math.random() * 1.5;
            blade.style.animationDuration = `${duration}s`;
            blade.style.animationDelay = `${delay}s`;
            grassContainer.appendChild(blade);
        }
    }

    // Iniciar todo
    setupNightScene();
});