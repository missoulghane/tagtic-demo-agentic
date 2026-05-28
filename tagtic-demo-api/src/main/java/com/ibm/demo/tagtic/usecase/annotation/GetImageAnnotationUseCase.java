package com.ibm.demo.tagtic.usecase.annotation;

import com.ibm.demo.tagtic.dto.response.AnnotationResponse;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.AnnotationMapper;
import com.ibm.demo.tagtic.repository.AnnotationFieldValueRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.AnnotationRepository;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GetImageAnnotationUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectImageRepository imageRepository;
    private final AnnotationRepository annotationRepository;
    private final AnnotationFieldValueRepository fieldValueRepository;
    private final AnnotationMapper annotationMapper;

    @Transactional(readOnly = true)
    public AnnotationResponse execute(UUID projectId, UUID imageId) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        var image = imageRepository.findById(imageId)
                .orElseThrow(() -> ResourceNotFoundException.of("Image", imageId));
        if (!image.getProjectId().equals(projectId)) {
            throw new BusinessException("IMAGE_NOT_IN_PROJECT", "Image does not belong to this project");
        }
        var annotation = annotationRepository.findByImageId(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("No annotation found for image " + imageId));
        var values = fieldValueRepository.findByAnnotationId(annotation.getId());
        return annotationMapper.toResponseWithFields(annotation, values);
    }
}
