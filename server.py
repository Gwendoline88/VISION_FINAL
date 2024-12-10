from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import random

app = Flask(__name__)

# Variables globales del juego
codigo_generado = ""
puntuacion = 0
misiones = ["ROJO", "VERDE", "AZUL"]
misiones_actual = random.choice(misiones)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ejecutar', methods=['POST'])
def ejecutar():
    global codigo_generado
    data = request.json
    codigo_generado = data['codigo']
    print("Código recibido de Blockly:", codigo_generado)
    return jsonify({"status": "ok"})

@app.route('/detectar', methods=['GET'])
def detectar():
    global puntuacion, misiones_actual
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Detección de color
        color_detectado = detectar_color(frame)
        if color_detectado == misiones_actual:
            puntuacion += 10
            misiones_actual = random.choice(misiones)
            print(f"¡Tesoro encontrado! Nueva misión: {misiones_actual}")
        
        # Mostrar en pantalla
        cv2.putText(frame, f"Busca: {misiones_actual}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.putText(frame, f"Puntuación: {puntuacion}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        cv2.imshow('Caza de Tesoros', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return jsonify({"status": "finalizado", "puntuacion": puntuacion})

def detectar_color(frame):
    hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Rango para Rojo
    red_lower = np.array([0, 120, 70])
    red_upper = np.array([10, 255, 255])
    mask_red = cv2.inRange(hsv_frame, red_lower, red_upper)

    # Rango para Verde
    green_lower = np.array([36, 100, 100])
    green_upper = np.array([86, 255, 255])
    mask_green = cv2.inRange(hsv_frame, green_lower, green_upper)

    # Rango para Azul
    blue_lower = np.array([94, 80, 2])
    blue_upper = np.array([126, 255, 255])
    mask_blue = cv2.inRange(hsv_frame, blue_lower, blue_upper)

    if np.any(mask_red):
        return "ROJO"
    elif np.any(mask_green):
        return "VERDE"
    elif np.any(mask_blue):
        return "AZUL"
    else:
        return "NINGUNO"

if __name__ == '__main__':
    app.run(debug=True)