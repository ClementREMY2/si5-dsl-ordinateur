package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;
import io.github.mosser.arduinoml.kernel.structural.Brick;
import io.github.mosser.arduinoml.kernel.structural.SIGNAL;
import io.github.mosser.arduinoml.kernel.structural.Sensor;

public class SensorCondition implements Expression{
    private SIGNAL signal;
    private Sensor sensor;

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    public SIGNAL getSignal() {
        return signal;
    }

    public void setSignal(SIGNAL signal) {
        this.signal = signal;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }
}
