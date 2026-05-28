package com.ibm.demo.tagtic.mapper;

import com.ibm.demo.tagtic.dto.response.AnnotationFieldValueResponse;
import com.ibm.demo.tagtic.dto.response.AnnotationResponse;
import com.ibm.demo.tagtic.entity.Annotation;
import com.ibm.demo.tagtic.entity.AnnotationFieldValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface AnnotationMapper {

    @Mapping(target = "fields", ignore = true)
    AnnotationResponse toResponse(Annotation annotation);

    AnnotationFieldValueResponse toResponse(AnnotationFieldValue value);

    default AnnotationResponse toResponseWithFields(Annotation annotation, List<AnnotationFieldValue> values) {
        AnnotationResponse response = toResponse(annotation);
        response.setFields(values.stream().map(this::toResponse).toList());
        return response;
    }
}
