package io.github.mosser.arduinoml.kernel.structural;

import io.github.mosser.arduinoml.kernel.generator.Visitor;

public abstract class PinBrick extends Brick{
    private Integer pin;

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}
