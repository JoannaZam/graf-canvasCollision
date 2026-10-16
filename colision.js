
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const puntosTexto = document.getElementById("puntos");
const cantidadTexto = document.getElementById("cantidad");
const mensaje = document.getElementById("mensaje");

const TOTAL_OBJETOS = 25;

let puntos = 0;
let objetos = [];
let estrellasFondo = [];
let ancho = window.innerWidth;
let alto = window.innerHeight;
let ultimoTiempo = 0;
let temporizadorMensaje = null;

// Colores suaves para los planetas
const coloresPlanetas = [
    "#E99AA8",
    "#9A96D9",
    "#79C5CE",
    "#E9B879",
    "#91C59B",
    "#C6A0D9",
    "#E5D18A",
    "#8FAEDB",
    "#D99478"
];

// Ajustar canvas al tamaño de la pantalla
function ajustarCanvas() {
    const escala = window.devicePixelRatio || 1;

    ancho = window.innerWidth;
    alto = window.innerHeight;

    canvas.width = Math.round(ancho * escala);
    canvas.height = Math.round(alto * escala);

    canvas.style.width = ancho + "px";
    canvas.style.height = alto + "px";

    ctx.setTransform(escala, 0, 0, escala, 0, 0);

    crearEstrellasFondo();
}

// Estrellas pequeñas del fondo
function crearEstrellasFondo() {
    estrellasFondo = [];

    const total = Math.floor((ancho * alto) / 4000);

    for (let i = 0; i < total; i++) {
        estrellasFondo.push({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            radio: Math.random() * 1.2 + 0.4,
            opacidad: Math.random() * 0.35 + 0.2
        });
    }
}

// Fondo espacial
function dibujarFondo() {
    const fondo = ctx.createLinearGradient(0, 0, ancho, alto);

    fondo.addColorStop(0, "#101329");
    fondo.addColorStop(0.5, "#1B1D3B");
    fondo.addColorStop(1, "#29203F");

    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, alto);

    // Nebulosa morada discreta
    const nebulosa = ctx.createRadialGradient(
        ancho * 0.25, alto * 0.45, 5,
        ancho * 0.25, alto * 0.45, ancho * 0.42
    );

    nebulosa.addColorStop(0, "rgba(113, 95, 163, 0.17)");
    nebulosa.addColorStop(1, "rgba(113, 95, 163, 0)");

    ctx.fillStyle = nebulosa;
    ctx.fillRect(0, 0, ancho, alto);

    // Nebulosa azulada
    const nebulosaAzul = ctx.createRadialGradient(
        ancho * 0.8, alto * 0.65, 5,
        ancho * 0.8, alto * 0.65, ancho * 0.35
    );

    nebulosaAzul.addColorStop(0, "rgba(76, 103, 150, 0.13)");
    nebulosaAzul.addColorStop(1, "rgba(76, 103, 150, 0)");

    ctx.fillStyle = nebulosaAzul;
    ctx.fillRect(0, 0, ancho, alto);

    // Estrellas del fondo
    for (const estrella of estrellasFondo) {
        ctx.beginPath();

        ctx.arc(
            estrella.x,
            estrella.y,
            estrella.radio,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(230, 233, 255, ${estrella.opacidad})`;

        ctx.fill();
    }
}

// Clase para planetas, estrellas y lunas
class ObjetoEspacial {
    constructor(tipo, posicionInicial = false) {
        this.tipo = tipo;

        this.radio = tipo === "luna"
            ? 25
            : 19 + Math.random() * 7;

        this.color = coloresPlanetas[
            Math.floor(Math.random() * coloresPlanetas.length)
        ];

        this.tieneAnillo = tipo === "anillo";

        this.reiniciar(posicionInicial);
    }

    // Velocidad según los objetos atrapados
    obtenerMultiplicador() {
        if (puntos > 20) return 1.6;
        if (puntos > 10) return 1.25;
        return 1;
    }

    // Aparecer desde arriba
    reiniciar(posicionInicial = false) {
        const margen = this.radio * 2;

        this.x = margen + Math.random() *
            Math.max(1, ancho - margen * 2);

        this.y = posicionInicial
            ? Math.random() * Math.max(1, alto * 0.65)
            : -this.radio * 2;

        const multiplicador = this.obtenerMultiplicador();

        this.velocidadY =
            (1.1 + Math.random() * 0.8) * multiplicador;

        this.velocidadX = (Math.random() - 0.5) * 0.65;

        this.gravedad = 0.075;
        this.fuerzaRebote = 2.8 + Math.random() * 0.8;
        this.detener = false;
    }

    // Planetas de caricatura sin brillo intenso
    dibujarPlaneta() {
        ctx.save();

        // Anillo trasero
        if (this.tieneAnillo) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(-0.3);

            ctx.beginPath();
            ctx.ellipse(
                0, 0,
                this.radio * 1.55,
                this.radio * 0.48,
                0, 0, Math.PI * 2
            );

            ctx.strokeStyle = "#D8C4A5";
            ctx.lineWidth = this.radio * 0.24;
            ctx.stroke();

            ctx.restore();
        }

        // Cuerpo del planeta
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radio,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = this.color;
        ctx.fill();

        // Borde estilo caricatura
        ctx.strokeStyle = "#393653";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bandas decorativas
        ctx.save();

        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            this.radio - 1,
            0,
            Math.PI * 2
        );
        ctx.clip();

        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = Math.max(3, this.radio * 0.18);

        ctx.beginPath();
        ctx.ellipse(
            this.x,
            this.y - this.radio * 0.25,
            this.radio * 0.85,
            this.radio * 0.22,
            -0.12,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.strokeStyle = "#55465D";
        ctx.lineWidth = Math.max(2, this.radio * 0.12);

        ctx.beginPath();
        ctx.ellipse(
            this.x,
            this.y + this.radio * 0.35,
            this.radio * 0.9,
            this.radio * 0.13,
            0.1,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.restore();

        // Anillo delantero
        if (this.tieneAnillo) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(-0.3);

            ctx.beginPath();
            ctx.ellipse(
                0, 0,
                this.radio * 1.55,
                this.radio * 0.48,
                0, Math.PI, Math.PI * 2
            );

            ctx.strokeStyle = "#E8D5B7";
            ctx.lineWidth = this.radio * 0.2;
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }

    // Estrellas amarillas con brillo suave
    dibujarEstrella() {
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(-Math.PI / 2);

        ctx.shadowColor = "#FFE78A";
        ctx.shadowBlur = 7;

        const puntas = 5;

        ctx.beginPath();

        for (let i = 0; i < puntas * 2; i++) {
            const angulo = i * Math.PI / puntas;

            const radio = i % 2 === 0
                ? this.radio
                : this.radio * 0.46;

            const x = Math.cos(angulo) * radio;
            const y = Math.sin(angulo) * radio;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fillStyle = "#FFDC59";
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#FFF0A3";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    // Luna creciente con dos arcos circulares
    
    // Luna creciente con puntas finas y curva suave
    dibujarLuna() {
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(-0.15);

        const r = this.radio;

        ctx.beginPath();

        // Borde exterior redondeado
        ctx.arc(
            0, 0,
            r,
            -Math.PI / 2,
            Math.PI / 2,
            false
        );

        // Borde interior cóncavo
        ctx.quadraticCurveTo(
            r * 0.12,
            0,
            0,
            -r
        );

        ctx.closePath();

        ctx.fillStyle = "#FFF8D9";
        ctx.fill();

        ctx.strokeStyle = "#D8D2B9";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pequeño cráter
        ctx.beginPath();
        ctx.arc(
            r * 0.55,
            -r * 0.15,
            r * 0.055,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#E5DFC7";
        ctx.fill();

        ctx.restore();
    }

    // Elegir el dibujo de cada objeto
    dibujar() {
        if (this.tipo === "estrella") {
            this.dibujarEstrella();
        } else if (this.tipo === "luna") {
            this.dibujarLuna();
        } else {
            this.dibujarPlaneta();
        }
    }

    // Movimiento, gravedad y rebotes
    actualizar(delta) {
        if (this.detener) {
            this.reiniciar();
            return;
        }

        const factor = delta / 16.67;

        this.x += this.velocidadX * factor;
        this.y += this.velocidadY * factor;

        this.velocidadY += this.gravedad * factor;

        // Rebote en los lados
        if (this.x + this.radio >= ancho) {
            this.x = ancho - this.radio;
            this.velocidadX = -Math.abs(this.velocidadX);
        }

        if (this.x - this.radio <= 0) {
            this.x = this.radio;
            this.velocidadX = Math.abs(this.velocidadX);
        }

        // Rebote en la parte inferior
        if (this.y + this.radio >= alto) {
            this.y = alto - this.radio;
            this.velocidadY = -this.fuerzaRebote;

            this.fuerzaRebote *= 0.62;

            if (this.fuerzaRebote < 0.45) {
                this.detener = true;
            }
        }
    }

    // Detectar clic sobre el objeto
    contienePunto(mouseX, mouseY) {
        const distancia = Math.hypot(
            mouseX - this.x,
            mouseY - this.y
        );

        return distancia <= this.radio * 1.2;
    }
}

// Crear exactamente 25 objetos
function crearObjetos() {
    objetos = [];

    const tipos = [
        ...Array(8).fill("anillo"),
        ...Array(7).fill("planeta"),
        ...Array(5).fill("estrella"),
        ...Array(5).fill("luna")
    ];

    // Mezclar los tipos aleatoriamente
    for (let i = tipos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tipos[i], tipos[j]] = [tipos[j], tipos[i]];
    }

    for (let i = 0; i < TOTAL_OBJETOS; i++) {
        const objeto = new ObjetoEspacial(tipos[i], true);

        let intentos = 0;

        // Intentar que los objetos aparezcan separados
        do {
            objeto.x = objeto.radio * 2 +
                Math.random() *
                Math.max(1, ancho - objeto.radio * 4);

            objeto.y = objeto.radio * 2 +
                Math.random() *
                Math.max(1, alto * 0.65 - objeto.radio * 2);

            intentos++;
        } while (
            intentos < 35 &&
            objetos.some(otro =>
                Math.hypot(
                    otro.x - objeto.x,
                    otro.y - objeto.y
                ) < otro.radio + objeto.radio + 12
            )
        );

        objetos.push(objeto);
    }

    actualizarContador();
}

// Actualizar los contadores
function actualizarContador() {
    puntosTexto.textContent = puntos;
    cantidadTexto.textContent = objetos.length;
}

// Mensajes de dificultad
function mostrarMensaje(texto) {
    mensaje.textContent = texto;

    if (temporizadorMensaje !== null) {
        clearTimeout(temporizadorMensaje);
    }

    temporizadorMensaje = setTimeout(() => {
        mensaje.textContent = "";
        temporizadorMensaje = null;
    }, 1400);
}

// Animación del juego
function animar(tiempo) {
    const delta = ultimoTiempo === 0
        ? 16.67
        : Math.min(tiempo - ultimoTiempo, 32);

    ultimoTiempo = tiempo;

    dibujarFondo();

    for (const objeto of objetos) {
        objeto.actualizar(delta);
        objeto.dibujar();
    }

    requestAnimationFrame(animar);
}

// Atrapar objetos con clic izquierdo
canvas.addEventListener("pointerdown", evento => {
    if (
        evento.pointerType === "mouse" &&
        evento.button !== 0
    ) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const mouseX = evento.clientX - rect.left;
    const mouseY = evento.clientY - rect.top;

    for (let i = objetos.length - 1; i >= 0; i--) {
        const objeto = objetos[i];

        if (objeto.contienePunto(mouseX, mouseY)) {
            puntos++;

            // El objeto atrapado reaparece arriba
            objeto.reiniciar();

            actualizarContador();

            if (puntos === 11) {
                mostrarMensaje("¡Velocidad media! 🚀");
            }

            if (puntos === 21) {
                mostrarMensaje("¡Velocidad alta! ⭐");
            }

            break;
        }
    }
});

// Ajustar al cambiar el tamaño de la ventana
window.addEventListener("resize", () => {
    ajustarCanvas();

    for (const objeto of objetos) {
        objeto.x = Math.max(
            objeto.radio,
            Math.min(objeto.x, ancho - objeto.radio)
        );

        objeto.y = Math.max(
            objeto.radio,
            Math.min(objeto.y, alto - objeto.radio)
        );
    }
});

// Iniciar el juego
ajustarCanvas();
crearObjetos();
requestAnimationFrame(animar);
