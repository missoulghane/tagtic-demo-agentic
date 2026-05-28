package com.ibm.demo.tagtic.repository;

import com.ibm.demo.tagtic.entity.AnnotationFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnnotationFieldValueRepository extends JpaRepository<AnnotationFieldValue, UUID> {

    List<AnnotationFieldValue> findByAnnotationId(UUID annotationId);
}
