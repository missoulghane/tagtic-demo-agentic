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
public class PrefilledFieldResponse {
    private UUID formFieldId;
    private String name;
    private String label;
    private FieldType type;
    private Boolean required;
    private String value;
    private Boolean autoFilled;
}
