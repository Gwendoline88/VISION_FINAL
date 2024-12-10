let puntuacion = 0;
let tiempo = 60; // Tiempo total del juego
let colores = ["ROJO", "AZUL", "AMARILLO", "VERDE", "MORADO"];
let colorObjetivo = "";
let intervaloDeteccion;

const soundCorrect = new Audio('/static/sounds/correct.mp3'); // Sonido al acertar
const soundWrong = new Audio('/static/sounds/wrong.mp3'); // Sonido de error

function iniciarJuego() {
    puntuacion = 0;
    tiempo = 60;
    document.getElementById('points').innerText = puntuacion;
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('progress').style.width = '100%';

    iniciarTemporizador();
    generarMonstruos();
    activarCamara();
}

function iniciarTemporizador() {
    const progressElement = document.getElementById('progress');
    const timer = setInterval(() => {
        tiempo--;
        document.getElementById('time-left').innerText = tiempo;
        progressElement.style.width = `${(tiempo / 60) * 100}%`;

        if (tiempo <= 0) {
            clearInterval(timer);
            finalizarJuego();
        }
    }, 1000);
}

function generarMonstruos() {
    const container = document.getElementById('monsters-container');
    container.innerHTML = ''; // Limpia monstruos anteriores

    // Seleccionar un color objetivo
    colorObjetivo = colores[Math.floor(Math.random() * colores.length)];
    document.getElementById('color-name').innerText = colorObjetivo;

    // Generar múltiples monstruos (3-5 aleatorios) y garantizar que al menos uno sea del color objetivo
    const totalMonstruos = Math.floor(Math.random() * 3) + 3; // Generar entre 3 y 5 monstruos
    for (let i = 0; i < totalMonstruos; i++) {
        const monster = document.createElement('div');
        monster.className = 'monster';
        monster.style.top = `${Math.random() * 60}vh`;
        monster.style.left = `${Math.random() * 80}vw`;

        const color = i === 0 ? colorObjetivo : colores[Math.floor(Math.random() * colores.length)];
        monster.setAttribute('data-color', color);
        monster.innerHTML = `<img src="/static/monster_${color.toLowerCase()}.jpg" alt="Monster ${color}">`;
        container.appendChild(monster);
    }
}

function activarCamara() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.style.display = "block";
            detectarColores(video);
        })
        .catch(err => {
            console.error("Error al activar la cámara:", err);
        });
}

function detectarColores(video) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (intervaloDeteccion) clearInterval(intervaloDeteccion);

    intervaloDeteccion = setInterval(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const colorDetectado = obtenerColorPromedio(ctx, canvas.width, canvas.height);
        console.log("Color detectado:", colorDetectado); // Depuración

        // Comparar el color detectado con el color objetivo
        if (colorDetectado === colorObjetivo) {
            puntuacion += 10;
            document.getElementById('points').innerText = puntuacion;

            soundCorrect.play();
            generarMonstruos();
        } else if (colorDetectado !== "NINGUNO") {
            soundWrong.play();
        }
    }, 1000);
}

function obtenerColorPromedio(ctx, width, height) {
    const regionSize = 150; // Tamaño del área para promediar colores
    const x = width / 2 - regionSize / 2;
    const y = height / 2 - regionSize / 2;

    const imageData = ctx.getImageData(x, y, regionSize, regionSize);
    const data = imageData.data;

    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }

    const totalPixels = data.length / 4;
    r = Math.round(r / totalPixels);
    g = Math.round(g / totalPixels);
    b = Math.round(b / totalPixels);

    return determinarColor([r, g, b]);
}

function determinarColor([r, g, b]) {
    console.log(`Valores RGB detectados: R=${r}, G=${g}, B=${b}`); // Depuración

    // Rango ajustado para ROJO
    if (r > 190 && g < 100 && b < 100) return "ROJO";

    // Rango ajustado para VERDE
    if (r < 120 && g > 140 && b < 120) return "VERDE";

    // Rango ajustado para AZUL
    if (r < 120 && g < 150 && b > 160) return "AZUL";

    // Rango ajustado para AMARILLO
    if (r > 180 && g > 160 && b < 100) return "AMARILLO";

    // Rango ajustado para MORADO
    if (r > 120 && g < 100 && b > 120) return "MORADO";

    // Si no coincide con ninguno, devuelve "NINGUNO"
    return "NINGUNO";
}


function finalizarJuego() {
    clearInterval(intervaloDeteccion);
    alert(`¡Juego terminado! Puntuación final: ${puntuacion}`);
    document.getElementById('monsters-container').innerHTML = '';
    document.getElementById('start-button').style.display = 'block';
}