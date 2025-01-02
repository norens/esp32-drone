import json
import threading
import time

import serial
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

serialLock = threading.Lock()
ser = serial.Serial("/dev/cu.usbserial-58EF0642951", 1000000, write_timeout=1)


@socketio.on("arm-drone")
def arm_drone(data):
    for droneIndex in range(len(data["droneArmed"])):
        serial_data = {
            "armed": data["droneArmed"][droneIndex],
        }
        with serialLock:
            ser.write(f"{str(droneIndex)}{json.dumps(serial_data)}".encode('utf-8'))

        time.sleep(0.01)

@socketio.on("set-drone-setpoint")
def arm_drone(data):
    serial_data = {
        "setpoint": [float(x) for x in data["droneSetpoint"]],
    }
    with serialLock:
        ser.write(f"{str(data['droneIndex'])}{json.dumps(serial_data)}".encode('utf-8'))
        time.sleep(0.01)
    print(serial_data)


@socketio.on("set-drone-trim")
def arm_drone(data):
    serial_data = {
        "trim": [int(x) for x in data["droneTrim"]],
    }
    with serialLock:
        ser.write(f"{str(data['droneIndex'])}{json.dumps(serial_data)}".encode('utf-8'))
        time.sleep(0.01)
    print(serial_data)


@socketio.on("set-drone-pid")
def arm_drone(data):
    serial_data = {
        "pid": [float(x) for x in data["dronePID"]],
    }
    with serialLock:
        ser.write(f"{str(data['droneIndex'])}{json.dumps(serial_data)}".encode('utf-8'))
        time.sleep(0.01)
    print(serial_data)


if __name__ == '__main__':
    socketio.run(app, port=3001, debug=True)
