package com.ibm.demo.tagtic.usecase.form;

import com.ibm.demo.tagtic.dto.request.AddFieldRequest;
import com.ibm.demo.tagtic.dto.response.FormFieldResponse;
import com.ibm.demo.tagtic.entity.FormField;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.FormMapper;
import com.ibm.demo.tagtic.repository.AnnotationFormRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.FormFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
public class AddFormFieldUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final AnnotationFormRepository formRepository;
    private final FormFieldRepository fieldRepository;
    private final FormMapper formMapper;

    @Transactional
    public List<FormFieldResponse> execute(UUID projectId, List<AddFieldRequest> requests) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        var form = formRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No form found for project " + projectId));

        long existingCount = fieldRepository.countByFormId(form.getId());
        var counter = new AtomicInteger((int) existingCount);

        List<FormField> fields = requests.stream().map(req -> {
            FormField field = new FormField();
            field.setFormId(form.getId());
            field.setName(req.getName());
            field.setLabel(req.getLabel());
            field.setType(req.getType());
            field.setRequired(req.getRequired() != null ? req.getRequired() : false);
            field.setOrderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : counter.getAndIncrement());
            field.setDefaultValue(req.getDefaultValue());
            field.setJsonMappingKey(req.getJsonMappingKey());
            field.setValidationRules(req.getValidationRules());
            return field;
        }).toList();

        return fieldRepository.saveAll(fields).stream()
                .map(formMapper::toResponse)
                .toList();
    }
}
