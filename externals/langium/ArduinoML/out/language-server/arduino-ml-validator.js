"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoMlValidator = exports.registerValidationChecks = void 0;
const ast_1 = require("./generated/ast");
/**
 * Register custom validation checks.
 */
function registerValidationChecks(services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ArduinoMlValidator;
    const checks = {
        // Check if app name starts with a capital letter
        App: validator.checkNothing,
        // Prevent use of multiple "wait" at the same level of a binary expression
        // Prevent use of the same sensor at the same level of a binary expression
        Expression: validator.checkExpresison,
        // Prevent negation of temporal transition
        // Check for double negation
        CompositeUnaryExpression: validator.checkCompositeUnaryExpression,
        // Make sure at least two operands are present in a nested expression
        NestedExpression: validator.checkNestedOperandsLength,
    };
    registry.register(checks, validator);
}
exports.registerValidationChecks = registerValidationChecks;
/**
 * Implementation of custom validations.
 */
class ArduinoMlValidator {
    // Prevent use of the same sensor at the same level of a binary expression
    checkCompositeUnaryExpression(expr, accept) {
        // Prevent negation of temporal transition
        this.checkNegationTemporalTransition(expr, accept);
        // Check for double negation
        this.checkDoubleNegation(expr, accept);
    }
    checkExpresison(expr, accept) {
        // Prevent use of multiple "wait" at the same level of a binary expression
        this.checkTemporalTransitionCombination(expr, accept);
        // Prevent use of the same sensor at the same level of a binary expression
        this.checkSensorCombination(expr, accept);
    }

    // Check if app name starts with a capital letter
    checkNothing(app, accept) {
        if (app.name) {
            const firstChar = app.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'App name should start with a capital.', { node: app, property: 'name' });
            }
        }
    }

    // Prevent use of multiple "wait" at the same level of a binary expression
    checkTemporalTransitionCombination(expression, accept) {
        // Count number of temporal transition
        const countTemporalTransition = (expression) => {
            let temporalTransitionCount = 0;
            if ((0, ast_1.isTemporalCondition)(expression.operand)) {
                temporalTransitionCount += 1;
            }
            if ((0, ast_1.isCompositeBinaryExpression)(expression)) {
                temporalTransitionCount += countTemporalTransition(expression.rightOperand);
            }
            return temporalTransitionCount;
        };
        const count = countTemporalTransition(expression);
        if (count > 1) {
            accept('error', 'Only one temporal transition is allowed.', { node: expression, property: 'operand' });
        }
    }

    // Prevent use of the same sensor at the same level of a binary expression
    checkSensorCombination(expression, accept) {
        const isOperandSensorCondition = (0, ast_1.isSensorCondition)(expression.operand);
        const isExpresionCompositeBinary = (0, ast_1.isCompositeBinaryExpression)(expression);
        if (isOperandSensorCondition && isExpresionCompositeBinary) {
            const containSameSensor = (expression, sensor) => {
                if ((0, ast_1.isSensorCondition)(expression.operand) && expression.operand.sensor.ref === sensor) {
                    return true;
                }
                if ((0, ast_1.isCompositeBinaryExpression)(expression)) {
                    const res = containSameSensor(expression.rightOperand, sensor);
                    if (res)
                        return true;
                }
                return false;
            };
            const sensor = expression.operand.sensor.ref;
            if (sensor) {
                const containSame = containSameSensor(expression.rightOperand, sensor);
                if (containSame) {
                    accept('error', 'Same sensor cannot be used twice at the same level of a binary expression.', { node: expression, property: 'operand' });
                }
            }
        }
    }
    // Prevent negation of temporal transition
    checkNegationTemporalTransition(expr, accept) {
        const containTemporalTransitions = (expression) => {
            if ((0, ast_1.isTemporalCondition)(expression.operand)) {
                return true;
            }
            if ((0, ast_1.isNestedExpression)(expression.operand)) {
                const res = containTemporalTransitions(expression.operand.nested);
                if (res)
                    return true;
            }
            if ((0, ast_1.isCompositeBinaryExpression)(expression)) {
                const res = containTemporalTransitions(expression.rightOperand);
                if (res)
                    return true;
            }
            return false;
        };
        const isNegation = expr.operator.operator === 'not';
        if (isNegation) {
            const isInnerTemporal = (0, ast_1.isTemporalCondition)(expr.inner);
            const isNestedContainingTemporals = (0, ast_1.isNestedExpression)(expr.inner) && containTemporalTransitions((expr.inner.nested));
            if (isInnerTemporal || isNestedContainingTemporals) {
                accept('error', 'Negation cannot be applied to temporal transition.', { node: expr, property: 'operator' });
            }
        }
    }
    // Make sure at least two operands are present in a nested expression
    checkNestedOperandsLength(expr, accept) {
        const countOperands = (expression) => {
            let operandCount = 1;
            if ((0, ast_1.isCompositeBinaryExpression)(expression)) {
                operandCount += countOperands(expression.rightOperand);
            }
            return operandCount;
        };
        const count = countOperands(expr.nested);
        if (count <= 1) {
            accept('error', 'Nested expression should have at least two operand.', { node: expr, property: 'nested' });
        }
    }
    // Check for double negation
    checkDoubleNegation(expr, accept) {
        const isNegation = expr.operator.operator === 'not';
        const isInnerNegation = (0, ast_1.isCompositeUnaryExpression)(expr.inner) && expr.inner.operator.operator === 'not';
        if (isNegation && isInnerNegation) {
            accept('error', 'Double negation is not allowed.', { node: expr, property: 'operator' });
        }
    }
}
exports.ArduinoMlValidator = ArduinoMlValidator;
//# sourceMappingURL=arduino-ml-validator.js.map