package com.ibm.demo.tagtic.usecase.project;

import com.ibm.demo.tagtic.dto.request.UpdateProjectRequest;
import com.ibm.demo.tagtic.dto.response.ProjectResponse;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.ProjectMapper;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UpdateProjectUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Transactional
    public ProjectResponse execute(UUID id, UpdateProjectRequest request) {
        var project = projectRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Project", id));
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        return projectMapper.toResponse(projectRepository.save(project));
    }
}
