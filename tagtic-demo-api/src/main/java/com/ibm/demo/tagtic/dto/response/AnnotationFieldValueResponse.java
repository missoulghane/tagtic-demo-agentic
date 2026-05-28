package com.ibm.demo.tagtic.dto.response;

import com.ibm.demo.tagtic.entity.FieldType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationFieldValueResponse {
    private UUID id;
    private UUID formFieldId;
    private String fieldName;
    private String fieldLabel;
    private FieldType fieldType;
    private String value;
    private Boolean autoFilled;
    private String sourceMetadataKey;
}
