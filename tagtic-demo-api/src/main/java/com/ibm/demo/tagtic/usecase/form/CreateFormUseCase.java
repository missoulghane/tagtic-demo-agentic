package com.ibm.demo.tagtic.usecase.form;

import com.ibm.demo.tagtic.dto.request.CreateFormRequest;
import com.ibm.demo.tagtic.dto.response.FormResponse;
import com.ibm.demo.tagtic.entity.AnnotationForm;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.FormMapper;
import com.ibm.demo.tagtic.repository.AnnotationFormRepository;
import com.ibm.demo.tagtic.repository.AnnotationProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CreateFormUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final AnnotationFormRepository formRepository;
    private final FormMapper formMapper;

    @Transactional
    public FormResponse execute(UUID projectId, CreateFormRequest request) {
        if (!projectRepository.existsById(projectId)) {
            throw ResourceNotFoundException.of("Project", projectId);
        }
        if (formRepository.existsByProjectId(projectId)) {
            throw new BusinessException("FORM_ALREADY_EXISTS",
                    "A form already exists for project " + projectId);
        }
        AnnotationForm form = new AnnotationForm();
        form.setProjectId(projectId);
        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setCreatedBy(request.getCreatedBy());
        return formMapper.toResponse(formRepository.save(form));
    }
}
