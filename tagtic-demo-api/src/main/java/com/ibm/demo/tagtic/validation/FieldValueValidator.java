package com.ibm.demo.tagtic.validation;

import com.ibm.demo.tagtic.entity.FieldType;
import com.ibm.demo.tagtic.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Implements the field value validation pipeline:
 * raw String → convert to typed value → apply validationRules → re-serialize as String.
 */
@Component
public class FieldValueValidator {

    public String validateAndNormalize(String raw, FieldType type,
                                       Map<String, Object> rules, String fieldName) {
        if (raw == null) {
            return null;
        }

        return switch (type) {
            case NUMBER -> {
                BigDecimal number;
                try {
                    number = new BigDecimal(raw.trim());
                } catch (NumberFormatException e) {
                    throw new BusinessException("INVALID_VALUE",
                            "Field '" + fieldName + "' must be a valid number, got: " + raw);
                }
                applyNumberRules(number, rules, fieldName);
                yield number.toPlainString();
            }
            case BOOLEAN -> {
                String normalized = raw.trim().toLowerCase();
                if (!normalized.equals("true") && !normalized.equals("false")) {
                    throw new BusinessException("INVALID_VALUE",
                            "Field '" + fieldName + "' must be true or false, got: " + raw);
                }
                yield normalized;
            }
            case DATE -> {
                try {
                    LocalDate.parse(raw.trim());
                } catch (Exception e) {
                    throw new BusinessException("INVALID_VALUE",
                            "Field '" + fieldName + "' must be a valid ISO date (yyyy-MM-dd), got: " + raw);
                }
                applyStringRules(raw.trim(), rules, fieldName);
                yield raw.trim();
            }
            case TEXT, SELECT -> {
                applyStringRules(raw, rules, fieldName);
                yield raw;
            }
        };
    }

    private void applyNumberRules(BigDecimal value, Map<String, Object> rules, String fieldName) {
        if (rules == null) return;
        if (rules.containsKey("min")) {
            BigDecimal min = new BigDecimal(rules.get("min").toString());
            if (value.compareTo(min) < 0) {
                throw new BusinessException("VALIDATION_FAILED",
                        "Field '" + fieldName + "' must be >= " + min);
            }
        }
        if (rules.containsKey("max")) {
            BigDecimal max = new BigDecimal(rules.get("max").toString());
            if (value.compareTo(max) > 0) {
                throw new BusinessException("VALIDATION_FAILED",
                        "Field '" + fieldName + "' must be <= " + max);
            }
        }
    }

    private void applyStringRules(String value, Map<String, Object> rules, String fieldName) {
        if (rules == null) return;
        if (rules.containsKey("minLength")) {
            int min = Integer.parseInt(rules.get("minLength").toString());
            if (value.length() < min) {
                throw new BusinessException("VALIDATION_FAILED",
                        "Field '" + fieldName + "' must have at least " + min + " characters");
            }
        }
        if (rules.containsKey("maxLength")) {
            int max = Integer.parseInt(rules.get("maxLength").toString());
            if (value.length() > max) {
                throw new BusinessException("VALIDATION_FAILED",
                        "Field '" + fieldName + "' must have at most " + max + " characters");
            }
        }
        if (rules.containsKey("pattern")) {
            String pattern = rules.get("pattern").toString();
            if (!value.matches(pattern)) {
                throw new BusinessException("VALIDATION_FAILED",
                        "Field '" + fieldName + "' does not match required pattern");
            }
        }
    }
}
