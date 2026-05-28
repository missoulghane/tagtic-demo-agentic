package com.ibm.demo.tagtic.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String createdBy;
}
