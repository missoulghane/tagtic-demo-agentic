package com.ibm.demo.tagtic.usecase.annotation;

import com.ibm.demo.tagtic.dto.response.AnnotationResponse;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.AnnotationMapper;
import com.ibm.demo.tagtic.repository.AnnotationFieldValueRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.AnnotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListProjectAnnotationsUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final AnnotationRepository annotationRepository;
    private final AnnotationFieldValueRepository fieldValueRepository;
    private final AnnotationMapper annotationMapper;

    @Transactional(readOnly = true)
    public List<AnnotationResponse> execute(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        return annotationRepository.findByProjectId(projectId).stream()
                .map(a -> {
                    var values = fieldValueRepository.findByAnnotationId(a.getId());
                    return annotationMapper.toResponseWithFields(a, values);
                })
                .toList();
    }
}
