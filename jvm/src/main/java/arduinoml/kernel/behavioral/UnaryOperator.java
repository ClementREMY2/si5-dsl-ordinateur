package io.github.mosser.arduinoml.kernel.behavioral;

public enum UnaryOperator {
    NOT; // est ce que ca vaut le coup de faire un enum pour un seul element ?

    @Override
    public String toString() { // a modifier si jamais on fait un autre truc mais la on s'en fout
        return "!";
    }
}
