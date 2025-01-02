#include <HardwareSerial.h>

HardwareSerial SerialSBUS(1);

void setup()
{
	Serial.begin(115200);
	SerialSBUS.begin(100000, SERIAL_8E2, 32, 33); // RX=32, TX=33

	Serial.println("SBUS приймач готовий!");
}

void loop()
{
	if (SerialSBUS.available())
	{
		uint8_t sbusData[25];
		size_t len = SerialSBUS.readBytes(sbusData, 25);
		if (len == 25)
		{
			Serial.println("Отримано SBUS дані:");
			for (int i = 0; i < 25; i++)
			{
				Serial.printf("%02X ", sbusData[i]);
			}
			Serial.println();
		}
	}
}
