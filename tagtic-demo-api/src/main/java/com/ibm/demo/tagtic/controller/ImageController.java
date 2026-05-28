package com.ibm.demo.tagtic.controller;

import com.ibm.demo.tagtic.dto.request.AddImageRequest;
import com.ibm.demo.tagtic.dto.response.ApiResponse;
import com.ibm.demo.tagtic.dto.response.ImageResponse;
import com.ibm.demo.tagtic.usecase.image.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ImageController {

    private final AddImageToProjectUseCase addImage;
    private final ListProjectImagesUseCase listImages;
    private final GetImageUseCase getImage;
    private final UploadImageToProjectUseCase uploadImage;

    @PostMapping("/api/projects/{projectId}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ImageResponse> addImage(@PathVariable UUID projectId,
                                               @RequestBody @Valid AddImageRequest request) {
        return ApiResponse.success(addImage.execute(projectId, request));
    }

    @PostMapping(value = "/api/projects/{projectId}/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ImageResponse> uploadImage(@PathVariable UUID projectId,
                                                  @RequestPart("file") MultipartFile file) {
        return ApiResponse.success(uploadImage.execute(projectId, file));
    }

    @GetMapping("/api/projects/{projectId}/images")
    public ApiResponse<Page<ImageResponse>> listImages(@PathVariable UUID projectId,
                                                       @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(listImages.execute(projectId, pageable));
    }

    @GetMapping("/api/images/{imageId}")
    public ApiResponse<ImageResponse> getImage(@PathVariable UUID imageId) {
        return ApiResponse.success(getImage.execute(imageId));
    }
}
