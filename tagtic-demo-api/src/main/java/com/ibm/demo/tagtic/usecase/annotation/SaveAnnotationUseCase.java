package com.ibm.demo.tagtic.usecase.annotation;

import com.ibm.demo.tagtic.dto.request.AnnotationFieldValueRequest;
import com.ibm.demo.tagtic.dto.request.CreateAnnotationRequest;
import com.ibm.demo.tagtic.dto.response.AnnotationResponse;
import com.ibm.demo.tagtic.entity.*;
import com.ibm.demo.tagtic.exception.BusinessException;
import com.ibm.demo.tagtic.exception.ResourceNotFoundException;
import com.ibm.demo.tagtic.mapper.AnnotationMapper;
import com.ibm.demo.tagtic.repository.*;
import com.ibm.demo.tagtic.validation.FieldValueValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static com.ibm.demo.tagtic.entity.ProjectStatus.*;

@Component
@RequiredArgsConstructor
public class SaveAnnotationUseCase {

    private final AnnotationProjectRepository projectRepository;
    private final ProjectImageRepository imageRepository;
    private final AnnotationFormRepository formRepository;
    private final FormFieldRepository fieldRepository;
    private final AnnotationRepository annotationRepository;
    private final AnnotationFieldValueRepository fieldValueRepository;
    private final AnnotationMapper annotationMapper;
    private final FieldValueValidator fieldValueValidator;

    @Transactional
    public AnnotationResponse execute(UUID projectId, UUID imageId, CreateAnnotationRequest request) {
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> ResourceNotFoundException.of("Project", projectId));

        if (project.getStatus() != READY && project.getStatus() != IN_PROGRESS) {
            throw new BusinessException("PROJECT_NOT_ANNOTATABLE",
                    "Annotations can only be created for projects in READY or IN_PROGRESS status");
        }

        var image = imageRepository.findById(imageId)
                .orElseThrow(() -> ResourceNotFoundException.of("Image", imageId));
        if (!image.getProjectId().equals(projectId)) {
            throw new BusinessException("IMAGE_NOT_IN_PROJECT", "Image does not belong to this project");
        }
        if (annotationRepository.existsByImageId(imageId)) {
            throw new BusinessException("ANNOTATION_EXISTS", "Image has already been annotated");
        }

        var form = formRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No form found for project " + projectId));

        // Build annotation
        Annotation annotation = new Annotation();
        annotation.setProjectId(projectId);
        annotation.setImageId(imageId);
        annotation.setAnnotatedBy(request.getAnnotatedBy());
        annotation = annotationRepository.save(annotation);

        // Build field values with type validation pipeline
        List<AnnotationFieldValue> fieldValues = new ArrayList<>();
        for (AnnotationFieldValueRequest fieldReq : request.getFields()) {
            FormField formField = fieldRepository.findById(fieldReq.getFormFieldId())
                    .orElseThrow(() -> ResourceNotFoundException.of("FormField", fieldReq.getFormFieldId()));
            if (!formField.getFormId().equals(form.getId())) {
                throw new BusinessException("FIELD_NOT_IN_FORM",
                        "Field " + formField.getId() + " does not belong to this project's form");
            }

            // Validation pipeline: parse → validate rules → re-serialize as String
            String validatedValue = fieldValueValidator.validateAndNormalize(
                    fieldReq.getValue(), formField.getType(), formField.getValidationRules(),
                    formField.getName());

            AnnotationFieldValue fv = new AnnotationFieldValue();
            fv.setAnnotationId(annotation.getId());
            fv.setFormFieldId(formField.getId());
            fv.setFieldName(formField.getName());
            fv.setFieldLabel(formField.getLabel());
            fv.setFieldType(formField.getType());
            fv.setValue(validatedValue);
            fv.setAutoFilled(false);
            fieldValues.add(fv);
        }

        fieldValues = fieldValueRepository.saveAll(fieldValues);

        // Auto-transition: READY → IN_PROGRESS on first annotation
        if (project.getStatus() == READY) {
            project.setStatus(IN_PROGRESS);
            projectRepository.save(project);
        }

        // Auto-transition: IN_PROGRESS → COMPLETED when all images are annotated
        long totalImages = imageRepository.countByProjectId(projectId);
        long totalAnnotations = annotationRepository.countByProjectId(projectId);
        if (totalImages > 0 && totalImages == totalAnnotations && project.getStatus() == IN_PROGRESS) {
            project.setStatus(COMPLETED);
            projectRepository.save(project);
        }

        return annotationMapper.toResponseWithFields(annotation, fieldValues);
    }
}
