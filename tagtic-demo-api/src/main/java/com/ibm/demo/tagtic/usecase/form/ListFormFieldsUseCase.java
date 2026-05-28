package com.ibm.demo.tagtic.usecase.form;

import com.ibm.demo.tagtic.dto.response.FormFieldResponse;
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

@Component
@RequiredArgsConstructor
public class ListFormFieldsUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final AnnotationFormRepository formRepository;
    private final FormFieldRepository fieldRepository;
    private final FormMapper formMapper;

    @Transactional(readOnly = true)
    public List<FormFieldResponse> execute(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        var form = formRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No form found for project " + projectId));
        return fieldRepository.findByFormIdOrderByOrderIndex(form.getId()).stream()
                .map(formMapper::toResponse)
                .toList();
    }
}
