sensor "button" onPin 9
actuator "led" pin 11
actuator "buzzer" pin 12

state "on" means "led" becomes "high" and "buzzer" becomes "high"
state "off" means "led" becomes "low" and "buzzer" becomes "low"

initial "off"

from "off" to "on" when "button" becomes "high"
from "on" to "off" when "button" becomes "low"

export "Scenario1!"