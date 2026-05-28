package com.ibm.demo.tagtic.mapper;

import com.ibm.demo.tagtic.dto.response.FormFieldResponse;
import com.ibm.demo.tagtic.dto.response.FormResponse;
import com.ibm.demo.tagtic.entity.AnnotationForm;
import com.ibm.demo.tagtic.entity.FormField;
import org.mapstruct.Mapper;

@Mapper
public interface FormMapper {

    FormResponse toResponse(AnnotationForm form);

    FormFieldResponse toResponse(FormField field);
}
