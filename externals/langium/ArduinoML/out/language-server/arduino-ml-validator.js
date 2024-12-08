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
        Expression: validator.checkTemporalTransitionCombination,
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
    checkNothing(app, accept) {
        if (app.name) {
            const firstChar = app.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'App name should start with a capital.', { node: app, property: 'name' });
            }
        }
    }
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
    checkCompositeUnaryExpression(expr, accept) {
        // Prevent negation of temporal transition
        this.checkNegationTemporalTransition(expr, accept);
        // Check for double negation
        this.checkDoubleNegation(expr, accept);
    }
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