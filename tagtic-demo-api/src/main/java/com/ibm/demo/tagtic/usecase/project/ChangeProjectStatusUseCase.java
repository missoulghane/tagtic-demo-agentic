package com.ibm.demo.tagtic.usecase.project;

import com.ibm.demo.tagtic.dto.response.ProjectResponse;
import com.ibm.demo.tagtic.entity.AnnotationProject;
import com.ibm.demo.tagtic.entity.ProjectStatus;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.ProjectMapper;
import com.ibm.demo.tagtic.repository.AnnotationFormRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import com.ibm.demo.tagtic.repository.AnnotationRepository;
import com.ibm.demo.tagtic.repository.FormFieldRepository;
import com.ibm.demo.tagtic.repository.ProjectImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

import static com.ibm.demo.tagtic.entity.ProjectStatus.*;

@Component
@RequiredArgsConstructor
public class ChangeProjectStatusUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final AnnotationFormRepository formRepository;
    private final FormFieldRepository fieldRepository;
    private final ProjectImageRepository imageRepository;
    private final AnnotationRepository annotationRepository;
    private final ProjectMapper projectMapper;

    @Transactional
    public ProjectResponse execute(UUID id, ProjectStatus target) {
        var project = projectRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Project", id));

        validateTransition(project, target);
        project.setStatus(target);
        return projectMapper.toResponse(projectRepository.save(project));
    }

    public void validateTransition(AnnotationProject project, ProjectStatus target) {
        ProjectStatus current = project.getStatus();

        if (!getAllowedTargets(current).contains(target)) {
            throw new BusinessException("INVALID_TRANSITION",
                    "Cannot transition project from " + current + " to " + target);
        }

        switch (target) {
            case READY -> {
                var form = formRepository.findByProjectId(project.getId())
                        .orElseThrow(() -> new BusinessException("NO_FORM",
                                "Project must have a form to become READY"));
                if (fieldRepository.countByFormId(form.getId()) == 0) {
                    throw new BusinessException("NO_FIELDS",
                            "Form must have at least one field to become READY");
                }
            }
            case IN_PROGRESS -> {
                if (annotationRepository.countByProjectId(project.getId()) == 0) {
                    throw new BusinessException("NO_ANNOTATIONS",
                            "At least one annotation must exist to become IN_PROGRESS");
                }
            }
            case COMPLETED -> {
                long imageCount = imageRepository.countByProjectId(project.getId());
                long annotationCount = annotationRepository.countByProjectId(project.getId());
                if (imageCount == 0 || imageCount != annotationCount) {
                    throw new BusinessException("NOT_ALL_ANNOTATED",
                            "All images must be annotated before marking project as COMPLETED");
                }
            }
            default -> { /* ARCHIVED has no conditions */ }
        }
    }

    private Set<ProjectStatus> getAllowedTargets(ProjectStatus current) {
        return switch (current) {
            case DRAFT -> Set.of(READY, ARCHIVED);
            case READY -> Set.of(IN_PROGRESS, ARCHIVED);
            case IN_PROGRESS -> Set.of(COMPLETED, ARCHIVED);
            case COMPLETED -> Set.of(ARCHIVED);
            case ARCHIVED -> Set.of();
        };
    }
}
