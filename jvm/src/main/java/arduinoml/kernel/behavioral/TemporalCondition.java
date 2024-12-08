package io.github.mosser.arduinoml.kernel.behavioral;


import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class TemporalCondition implements Expression {
    private Integer delay;
    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    public Integer getDelay() {
        return delay;
    }

    public void setDelay(Integer delay) {
        this.delay = delay;
    }
}
