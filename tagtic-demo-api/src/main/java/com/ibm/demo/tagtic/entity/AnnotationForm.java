package com.ibm.demo.tagtic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "annotation_form")
@Getter
@Setter
@NoArgsConstructor
public class AnnotationForm {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // UNIQUE → enforces 1-1 relation; no formId on AnnotationProject to avoid chicken-and-egg
    @Column(name = "project_id", nullable = false, unique = true)
    private UUID projectId;

    private String title;

    private String description;

    @Column(nullable = false)
    private Integer version = 1;

    private String createdBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
