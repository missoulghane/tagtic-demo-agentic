package com.ibm.demo.tagtic.usecase.project;

import com.ibm.demo.tagtic.dto.request.CreateProjectRequest;
import com.ibm.demo.tagtic.dto.response.ProjectResponse;
import com.ibm.demo.tagtic.entity.AnnotationProject;
import com.ibm.demo.tagtic.mapper.ProjectMapper;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CreateProjectUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Transactional
    public ProjectResponse execute(CreateProjectRequest request) {
        AnnotationProject project = new AnnotationProject();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setCreatedBy(request.getCreatedBy());
        return projectMapper.toResponse(projectRepository.save(project));
    }
}
