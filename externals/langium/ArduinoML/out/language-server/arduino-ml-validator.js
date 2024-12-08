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
        // Check pin allocation with bus
        // Check number of screens
        App: validator.checkApp,
        // Prevent use of multiple "wait" at the same level of a binary expression
        // Prevent use of the same sensor at the same level of a binary expression
        Expression: validator.checkExpresison,
        // Prevent negation of temporal transition
        // Check for double negation
        CompositeUnaryExpression: validator.checkCompositeUnaryExpression,
        // Make sure at least two operands are present in a nested expression
        NestedExpression: validator.checkNestedOperandsLength,
        // Check for length of the screen message
        ScreenAction: validator.checkScreenActionLength,
    };
    registry.register(checks, validator);
}
exports.registerValidationChecks = registerValidationChecks;
/**
 * Implementation of custom validations.
 */
class ArduinoMlValidator {
    checkApp(app, accept) {
        // Check if app name starts with a capital letter
        this.checkNothing(app, accept);
        // Check pin allocation with bus
        this.checkPinBusAllocation(app, accept);
        // Check number of screens
        this.checkNumberOfScreen(app, accept);
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
    // Check for length of the screen message
    checkScreenActionLength(screenAction, accept) {
        const calculateTotalLength = (string) => {
            let length = string.string.length;
            if (string.sensor) {
                length += 3; // 3 characters for sensor value
            }
            if (string.actuator) {
                length += 3; // 3 characters for actuator value
            }
            if (string.next) {
                length += calculateTotalLength(string.next);
            }
            return length;
        };
        const totalLength = calculateTotalLength(screenAction.value);
        if (totalLength > 32) {
            accept('error', `Screen message should not exceed 32 characters (current length: ${totalLength}).`, { node: screenAction, property: 'value' });
        }
    }
    // Check pin allocation with bus
    checkPinBusAllocation(app, accept) {
        const getPinPerBus = (bus) => {
            if (bus === 'BUS1')
                return [2, 3, 4, 5, 6, 7, 8];
            if (bus === 'BUS2')
                return [10, 11, 12, 13, 14, 15, 16];
            if (bus === 'BUS3')
                return [10, 11, 12, 13, 18, 19, 1];
            return [];
        };
        // Only one bus supported
        const screen = app.bricks.find(ast_1.isScreen);
        if (screen) {
            const bus = screen.bus.value;
            const allocatedPinsForBus = getPinPerBus(bus);
            const pinBricks = app.bricks.filter(ast_1.isPinBrick);
            pinBricks.forEach(pinBrick => {
                if ((0, ast_1.isSensor)(pinBrick)) {
                    const pin = pinBrick.inputPin;
                    if (allocatedPinsForBus.includes(pin)) {
                        accept('error', `Pin ${pin} is already allocated by bus ${bus}. (Taken pins : ${allocatedPinsForBus.join(',')})`, { node: pinBrick, property: 'inputPin' });
                    }
                }
                else if ((0, ast_1.isActuator)(pinBrick)) {
                    const pin = pinBrick.outputPin;
                    if (allocatedPinsForBus.includes(pin)) {
                        accept('error', `Pin ${pin} is already allocated by bus ${bus}. (Taken pins : ${allocatedPinsForBus.join(',')})`, { node: pinBrick, property: 'outputPin' });
                    }
                }
            });
        }
    }
    // Check number of screens
    checkNumberOfScreen(app, accept) {
        const screens = app.bricks.filter(ast_1.isScreen);
        if (screens.length > 1) {
            accept('error', 'Only one screen is supported.', { node: app, property: 'bricks' });
        }
    }
}
exports.ArduinoMlValidator = ArduinoMlValidator;
//# sourceMappingURL=arduino-ml-validator.js.map