package com.ibm.demo.tagtic.usecase.image;

import com.ibm.demo.tagtic.dto.response.ImageResponse;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.ImageMapper;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListProjectImagesUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectImageRepository imageRepository;
    private final ImageMapper imageMapper;

    @Transactional(readOnly = true)
    public Page<ImageResponse> execute(UUID projectId, Pageable pageable) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        return imageRepository.findByProjectId(projectId, pageable)
                .map(imageMapper::toResponse);
    }
}
