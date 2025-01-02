from flask import Flask
from flask_socketio import SocketIO
import threading
import serial
import json
import time

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


if __name__ == '__main__':
    socketio.run(app, port=3001, debug=True)
