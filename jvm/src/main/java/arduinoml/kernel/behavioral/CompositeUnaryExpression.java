package io.github.mosser.arduinoml.kernel.behavioral;

import io.github.mosser.arduinoml.kernel.generator.Visitor;

public class CompositeUnaryExpression implements Expression{
    private Expression expression;
    private UnaryOperator operator;

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }
}
