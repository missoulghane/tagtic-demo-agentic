package com.ibm.demo.tagtic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "annotation")
@Getter
@Setter
@NoArgsConstructor
public class Annotation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    // UNIQUE → one final annotation per image; rejects concurrent duplicates at DB level
    @Column(name = "image_id", nullable = false, unique = true)
    private UUID imageId;

    private String annotatedBy;

    private Instant annotatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnotationStatus status = AnnotationStatus.PENDING;

    @PrePersist
    protected void onCreate() {
        annotatedAt = Instant.now();
    }
}
