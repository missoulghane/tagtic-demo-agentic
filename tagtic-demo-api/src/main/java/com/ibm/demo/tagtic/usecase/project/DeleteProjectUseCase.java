package com.ibm.demo.tagtic.usecase.project;

import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DeleteProjectUseCase {

    private final AnnotationProjectRepository projectRepository;

    @Transactional
    public void execute(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Project", id);
        }
        projectRepository.deleteById(id);
    }
}
