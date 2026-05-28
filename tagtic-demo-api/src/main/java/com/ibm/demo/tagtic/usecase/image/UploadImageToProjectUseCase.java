package com.ibm.demo.tagtic.usecase.image;

import com.ibm.demo.tagtic.dto.response.ImageResponse;
import com.ibm.demo.tagtic.entity.ProjectImage;
import com.ibm.demo.tagtic.entity.ProjectStatus;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.infrastructure.s3.S3Properties;
import com.ibm.demo.tagtic.infrastructure.s3.S3Service;
import com.ibm.demo.tagtic.mapper.ImageMapper;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UploadImageToProjectUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectImageRepository imageRepository;
    private final ImageMapper imageMapper;
    private final S3Service s3Service;
    private final S3Properties s3Properties;

    @Transactional
    public ImageResponse execute(UUID projectId, MultipartFile file) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> ResourceNotFoundException.of("Project", projectId));

        if (project.getStatus() == ProjectStatus.COMPLETED || project.getStatus() == ProjectStatus.ARCHIVED) {
            throw new BusinessException("PROJECT_READ_ONLY",
                    "Cannot add images to a project in status " + project.getStatus());
        }

        String key = "images/" + projectId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        s3Service.uploadFile(s3Properties.getBucketName(), key, file);

        ProjectImage image = new ProjectImage();
        image.setProjectId(projectId);
        image.setS3Bucket(s3Properties.getBucketName());
        image.setS3Key(key);

        return imageMapper.toResponse(imageRepository.save(image));
    }
}
