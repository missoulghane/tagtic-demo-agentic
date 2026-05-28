package com.ibm.demo.tagtic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "annotation_field_value")
@Getter
@Setter
@NoArgsConstructor
public class AnnotationFieldValue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "annotation_id", nullable = false)
    private UUID annotationId;

    @Column(name = "form_field_id", nullable = false)
    private UUID formFieldId;

    // Snapshots of field definition at annotation time — preserved even if form changes later
    private String fieldName;
    private String fieldLabel;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(255)")
    private FieldType fieldType;

    // Stored as plain String; fieldType drives typed conversion on the applicative side
    @Column(name = "field_value")
    private String value;

    private Boolean autoFilled = false;
    private String sourceMetadataKey;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
