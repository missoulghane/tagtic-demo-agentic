package com.ibm.demo.tagtic.dto.request;

import com.ibm.demo.tagtic.entity.ProjectStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChangeStatusRequest {

    @NotNull(message = "Status is required")
    private ProjectStatus status;
}
