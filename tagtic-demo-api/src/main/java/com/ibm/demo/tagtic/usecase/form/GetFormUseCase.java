package com.ibm.demo.tagtic.usecase.form;

import com.ibm.demo.tagtic.dto.response.FormResponse;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.FormMapper;
import com.ibm.demo.tagtic.repository.AnnotationFormRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GetFormUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final AnnotationFormRepository formRepository;
    private final FormMapper formMapper;

    @Transactional(readOnly = true)
    public FormResponse execute(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        return formRepository.findByProjectId(projectId)
                .map(formMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No form found for project " + projectId));
    }
}
