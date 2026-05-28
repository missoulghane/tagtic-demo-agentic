package com.ibm.demo.tagtic.usecase.image;

import com.ibm.demo.tagtic.dto.response.ImageResponse;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.ImageMapper;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GetImageUseCase {

    private final ProjectImageRepository imageRepository;
    private final ImageMapper imageMapper;

    @Transactional(readOnly = true)
    public ImageResponse execute(UUID imageId) {
        return imageRepository.findById(imageId)
                .map(imageMapper::toResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Image", imageId));
    }
}
