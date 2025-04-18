document.addEventListener('DOMContentLoaded', () => {
    const moon = document.querySelector('.moon');
    const sky = document.querySelector('.sky');
    const scene = document.querySelector('.scene');
    const ground = document.querySelector('.ground');
    const grassContainer = document.querySelector('.grass-blades');
    // Referencia al contenedor SVG
    const svgLinesContainer = document.getElementById('constellation-lines-svg');
    const svgNS = "http://www.w3.org/2000/svg"; // Namespace para crear elementos SVG

    const groundHeight = ground.offsetHeight;
    const sceneHeight = scene.offsetHeight;
    const sceneWidth = scene.offsetWidth;

    let starsCreated = false;
    let grassCreated = false;
    let constellationStars = [];
    let moonriseAnimationId = null;

    const constellationCoords = { // Asegúrate que estas coordenadas estén ajustadas
        'W': [ {x: 10, y: 20}, {x: 12, y: 35}, {x: 15, y: 28}, {x: 18, y: 35}, {x: 20, y: 20} ],
        'i1': [ {x: 24, y: 26}, {x: 24, y: 35} ], // Invertí el orden para dibujar de arriba a abajo
        'l': [ {x: 28, y: 20}, {x: 28, y: 35} ],
        'i2': [ {x: 32, y: 26}, {x: 32, y: 35} ], // Invertido
        'a': [ {x: 38, y: 20}, {x: 36, y: 35}, {x: 37, y: 28}, {x: 39, y: 28}, {x: 40, y: 35}], // Reordenado para trazo más lógico
        'n1': [ {x: 44, y: 20}, {x: 44, y: 35}, {x: 48, y: 20}, {x: 48, y: 35} ], // Reordenado para trazo
        'n2': [ {x: 52, y: 20}, {x: 52, y: 35}, {x: 56, y: 20}, {x: 56, y: 35} ], // Reordenado
        'i3': [ {x: 60, y: 26}, {x: 60, y: 35} ]  // Invertido
    };
    const letterOrder = ['W', 'i1', 'l', 'i2', 'a', 'n1', 'n2', 'i3'];
    let currentLetterIndex = 0;

    function setupNightScene() {
        if (!starsCreated) {
            createNormalStars(80);
            createConstellation();
            starsCreated = true;
        }
        if (!grassCreated) {
            createGrass(80);
            grassCreated = true;
        }

        document.querySelectorAll('.star:not(.constellation-star)').forEach(star => {
            setTimeout(() => {
                star.style.opacity = Math.random() * 0.3 + 0.1;
                const duration = Math.random() * 2 + 1.5;
                const delay = Math.random() * 3;
                star.style.animationDuration = `${duration}s`;
                star.style.animationDelay = `${delay}s`;
            }, Math.random() * 4000);
        });

        setTimeout(startMoonrise, 1500);
    }

    function startMoonrise() {
        const targetBottom = '40%';
        moon.style.bottom = targetBottom;
        currentLetterIndex = 0;
        moonriseAnimationId = requestAnimationFrame(checkMoonPosition);
    }

    function checkMoonPosition() {
        const moonRect = moon.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        const moonBottomEdge = sceneRect.bottom - moonRect.bottom;
        const moonBottomPercent = (moonBottomEdge / sceneHeight) * 100;
        const activationThresholds = [5, 10, 15, 20, 25, 30, 35, 40];

        if (currentLetterIndex < letterOrder.length && moonBottomPercent >= activationThresholds[currentLetterIndex]) {
            const letterToActivate = letterOrder[currentLetterIndex];
            activateLetter(letterToActivate);
            currentLetterIndex++;
        }

        if (currentLetterIndex < letterOrder.length && moonBottomPercent < 45) {
             moonriseAnimationId = requestAnimationFrame(checkMoonPosition);
        } else {
             cancelAnimationFrame(moonriseAnimationId);
             console.log("Constelación completada o luna alta.");
        }
    }

    function activateLetter(letterKey) {
        console.log("Activando letra:", letterKey);
        const starsToActivate = constellationStars.filter(starData => starData.letter === letterKey);
        let maxDelay = 0;

        starsToActivate.forEach((starData, index) => {
            const delay = index * 150; // Delay para activar estrella
            setTimeout(() => {
                 starData.element.classList.add('active');
            }, delay);
            if (delay > maxDelay) maxDelay = delay;
        });

        // Iniciar el dibujo de líneas DESPUÉS de que la última estrella de la letra se active
        setTimeout(() => {
            drawLinesForLetter(letterKey);
        }, maxDelay + 100); // Pequeño margen de 100ms
    }

    // --- Nueva Función para Dibujar Líneas ---
    function drawLinesForLetter(letterKey) {
        const coords = constellationCoords[letterKey];
        if (coords.length < 2) return; // No se pueden dibujar líneas con menos de 2 puntos

        console.log("Dibujando líneas para:", letterKey);

        for (let i = 1; i < coords.length; i++) {
            const p1 = coords[i-1];
            const p2 = coords[i];

            // Convertir porcentajes a píxeles absolutos dentro de la escena/SVG
            const x1 = (p1.x / 100) * sceneWidth;
            const y1 = (p1.y / 100) * sceneHeight;
            const x2 = (p2.x / 100) * sceneWidth;
            const y2 = (p2.y / 100) * sceneHeight;

            // Crear el elemento <line> de SVG
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            // line.style.opacity = 0; // Inicialmente invisible (ya definido en CSS)

            // Añadir al SVG con un delay para efecto secuencial
            const lineDelay = (i - 1) * 200; // 200ms entre líneas
            setTimeout(() => {
                svgLinesContainer.appendChild(line);
                 // Forzar reflow para asegurar que la transición se aplica
                void line.offsetWidth;
                // Hacer visible la línea (la transición CSS hace el resto)
                line.style.opacity = 1; // O el valor final deseado de CSS
            }, lineDelay);
        }

        // --- Conexiones especiales (si es necesario) ---
        // Por ejemplo, conectar el último punto de 'W' al primero (opcional)
        // O conectar letras entre sí (más complejo, requeriría lógica adicional)
         if (letterKey === 'W' && coords.length > 1) {
              // Ejemplo: conectar el último punto con el primero para cerrar la W (no estándar)
             // const pLast = coords[coords.length - 1];
             // const pFirst = coords[0];
             // ... crear y añadir otra línea ...
         }
         // Podrías añadir lógica para conectar el final de una letra con el inicio de la siguiente
    }


    function createNormalStars(numberOfStars) {
        const skyHeight = sceneHeight - groundHeight;
        for (let i = 0; i < numberOfStars; i++) {
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

    function createConstellation() {
        // Limpiar líneas anteriores si se re-crea (importante para pruebas)
        while (svgLinesContainer.firstChild) {
            svgLinesContainer.removeChild(svgLinesContainer.firstChild);
        }
        constellationStars = []; // Limpiar array de estrellas

        letterOrder.forEach(letterKey => {
            const coords = constellationCoords[letterKey];
            coords.forEach((coord, index) => {
                const star = document.createElement('div');
                star.classList.add('star', 'constellation-star');
                star.style.left = `${coord.x}%`;
                star.style.top = `${coord.y}%`;
                constellationStars.push({ element: star, letter: letterKey, index: index });
                sky.appendChild(star);
            });
        });
         console.log("Estrellas de constelación creadas:", constellationStars.length);
    }


    function createGrass(numberOfBlades) {
        // Limpiar hierba anterior
         while (grassContainer.firstChild) {
             grassContainer.removeChild(grassContainer.firstChild);
         }
        for (let i = 0; i < numberOfBlades; i++) {
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

    setupNightScene();
});