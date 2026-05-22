package vn.edu.husc.taphoa2hand_backend.specification;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import vn.edu.husc.taphoa2hand_backend.dto.request.ReportDTO.ReportFilterRequest;
import vn.edu.husc.taphoa2hand_backend.entity.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReportSpecification {

    private static final DateTimeFormatter DT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static Specification<Report> build(ReportFilterRequest req) {
        Specification<Report> spec = Specification.where(null);

        if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
            String kw = "%" + req.getKeyword().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> {
                Join<Report, Users> reporter = root.join("reporter");
                Join<Report, Users> reportedUser = root.join("reportedUser", jakarta.persistence.criteria.JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(root.get("id")), kw),
                        cb.like(cb.lower(root.get("detail")), kw),
                        cb.like(cb.lower(reporter.get("fullName")), kw),
                        cb.like(cb.lower(reportedUser.get("fullName")), kw),
                        cb.like(cb.lower(root.get("reason").as(String.class)), kw)
                );
            });
        }

        if (req.getStatus() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), req.getStatus()));
        }

        if (req.getType() != null && !req.getType().isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("type"), ReportTypeEnum.valueOf(req.getType())));
        }

        if (req.getFromDate() != null && !req.getFromDate().isBlank()) {
            LocalDateTime from = LocalDateTime.parse(req.getFromDate() + "T00:00:00");
            spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }

        if (req.getToDate() != null && !req.getToDate().isBlank()) {
            LocalDateTime to = LocalDateTime.parse(req.getToDate() + "T23:59:59");
            spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        return spec;
    }
}
