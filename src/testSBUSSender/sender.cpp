#include <Arduino.h>

HardwareSerial SerialSBUS(1);

void setup()
{
	Serial.begin(115200);
	SerialSBUS.begin(100000, SERIAL_8E2, 32, 33); // RX=32, TX=33
	Serial.println("Тестові дані SBUS відправляються...");
}

void loop()
{
	uint8_t sbusData[25];

	for (int i = 0; i < 25; i++)
	{
		sbusData[i] = i;
	}

	SerialSBUS.write(sbusData, 25);

	Serial.println("Відправлено SBUS дані:");
	for (int i = 0; i < 25; i++)
	{
		Serial.printf("%02X ", sbusData[i]);
	}
	Serial.println();

	delay(1000);
}
