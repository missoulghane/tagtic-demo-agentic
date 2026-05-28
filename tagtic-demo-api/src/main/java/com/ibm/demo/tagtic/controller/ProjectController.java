package com.ibm.demo.tagtic.controller;

import com.ibm.demo.tagtic.dto.request.ChangeStatusRequest;
import com.ibm.demo.tagtic.dto.request.CreateProjectRequest;
import com.ibm.demo.tagtic.dto.request.UpdateProjectRequest;
import com.ibm.demo.tagtic.dto.response.ApiResponse;
import com.ibm.demo.tagtic.dto.response.ProjectResponse;
import com.ibm.demo.tagtic.usecase.project.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final CreateProjectUseCase createProject;
    private final GetProjectUseCase getProject;
    private final ListProjectsUseCase listProjects;
    private final UpdateProjectUseCase updateProject;
    private final DeleteProjectUseCase deleteProject;
    private final ChangeProjectStatusUseCase changeStatus;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProjectResponse> create(@RequestBody @Valid CreateProjectRequest request) {
        return ApiResponse.success(createProject.execute(request));
    }

    @GetMapping
    public ApiResponse<List<ProjectResponse>> list() {
        return ApiResponse.success(listProjects.execute());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(getProject.execute(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectResponse> update(@PathVariable UUID id,
                                               @RequestBody @Valid UpdateProjectRequest request) {
        return ApiResponse.success(updateProject.execute(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        deleteProject.execute(id);
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ProjectResponse> changeStatus(@PathVariable UUID id,
                                                     @RequestBody @Valid ChangeStatusRequest request) {
        return ApiResponse.success(changeStatus.execute(id, request.getStatus()));
    }
}
