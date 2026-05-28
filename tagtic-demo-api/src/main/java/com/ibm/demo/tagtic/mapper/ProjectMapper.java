package com.ibm.demo.tagtic.mapper;

import com.ibm.demo.tagtic.dto.response.ProjectResponse;
import com.ibm.demo.tagtic.entity.AnnotationProject;
import org.mapstruct.Mapper;

@Mapper
public interface ProjectMapper {

    ProjectResponse toResponse(AnnotationProject project);
}
