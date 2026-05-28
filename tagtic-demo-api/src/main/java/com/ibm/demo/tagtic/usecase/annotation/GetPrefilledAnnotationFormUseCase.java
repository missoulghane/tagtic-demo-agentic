package com.ibm.demo.tagtic.usecase.annotation;

import com.ibm.demo.tagtic.dto.response.PrefilledAnnotationFormResponse;
import com.ibm.demo.tagtic.dto.response.PrefilledFieldResponse;
import com.ibm.demo.tagtic.entity.FieldType;
import com.ibm.demo.tagtic.entity.FormField;
import com.ibm.demo.tagtic.entity.ProjectImage;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.repository.AnnotationFormRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.FormFieldRepository;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GetPrefilledAnnotationFormUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectImageRepository imageRepository;
    private final AnnotationFormRepository formRepository;
    private final FormFieldRepository fieldRepository;

    @Transactional(readOnly = true)
    public PrefilledAnnotationFormResponse execute(UUID projectId, UUID imageId) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        ProjectImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> ResourceNotFoundException.of("Image", imageId));
        if (!image.getProjectId().equals(projectId)) {
            throw new BusinessException("IMAGE_NOT_IN_PROJECT", "Image does not belong to this project");
        }
        var form = formRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No form found for project " + projectId));

        List<FormField> fields = fieldRepository.findByFormIdOrderByOrderIndex(form.getId());
        List<PrefilledFieldResponse> prefilledFields = fields.stream()
                .map(field -> buildPrefilledField(field, image.getMetadata()))
                .toList();

        return new PrefilledAnnotationFormResponse(imageId, prefilledFields);
    }

    private PrefilledFieldResponse buildPrefilledField(FormField field, Map<String, Object> metadata) {
        String value = null;
        boolean autoFilled = false;

        if (field.getJsonMappingKey() != null && metadata != null) {
            Object raw = resolveJsonPath(metadata, field.getJsonMappingKey());
            if (raw != null) {
                value = convertToString(raw, field.getType());
                autoFilled = true;
            }
        }

        if (value == null && field.getDefaultValue() != null) {
            value = field.getDefaultValue();
        }

        return PrefilledFieldResponse.builder()
                .formFieldId(field.getId())
                .name(field.getName())
                .label(field.getLabel())
                .type(field.getType())
                .required(field.getRequired())
                .value(value)
                .autoFilled(autoFilled)
                .build();
    }

    // Navigate dot-separated path through nested maps
    private Object resolveJsonPath(Map<String, Object> root, String path) {
        String[] parts = path.split("\\.");
        Object current = root;
        for (String part : parts) {
            if (current instanceof Map<?, ?> map) {
                current = map.get(part);
            } else {
                return null;
            }
        }
        return current;
    }

    // Convert metadata value to its canonical String representation per fieldType
    private String convertToString(Object raw, FieldType type) {
        return switch (type) {
            case NUMBER -> {
                if (raw instanceof Number n) yield String.valueOf(n.doubleValue()).replaceAll("\\.0$", "");
                yield raw.toString();
            }
            case BOOLEAN -> {
                if (raw instanceof Boolean b) yield b.toString();
                yield raw.toString().toLowerCase();
            }
            default -> raw.toString();
        };
    }
}
