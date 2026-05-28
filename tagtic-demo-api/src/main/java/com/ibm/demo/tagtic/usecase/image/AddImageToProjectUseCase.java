package com.ibm.demo.tagtic.usecase.image;

import com.ibm.demo.tagtic.dto.request.AddImageRequest;
import com.ibm.demo.tagtic.dto.response.ImageResponse;
import com.ibm.demo.tagtic.entity.ProjectImage;
import com.ibm.demo.tagtic.entity.ProjectStatus;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.ImageMapper;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AddImageToProjectUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectImageRepository imageRepository;
    private final ImageMapper imageMapper;

    @Transactional
    public ImageResponse execute(UUID projectId, AddImageRequest request) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> ResourceNotFoundException.of("Project", projectId));

        if (project.getStatus() == ProjectStatus.COMPLETED || project.getStatus() == ProjectStatus.ARCHIVED) {
            throw new BusinessException("PROJECT_READ_ONLY",
                    "Cannot add images to a project in status " + project.getStatus());
        }

        ProjectImage image = new ProjectImage();
        image.setProjectId(projectId);
        image.setS3Bucket(request.getS3Bucket());
        image.setS3Key(request.getS3Key());
        image.setMetadata(request.getMetadata());

        return imageMapper.toResponse(imageRepository.save(image));
    }
}
