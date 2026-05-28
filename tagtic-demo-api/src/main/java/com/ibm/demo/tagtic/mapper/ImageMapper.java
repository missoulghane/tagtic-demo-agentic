package com.ibm.demo.tagtic.mapper;

import com.ibm.demo.tagtic.dto.response.ImageResponse;
import com.ibm.demo.tagtic.entity.ProjectImage;
import org.mapstruct.Mapper;

@Mapper
public interface ImageMapper {

    ImageResponse toResponse(ProjectImage image);
}
