package com.ibm.demo.tagtic.controller;

import com.ibm.demo.tagtic.dto.request.CreateAnnotationRequest;
import com.ibm.demo.tagtic.dto.response.AnnotationResponse;
import com.ibm.demo.tagtic.dto.response.ApiResponse;
import com.ibm.demo.tagtic.dto.response.PrefilledAnnotationFormResponse;
import com.ibm.demo.tagtic.usecase.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class AnnotationController {

    private final GetPrefilledAnnotationFormUseCase getPrefilled;
    private final SaveAnnotationUseCase saveAnnotation;
    private final ListProjectAnnotationsUseCase listAnnotations;
    private final GetImageAnnotationUseCase getImageAnnotation;

    @GetMapping("/{projectId}/images/{imageId}/annotation-form")
    public ApiResponse<PrefilledAnnotationFormResponse> getPrefilled(@PathVariable UUID projectId,
                                                                      @PathVariable UUID imageId) {
        return ApiResponse.success(getPrefilled.execute(projectId, imageId));
    }

    @PostMapping("/{projectId}/images/{imageId}/annotations")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AnnotationResponse> saveAnnotation(@PathVariable UUID projectId,
                                                           @PathVariable UUID imageId,
                                                           @RequestBody @Valid CreateAnnotationRequest request) {
        return ApiResponse.success(saveAnnotation.execute(projectId, imageId, request));
    }

    @GetMapping("/{projectId}/annotations")
    public ApiResponse<List<AnnotationResponse>> listAnnotations(@PathVariable UUID projectId) {
        return ApiResponse.success(listAnnotations.execute(projectId));
    }

    @GetMapping("/{projectId}/images/{imageId}/annotation")
    public ApiResponse<AnnotationResponse> getImageAnnotation(@PathVariable UUID projectId,
                                                               @PathVariable UUID imageId) {
        return ApiResponse.success(getImageAnnotation.execute(projectId, imageId));
    }
}
