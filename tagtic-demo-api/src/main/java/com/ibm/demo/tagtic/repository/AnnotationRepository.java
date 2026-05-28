package com.ibm.demo.tagtic.repository;

import com.ibm.demo.tagtic.entity.Annotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnnotationRepository extends JpaRepository<Annotation, UUID> {

    List<Annotation> findByProjectId(UUID projectId);

    Optional<Annotation> findByImageId(UUID imageId);

    boolean existsByImageId(UUID imageId);

    long countByProjectId(UUID projectId);
}
