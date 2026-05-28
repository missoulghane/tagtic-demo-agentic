package com.ibm.demo.tagtic.usecase.project;

import com.ibm.demo.tagtic.dto.response.ProjectResponse;
import com.ibm.demo.tagtic.mapper.ProjectMapper;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ListProjectsUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Transactional(readOnly = true)
    public List<ProjectResponse> execute() {
        return projectRepository.findAll().stream()
                .map(projectMapper::toResponse)
                .toList();
    }
}
