package com.ibm.demo.tagtic.repository;

import com.ibm.demo.tagtic.entity.ProjectImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, UUID> {

    Page<ProjectImage> findByProjectId(UUID projectId, Pageable pageable);

    List<ProjectImage> findByProjectId(UUID projectId);

    long countByProjectId(UUID projectId);
}
