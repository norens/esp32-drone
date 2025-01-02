import serial
import time
import json
import threading

ser = serial.Serial("/dev/cu.usbserial-58EF0642951", 1000000, write_timeout=1)
serial_lock = threading.Lock()


if ser.is_open:
    print("Порт успішно відкритий!")

    try:
        data = {
            "droneArmed": [True, True]
        }

        for droneIndex, armed in enumerate(data["droneArmed"]):
            serial_data = {
                "armed": armed,
            }

            with serial_lock:
                ser.write(f"{str(droneIndex)}{json.dumps(serial_data)}".encode('utf-8'))
                print(f"Статус для дрону {droneIndex}: {'armed' if armed else 'disarmed'}")

            time.sleep(0.01)

        time.sleep(1)

    except Exception as e:
        print(f"Сталася помилка при відправці: {e}")

    finally:
        ser.close()
        print("Порт закритий.")

else:
    print("Не вдалося відкрити порт.")
