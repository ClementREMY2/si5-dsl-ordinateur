sensor "button1" onPin 9
sensor "button2" onPin 10
actuator "led" pin 12

state "off" means "led" becomes "low"
state "on" means "led" becomes "high"

initial "off"

from "off" to "on" when "button1" becomes "high" and "button2" becomes "high"
from "on" to "off" when "button1" becomes "low" or "button2" becomes "low"

export "Scenario2!"