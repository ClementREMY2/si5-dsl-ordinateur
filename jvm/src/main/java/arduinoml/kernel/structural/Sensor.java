package io.github.mosser.arduinoml.kernel.structural;

import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class Sensor extends Actuator {
	@Override
	public void accept(Visitor visitor) {
		visitor.visit(this);
	}
}
