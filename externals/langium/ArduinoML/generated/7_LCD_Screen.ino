
//Wiring code generated from an ArduinoML model
// Application name: RedButton

#include <LiquidCrystal.h>
		

LiquidCrystal lcd(2, 3, 4, 5, 6, 7, 8);
				

long debounce = 200;
enum STATE {off, on};

STATE currentState = off;

bool button1BounceGuard = false;
long button1LastDebounceTime = 0;
            

long stateEntryTime = 0;
	

bool screenUpdated = false;
	

	void setup(){
		pinMode(11, INPUT); // button1 [Sensor]
		// Screen setup
		lcd.begin(16, 2);
	}
	void loop() {
		long currentTime = millis();
			switch(currentState){

				case off:
					if (!screenUpdated) {
						lcd.clear();
						String msg = "valeur state off : " + String(digitalRead(11) == HIGH ? "ON" : "OFF");
						String firstLine = msg.substring(0, 16);
						String secondLine = msg.substring(16, 32);
						lcd.setCursor(0, 0);
						lcd.print(firstLine);
						lcd.setCursor(0, 1);
						lcd.print(secondLine);
						screenUpdated = true;
					}
						if ((currentTime - stateEntryTime >= 1000)) {
							currentState = on;
							screenUpdated = false;
							stateEntryTime = millis();
						}
				break;
				case on:
					if (!screenUpdated) {
						lcd.clear();
						String msg = "valeur state on : " + String(digitalRead(11) == HIGH ? "ON" : "OFF");
						String firstLine = msg.substring(0, 16);
						String secondLine = msg.substring(16, 32);
						lcd.setCursor(0, 0);
						lcd.print(firstLine);
						lcd.setCursor(0, 1);
						lcd.print(secondLine);
						screenUpdated = true;
					}
						if ((currentTime - stateEntryTime >= 1000)) {
							currentState = off;
							screenUpdated = false;
							stateEntryTime = millis();
						}
				break;
		}
	}
	
