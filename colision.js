//Prepara el canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let window_height = window.innerHeight;
let window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;
canvas.style.background = "rgb(225, 225, 238)";

// Clase Circle
class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;

        this.colorOriginal = color;
        this.color = color;
        this.text = text;
        this.speed = speed;

        // Dirección y velocidad inicial aleatorias
        const angle = Math.random() * Math.PI * 2;

        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;

        // Control del efecto flash
        this.flashTimer = 0;
        this.enColision = false;
    }

    // Dibujar el círculo
    draw(context) {
        context.beginPath();

        context.strokeStyle = this.color;
        context.lineWidth = 2;

        context.arc(
            this.posX,
            this.posY,
            this.radius,
            0,
            Math.PI * 2
        );

        context.stroke();

        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "16px Arial";

        context.fillText(
            this.text,
            this.posX,
            this.posY
        );

        context.closePath();
    }

    // Actualizar movimiento y rebote en los bordes
    update() {
        this.posX += this.dx;
        this.posY += this.dy;

        // Rebote horizontal
        if (this.posX + this.radius >= canvas.width) {
            this.posX = canvas.width - this.radius;
            this.dx = -Math.abs(this.dx);
        }

        if (this.posX - this.radius <= 0) {
            this.posX = this.radius;
            this.dx = Math.abs(this.dx);
        }

        // Rebote vertical
        if (this.posY + this.radius >= canvas.height) {
            this.posY = canvas.height - this.radius;
            this.dy = -Math.abs(this.dy);
        }

        if (this.posY - this.radius <= 0) {
            this.posY = this.radius;
            this.dy = Math.abs(this.dy);
        }

        // Reducir el tiempo del flash
        if (this.flashTimer > 0) {
            this.flashTimer--;
        }

        this.actualizarColor();
    }

    // Detectar colisión con otro círculo
    detectarColision(otro) {
        const distanciaX = otro.posX - this.posX;
        const distanciaY = otro.posY - this.posY;

        const distancia = Math.sqrt(
            distanciaX * distanciaX +
            distanciaY * distanciaY
        );

        return distancia <= this.radius + otro.radius;
    }

    // Cambiar el color durante el flash
    actualizarColor() {
        if (this.enColision || this.flashTimer > 0) {
            this.color = "#0000FF";
        } else {
            this.color = this.colorOriginal;
        }
    }

    // Activar el efecto flash
    activarFlash() {
        this.flashTimer = 8;
        this.actualizarColor();
    }

    // Resolver el rebote con otro círculo
    resolverRebote(otro) {
        let distanciaX = otro.posX - this.posX;
        let distanciaY = otro.posY - this.posY;

        let distancia = Math.sqrt(
            distanciaX * distanciaX +
            distanciaY * distanciaY
        );

        // Evitar una división entre cero
        if (distancia === 0) {
            distanciaX = 1;
            distanciaY = 0;
            distancia = 1;
        }

        // Vector normal de la colisión
        const normalX = distanciaX / distancia;
        const normalY = distanciaY / distancia;

        // Separación mínima entre los círculos
        const distanciaMinima = this.radius + otro.radius;
        const solapamiento = distanciaMinima - distancia;

        if (solapamiento > 0) {
            // Separar ambos círculos para evitar que se encimen
            const correccion = solapamiento / 2 + 0.1;

            this.posX -= normalX * correccion;
            this.posY -= normalY * correccion;

            otro.posX += normalX * correccion;
            otro.posY += normalY * correccion;
        }

        // Velocidad relativa en la dirección de la colisión
        const velocidadRelativaX = otro.dx - this.dx;
        const velocidadRelativaY = otro.dy - this.dy;

        const velocidadNormal =
            velocidadRelativaX * normalX +
            velocidadRelativaY * normalY;

        // Cambiar las velocidades solo si se están acercando
        if (velocidadNormal < 0) {
            // Para círculos de igual masa, se intercambia
            // la componente normal de sus velocidades
            this.dx += velocidadNormal * normalX;
            this.dy += velocidadNormal * normalY;

            otro.dx -= velocidadNormal * normalX;
            otro.dy -= velocidadNormal * normalY;
        }

        // Mostrar el flash azul
        this.activarFlash();
        otro.activarFlash();
    }
}

// Array de círculos
let circles = [];

// Guardar las parejas que estaban en colisión
let colisionesAnteriores = new Set();

// Crear círculos
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        const radius = Math.random() * 15 + 15;

        const x = Math.random() *
            (canvas.width - radius * 2) + radius;

        const y = Math.random() *
            (canvas.height - radius * 2) + radius;

        const color = "#" +
            Math.floor(Math.random() * 16777216)
                .toString(16)
                .padStart(6, "0");

        // Velocidad entre 1 y 5 unidades
        const speed = Math.random() * 4 + 1;

        const text = `C${i + 1}`;

        circles.push(
            new Circle(x, y, radius, color, text, speed)
        );
    }
}

// Detectar y resolver colisiones
function detectarColisiones() {
    const colisionesActuales = new Set();

    // Reiniciar los estados de colisión
    circles.forEach(circle => {
        circle.enColision = false;
    });

    // Comparar cada pareja de círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            const circuloA = circles[i];
            const circuloB = circles[j];

            if (circuloA.detectarColision(circuloB)) {
                const clave = `${i}-${j}`;

                colisionesActuales.add(clave);

                circuloA.enColision = true;
                circuloB.enColision = true;

                // Resolver el rebote una sola vez por contacto
                if (!colisionesAnteriores.has(clave)) {
                    circuloA.resolverRebote(circuloB);
                }
            }
        }
    }

    // Guardar las colisiones de este fotograma
    colisionesAnteriores = colisionesActuales;

    // Actualizar el color de todos los círculos
    circles.forEach(circle => {
        circle.actualizarColor();
    });
}

// Animación principal
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar el movimiento
    circles.forEach(circle => {
        circle.update();
    });

    // Detectar colisiones y calcular rebotes
    detectarColisiones();

    // Dibujar los círculos con su color actualizado
    circles.forEach(circle => {
        circle.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// Crear los 20 círculos
generateCircles(20);

// Iniciar animación
animate();

// Ajustar el canvas al cambiar el tamaño de la ventana
window.addEventListener("resize", () => {
    window_width = window.innerWidth;
    window_height = window.innerHeight;

    canvas.width = window_width;
    canvas.height = window_height;

    // Mantener los círculos dentro del canvas
    circles.forEach(circle => {
        circle.posX = Math.max(
            circle.radius,
            Math.min(circle.posX, canvas.width - circle.radius)
        );

        circle.posY = Math.max(
            circle.radius,
            Math.min(circle.posY, canvas.height - circle.radius)
        );
    });
});