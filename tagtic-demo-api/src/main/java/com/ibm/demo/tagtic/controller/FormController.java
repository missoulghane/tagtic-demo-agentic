package com.ibm.demo.tagtic.controller;

import com.ibm.demo.tagtic.dto.request.AddFieldRequest;
import com.ibm.demo.tagtic.dto.request.CreateFormRequest;
import com.ibm.demo.tagtic.dto.response.ApiResponse;
import com.ibm.demo.tagtic.dto.response.FormFieldResponse;
import com.ibm.demo.tagtic.dto.response.FormResponse;
import com.ibm.demo.tagtic.usecase.form.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class FormController {

    private final CreateFormUseCase createForm;
    private final GetFormUseCase getForm;
    private final AddFormFieldUseCase addFields;
    private final ListFormFieldsUseCase listFields;

    @PostMapping("/{projectId}/form")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FormResponse> createForm(@PathVariable UUID projectId,
                                                @RequestBody @Valid CreateFormRequest request) {
        return ApiResponse.success(createForm.execute(projectId, request));
    }

    @GetMapping("/{projectId}/form")
    public ApiResponse<FormResponse> getForm(@PathVariable UUID projectId) {
        return ApiResponse.success(getForm.execute(projectId));
    }

    @PostMapping("/{projectId}/form/fields")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<FormFieldResponse>> addFields(@PathVariable UUID projectId,
                                                          @RequestBody @Valid List<AddFieldRequest> requests) {
        return ApiResponse.success(addFields.execute(projectId, requests));
    }

    @GetMapping("/{projectId}/form/fields")
    public ApiResponse<List<FormFieldResponse>> listFields(@PathVariable UUID projectId) {
        return ApiResponse.success(listFields.execute(projectId));
    }
}
